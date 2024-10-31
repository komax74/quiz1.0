import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, AlertCircle } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useQuizzes } from '../hooks/useQuizzes';
import { useUsers } from '../hooks/useUsers';
import { useScores } from '../hooks/useScores';

export default function StartPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { dispatch } = useQuiz();
  const { quizzes, loading: quizzesLoading, updateQuiz } = useQuizzes();
  const { checkNameExists, createUser, loading: userLoading } = useUsers();
  const { getUserScore } = useScores();
  
  const [name, setName] = useState('');
  const [isTeam, setIsTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState(['', '']);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadQuiz = async () => {
      if (!quizzesLoading && quizId) {
        console.log('Loading quiz:', { quizId });
        const currentQuiz = quizzes.find(q => q.id === quizId);
        
        if (currentQuiz) {
          if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
            console.error('Quiz has no questions');
            setError('Questo quiz non è disponibile al momento. Riprova più tardi.');
            setTimeout(() => navigate('/'), 3000);
            return;
          }
          
          if (!currentQuiz.isActive) {
            console.error('Quiz is not active');
            setError('Questo quiz non è attualmente attivo. Riprova più tardi.');
            setTimeout(() => navigate('/'), 3000);
            return;
          }
          
          setQuiz(currentQuiz);
          dispatch({ type: 'RESET_QUIZ' });
        } else {
          console.error('Quiz not found');
          setError('Quiz non trovato');
          setTimeout(() => navigate('/'), 3000);
        }
      }
    };

    loadQuiz();
  }, [quizId, quizzes, quizzesLoading, navigate, dispatch]);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Inserisci un nome');
      return false;
    }

    if (name.length < 2) {
      setError('Il nome deve contenere almeno 2 caratteri');
      return false;
    }

    if (name.length > 50) {
      setError('Il nome non può superare i 50 caratteri');
      return false;
    }

    if (isTeam) {
      const validTeamMembers = teamMembers.filter(member => member.trim());
      if (validTeamMembers.length < 2) {
        setError('La squadra deve avere almeno 2 membri');
        return false;
      }

      for (const member of validTeamMembers) {
        if (member.length < 2) {
          setError('I nomi dei membri devono contenere almeno 2 caratteri');
          return false;
        }
        if (member.length > 50) {
          setError('I nomi dei membri non possono superare i 50 caratteri');
          return false;
        }
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (submitting) {
        console.log('Form already submitting, preventing double submission');
        return;
      }

      setSubmitting(true);
      setError('');

      if (!validateForm()) {
        setSubmitting(false);
        return;
      }

      console.log('Submitting form:', { name, isTeam, teamMembers });

      // Check if user exists and has already played
      const nameExists = await checkNameExists(name);
      console.log('Name exists check:', nameExists);

      if (nameExists) {
        const user = await createUser(name, isTeam, isTeam ? teamMembers.filter(member => member.trim()) : undefined);
        const existingScore = await getUserScore(user.id, quizId);
        
        if (existingScore) {
          setError('Hai già completato questo quiz');
          setSubmitting(false);
          return;
        }
      }
      
      // Create or get user
      const user = await createUser(
        name,
        isTeam,
        isTeam ? teamMembers.filter(member => member.trim()) : undefined
      );
      console.log('User created/retrieved:', user);
      
      // Update quiz state
      dispatch({
        type: 'SET_PLAYER_INFO',
        payload: { 
          userId: user.id,
          name, 
          isTeam, 
          teamMembers: isTeam ? teamMembers.filter(member => member.trim()) : [] 
        }
      });

      if (quiz) {
        // Update participants count
        await updateQuiz(quiz.id, {
          ...quiz,
          participantsCount: (quiz.participantsCount || 0) + 1
        });
        
        // Navigate to questions
        navigate(`/quiz/${quizId}/questions`);
      } else {
        throw new Error('Quiz not found when trying to update participants count');
      }
    } catch (err) {
      console.error('Error in form submission:', err);
      setError(err.message || 'Si è verificato un errore. Riprova.');
    } finally {
      setSubmitting(false);
    }
  };

  if (quizzesLoading || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <Brain className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {quiz?.title || 'Caricamento...'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Inserisci i tuoi dati per iniziare il quiz
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {isTeam ? 'Nome Squadra' : 'Nome Giocatore'}
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError('');
                  }}
                  disabled={submitting}
                  className="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="isTeam"
                type="checkbox"
                checked={isTeam}
                onChange={(e) => {
                  setIsTeam(e.target.checked);
                  if (e.target.checked) {
                    setTeamMembers(['', '']);
                  } else {
                    setTeamMembers([]);
                  }
                  setError('');
                }}
                disabled={submitting}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:cursor-not-allowed"
              />
              <label htmlFor="isTeam" className="ml-2 block text-sm text-gray-900">
                Partecipa come squadra
              </label>
            </div>

            {isTeam && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Membri della Squadra (minimo 2)
                </label>
                {teamMembers.map((member, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={member}
                      onChange={(e) => {
                        const newMembers = [...teamMembers];
                        newMembers[index] = e.target.value;
                        setTeamMembers(newMembers);
                        setError('');
                      }}
                      disabled={submitting}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      placeholder={`Membro ${index + 1}`}
                      required={index < 2}
                    />
                    {teamMembers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => {
                          setTeamMembers(teamMembers.filter((_, i) => i !== index));
                          setError('');
                        }}
                        disabled={submitting}
                        className="text-red-600 hover:text-red-700 disabled:text-red-300 disabled:cursor-not-allowed"
                      >
                        Rimuovi
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setTeamMembers([...teamMembers, ''])}
                  disabled={submitting}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium disabled:text-indigo-300 disabled:cursor-not-allowed"
                >
                  + Aggiungi membro
                </button>
              </div>
            )}

            {error && (
              <div className="flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-md">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              submitting
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            {submitting ? 'Caricamento...' : 'Inizia Quiz'}
          </button>
        </form>
      </div>
    </div>
  );
}