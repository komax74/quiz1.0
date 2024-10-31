import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, Circle } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useQuizzes } from '../hooks/useQuizzes';
import { useScores } from '../hooks/useScores';
import { usePlatformSettingsContext } from '../context/PlatformSettingsContext';

export default function QuizPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { state, dispatch } = useQuiz();
  const { quizzes, loading } = useQuizzes();
  const { saveScore } = useScores();
  const { settings } = usePlatformSettingsContext();
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [currentScore, setCurrentScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [quiz, setQuiz] = useState(null);

  useEffect(() => {
    if (!loading && quizId) {
      const currentQuiz = quizzes.find(q => q.id === quizId);
      if (currentQuiz && currentQuiz.questions?.length > 0) {
        setQuiz(currentQuiz);
      } else {
        navigate('/');
      }
    }
  }, [quizId, quizzes, loading, navigate]);

  if (loading || !quiz || !quiz.questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleAnswerToggle = (answerIndex: number) => {
    setSelectedAnswers(prev => {
      if (prev.includes(answerIndex)) {
        return prev.filter(i => i !== answerIndex);
      } else {
        return [...prev, answerIndex];
      }
    });
  };

  const calculateScore = async () => {
    const currentQuestion = quiz.questions[state.currentQuestion];
    const correctAnswers = new Set(currentQuestion.correctAnswers);
    
    // Calculate points for this question
    let questionScore = 0;
    
    // Add points for correct answers
    selectedAnswers.forEach(answer => {
      if (correctAnswers.has(answer)) {
        questionScore += settings.correctAnswerScore;
      } else {
        questionScore += settings.incorrectAnswerScore;
      }
    });

    // Calculate new total score (don't let it go below 0)
    const newTotalScore = Math.max(0, currentScore + questionScore);

    // Update answers record
    const newAnswers = {
      ...answers,
      [state.currentQuestion]: selectedAnswers
    };

    // Save to state
    setCurrentScore(newTotalScore);
    setAnswers(newAnswers);

    try {
      // Save to database even if score is 0
      await saveScore(
        state.userId,
        quizId,
        newTotalScore,
        newAnswers
      );
    } catch (error) {
      console.error('Error saving score:', error);
    }

    return newTotalScore;
  };

  const handleNext = async () => {
    // Save current question's answers
    dispatch({
      type: 'SET_ANSWER',
      payload: { questionId: state.currentQuestion, selectedAnswers }
    });

    // Calculate and save score
    const newScore = await calculateScore();
    dispatch({ type: 'SET_SCORE', payload: newScore });

    if (state.currentQuestion === quiz.questions.length - 1) {
      // If this was the last question, navigate to results regardless of score
      navigate(`/quiz/${quizId}/results`);
    } else {
      // Move to next question
      dispatch({ type: 'NEXT_QUESTION' });
      setSelectedAnswers([]);
    }
  };

  const currentQuestion = quiz.questions[state.currentQuestion];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-500">
            Question {state.currentQuestion + 1} of {quiz.questions.length}
          </span>
          <div className="w-64 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{
                width: `${((state.currentQuestion + 1) / quiz.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">{currentQuestion.text}</h2>

          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerToggle(index)}
                className={`w-full flex items-center p-4 ${
                  selectedAnswers.includes(index)
                    ? 'bg-indigo-50 border-indigo-600'
                    : 'bg-white border-gray-300'
                } border-2 rounded-lg hover:bg-indigo-50 transition-colors duration-150`}
              >
                {selectedAnswers.includes(index) ? (
                  <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-3" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 mr-3" />
                )}
                <span className="text-gray-900">{option}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={selectedAnswers.length === 0}
            className={`px-6 py-2 rounded-md text-white font-medium ${
              selectedAnswers.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {state.currentQuestion === quiz.questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}