import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Medal, ArrowLeft } from 'lucide-react';
import { useScores } from '../hooks/useScores';

interface PlayerStats {
  name: string;
  is_team: boolean;
  team_members: string | null;
  total_score: number;
  quizzes_played: number;
}

export default function GlobalLeaderboardPage() {
  const navigate = useNavigate();
  const { getGlobalLeaderboard } = useScores();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getGlobalLeaderboard();
        // Filter out players with no quizzes played
        const activePlayers = data.filter(player => player.quizzes_played > 0);
        setPlayers(activePlayers);
      } catch (error) {
        console.error('Error fetching global leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [getGlobalLeaderboard]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Classifica Globale</h1>
            <p className="mt-2 text-gray-600">
              {players.length} giocatori totali
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
          <div className="divide-y divide-gray-200">
            {players.map((player, index) => (
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
                      onClick={() => navigate(`/player/${player.name}`)}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                    >
                      {player.name}
                    </button>
                    {player.is_team && player.team_members && (
                      <p className="text-sm text-gray-500">
                        Team: {player.team_members}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      Quiz completati: {player.quizzes_played}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-indigo-600">
                  {player.total_score} punti
                </div>
              </div>
            ))}

            {players.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                Nessun giocatore presente
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}