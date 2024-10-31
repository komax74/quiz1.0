import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Edit, Plus, ListChecks, Eraser } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuizzes';
import { useScores } from '../../hooks/useScores';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function Dashboard() {
  const navigate = useNavigate();
  const { quizzes, loading, deleteQuiz, updateQuiz } = useQuizzes();
  const { clearQuizScores } = useScores();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClearScoresModal, setShowClearScoresModal] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleToggleActive = async (quizId: string, isActive: boolean) => {
    try {
      await updateQuiz(quizId, { isActive: !isActive });
    } catch (error) {
      console.error('Error toggling quiz status:', error);
    }
  };

  const handleDelete = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowDeleteModal(true);
  };

  const handleClearScores = async (quizId: string) => {
    setSelectedQuizId(quizId);
    setShowClearScoresModal(true);
  };

  const confirmDelete = async () => {
    if (selectedQuizId) {
      try {
        await deleteQuiz(selectedQuizId);
      } catch (error) {
        console.error('Error deleting quiz:', error);
      }
    }
    setShowDeleteModal(false);
    setSelectedQuizId(null);
  };

  const confirmClearScores = async () => {
    if (selectedQuizId) {
      try {
        await clearQuizScores(selectedQuizId);
        // Reset participants count to 0
        await updateQuiz(selectedQuizId, { participantsCount: 0 });
      } catch (error) {
        console.error('Error clearing scores:', error);
      }
    }
    setShowClearScoresModal(false);
    setSelectedQuizId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Dashboard</h1>
        <button
          onClick={() => navigate('/admin/quiz/new')}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Quiz
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <img
              src={quiz.imageUrl}
              alt={quiz.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {quiz.participantsCount || 0} participants
              </p>
              
              <div className="mt-4 flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={quiz.isActive}
                    onChange={() => handleToggleActive(quiz.id, quiz.isActive)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600">Active</span>
                </label>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/admin/quiz/edit/${quiz.id}`)}
                    className="p-2 text-gray-600 hover:text-indigo-600"
                    title="Edit Quiz Details"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/admin/quiz/${quiz.id}/questions`)}
                    className="p-2 text-gray-600 hover:text-indigo-600"
                    title="Edit Questions"
                  >
                    <ListChecks className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleClearScores(quiz.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Clear All Scores"
                  >
                    <Eraser className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="p-2 text-gray-600 hover:text-red-600"
                    title="Delete Quiz"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Delete Quiz"
        message="Are you sure you want to delete this quiz? This action cannot be undone and all associated data will be permanently lost."
      />

      <DeleteConfirmationModal
        isOpen={showClearScoresModal}
        onClose={() => setShowClearScoresModal(false)}
        onConfirm={confirmClearScores}
        title="Clear Quiz Scores"
        message="Are you sure you want to clear all scores for this quiz? This action cannot be undone and all participant data will be permanently deleted."
      />
    </div>
  );
}