import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft, AlertCircle } from 'lucide-react';
import { useScores } from '../hooks/useScores';
import { useQuizzes } from '../hooks/useQuizzes';

interface QuizScore {
  quiz_id: string;
  quiz_title: string;
  score: number;
  rank: number;
}

interface PlayerStats {
  name: string;
  is_team: boolean;
  team_members: string | null;
  total_score: number;
  quizzes_played: number;
  quiz_scores: QuizScore[];
}

export default function PlayerStatsPage() {
  const navigate = useNavigate();
  const { playerName } = useParams();
  const { getPlayerStats, loading: statsLoading } = useScores();
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!playerName) {
        setError('Nome giocatore non valido');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching stats for player:', playerName);
        const data = await getPlayerStats(playerName);
        console.log('Received player stats:', data);

        if (!data) {
          setError('Giocatore non trovato');
        } else {
          setStats(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error in PlayerStatsPage:', err);
        setError('Errore nel caricamento delle statistiche del giocatore');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerName, getPlayerStats]);

  if (loading || statsLoading || quizzesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Torna alla home
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Nessuna statistica disponibile</p>
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

  console.log('Rendering player stats:', stats);

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
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
            <h1 className="text-4xl font-bold text-gray-900">{stats.name}</h1>
            {stats.is_team && stats.team_members && (
              <p className="mt-2 text-gray-600">
                Team: {stats.team_members}
              </p>
            )}
            <div className="mt-4 space-y-1">
              <p className="text-xl font-semibold text-indigo-600">
                Punteggio totale: {stats.total_score}
              </p>
              <p className="text-gray-600">
                Quiz completati: {stats.quizzes_played}
              </p>
            </div>
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
            <h2 className="text-lg font-medium text-gray-900">Dettaglio punteggi</h2>
          </div>

          <div className="divide-y divide-gray-200">
            {stats.quiz_scores && stats.quiz_scores.length > 0 ? (
              stats.quiz_scores.map((quizScore) => {
                const quiz = quizzes.find(q => q.id === quizScore.quiz_id);
                console.log('Rendering quiz score:', quizScore);
                return (
                  <div
                    key={quizScore.quiz_id}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-8">
                        {getMedalIcon(quizScore.rank)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {quiz?.title || quizScore.quiz_title || 'Quiz non trovato'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Posizione: {quizScore.rank}°
                        </p>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-indigo-600">
                      {quizScore.score} punti
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Nessun quiz completato
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}