import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Trophy, Medal } from 'lucide-react';
import { usePlatformSettingsContext } from '../context/PlatformSettingsContext';
import { useQuizzes } from '../hooks/useQuizzes';
import { useScores } from '../hooks/useScores';

interface TopScore {
  user: {
    name: string;
    is_team: boolean;
    team_members: string | null;
  };
  score: number;
}

export default function HomePage() {
  const navigate = useNavigate();
  const { settings } = usePlatformSettingsContext();
  const { quizzes, loading } = useQuizzes();
  const { getLeaderboard } = useScores();
  const [topScores, setTopScores] = useState<Record<string, TopScore[]>>({});
  const activeQuizzes = quizzes.filter(quiz => quiz.isActive && quiz.questions?.length > 0);

  useEffect(() => {
    const fetchTopScores = async () => {
      const scores: Record<string, TopScore[]> = {};
      for (const quiz of activeQuizzes) {
        try {
          const leaderboard = await getLeaderboard(quiz.id);
          scores[quiz.id] = leaderboard.slice(0, 3);
        } catch (error) {
          console.error(`Error fetching leaderboard for quiz ${quiz.id}:`, error);
          scores[quiz.id] = [];
        }
      }
      setTopScores(scores);
    };

    if (activeQuizzes.length > 0) {
      fetchTopScores();
    }
  }, [activeQuizzes]);

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        {settings.homeIcon ? (
          <img
            src={settings.homeIcon}
            alt="Home icon"
            style={{ height: `${settings.homeIconHeight}px` }}
            className="mx-auto object-contain"
          />
        ) : (
          <Brain className="mx-auto h-16 w-16 text-indigo-600" />
        )}
        <h1 className="mt-4 text-4xl font-extrabold text-gray-900">
          {settings.welcomeTitle || 'Welcome to BrainQuest'}
        </h1>
        <p className="mt-2 text-lg text-gray-600">
          {settings.welcomeSubtitle || 'Choose a quiz and test your knowledge'}
        </p>

        <button
          onClick={() => navigate('/global-leaderboard')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Trophy className="h-5 w-5 mr-2" />
          Visualizza la classifica dei giocatori
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {activeQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={quiz.imageUrl}
              alt={quiz.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {quiz.title}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {quiz.participantsCount || 0} partecipanti
              </p>

              {/* Top 3 Players */}
              {topScores[quiz.id]?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Top 3</h4>
                  <div className="space-y-2">
                    {topScores[quiz.id].map((score, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getMedalIcon(index)}
                          <button
                            onClick={() => navigate(`/player/${score.user.name}`)}
                            className="ml-2 text-sm text-gray-900 hover:text-indigo-600"
                          >
                            {score.user.name}
                          </button>
                        </div>
                        <span className="text-sm font-medium text-indigo-600">
                          {score.score} punti
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col space-y-2">
                <button
                  onClick={() => navigate(`/quiz/${quiz.id}`)}
                  className="w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Inizia il Quiz
                </button>
                <button
                  onClick={() => navigate(`/quiz/${quiz.id}/leaderboard`)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Visualizza la classifica completa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activeQuizzes.length === 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-500">Nessun quiz disponibile al momento.</p>
        </div>
      )}
    </div>
  );
}