import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { useQuizzes } from '../hooks/useQuizzes';
import { useScores } from '../hooks/useScores';

interface LeaderboardEntry {
  user: {
    name: string;
    is_team: boolean;
    team_members: string | null;
  };
  score: number;
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { quizzes } = useQuizzes();
  const { getLeaderboard } = useScores();
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

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="mt-2 text-sm text-gray-600">
              {quiz.participantsCount} partecipanti
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla home
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Classifica completa</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <div
                key={index}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8">
                    {getMedalIcon(index)}
                  </div>
                  <div>
                    <button
                      onClick={() => navigate(`/player/${entry.user.name}`)}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
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
                <div className="text-sm font-semibold text-indigo-600">
                  {entry.score} punti
                </div>
              </div>
            ))}

            {leaderboard.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                Nessun punteggio disponibile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}