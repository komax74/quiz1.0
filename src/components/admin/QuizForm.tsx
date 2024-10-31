import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload, AlertCircle } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuizzes';
import { compressImage } from '../../utils/imageCompression';

export default function QuizForm() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { quizzes, createQuiz, updateQuiz } = useQuizzes();
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState({
    title: '',
    imageUrl: '',
    isActive: false,
    questions: [],
  });

  useEffect(() => {
    if (quizId) {
      const existingQuiz = quizzes.find(q => q.id === quizId);
      if (existingQuiz) {
        // Ensure isActive is false if there are no questions
        setQuiz({
          ...existingQuiz,
          isActive: existingQuiz.questions?.length > 0 ? existingQuiz.isActive : false
        });
      }
    }
  }, [quizId, quizzes]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(reader.result as string);
          setQuiz(prev => ({ ...prev, imageUrl: compressedImage }));
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image. Please try a smaller image.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Force isActive to false if there are no questions
      const hasQuestions = quiz.questions?.length > 0;
      const updatedQuiz = {
        ...quiz,
        isActive: hasQuestions ? quiz.isActive : false
      };

      if (quiz.isActive && !hasQuestions) {
        setError('Cannot activate quiz without questions. Please add questions first.');
        return;
      }

      if (quizId) {
        await updateQuiz(quizId, updatedQuiz);
      } else {
        await createQuiz(updatedQuiz);
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError('An error occurred while saving the quiz.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {quizId ? 'Edit Quiz' : 'Create New Quiz'}
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quiz Title
          </label>
          <input
            type="text"
            required
            value={quiz.title}
            onChange={(e) => setQuiz(prev => ({ ...prev, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Quiz Image
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            {quiz.imageUrl ? (
              <div className="space-y-1 text-center">
                <img
                  src={quiz.imageUrl}
                  alt="Quiz preview"
                  className="mx-auto h-32 w-32 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => setQuiz(prev => ({ ...prev, imageUrl: '' }))}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                    <span>Upload an image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={quiz.isActive}
            disabled={!quiz.questions?.length}
            onChange={(e) => setQuiz(prev => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
            Published {!quiz.questions?.length && '(add questions first)'}
          </label>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            {quizId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  );
}