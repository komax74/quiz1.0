import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { useQuiz } from '../context/QuizContext';
import { useScores } from '../hooks/useScores';
import { useQuizzes } from '../hooks/useQuizzes';

interface LeaderboardEntry {
  user: {
    name: string;
    is_team: boolean;
    team_members: string | null;
  };
  score: number;
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { state } = useQuiz();
  const { getLeaderboard } = useScores();
  const { quizzes } = useQuizzes();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (quizId) {
        try {
          const data = await getLeaderboard(quizId);
          setLeaderboard(data);
        } catch (error) {
          console.error('Error fetching leaderboard:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();
  }, [quizId, getLeaderboard]);

  const quiz = quizzes.find(q => q.id === quizId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Quiz non trovato</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full space-y-8">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <Trophy className="mx-auto h-16 w-16 text-yellow-400" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Quiz Completato!</h2>
          <p className="mt-2 text-xl text-gray-600">
            {state.isTeam ? 'Team' : 'Player'}: {state.playerName}
          </p>
          <div className="mt-8">
            <span className="text-5xl font-bold text-indigo-600">{state.score}</span>
            <span className="text-2xl text-gray-600"> punti</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Classifica</h3>
          <div className="space-y-4">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  entry.user.name === state.playerName
                    ? 'bg-indigo-50 border-2 border-indigo-200'
                    : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <Medal className={`h-6 w-6 mr-3 ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-300'
                  }`} />
                  <div>
                    <button
                      onClick={() => navigate(`/player/${entry.user.name}`)}
                      className="font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {entry.user.name}
                    </button>
                    {entry.user.is_team && entry.user.team_members && (
                      <p className="text-sm text-gray-500">
                        Team: {entry.user.team_members}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-indigo-600">{entry.score}</span>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <p className="text-center text-gray-500">Nessun punteggio disponibile</p>
            )}
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Gioca ancora
        </button>
      </div>
    </div>
  );
}