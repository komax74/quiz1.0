import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import { useQuizzes } from '../../hooks/useQuizzes';
import { Question } from '../../types/quiz';

export default function QuestionEditor() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const { quizzes, updateQuiz } = useQuizzes();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      const currentQuiz = quizzes.find(q => q.id === quizId);
      if (currentQuiz) {
        setQuestions(currentQuiz.questions || []);
      }
      setLoading(false);
    }
  }, [quizId, quizzes]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: questions.length,
      text: '',
      options: ['', '', '', '', ''],
      correctAnswers: [],
    };
    setQuestions([...questions, newQuestion]);
  };

  const handleQuestionChange = (index: number, field: keyof Question, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(updatedQuestions);
  };

  const toggleCorrectAnswer = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...questions];
    const correctAnswers = updatedQuestions[questionIndex].correctAnswers;
    
    if (correctAnswers.includes(optionIndex)) {
      updatedQuestions[questionIndex].correctAnswers = correctAnswers.filter(
        i => i !== optionIndex
      );
    } else {
      updatedQuestions[questionIndex].correctAnswers = [...correctAnswers, optionIndex];
    }
    
    setQuestions(updatedQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
  };

  const handleSave = async () => {
    try {
      if (quizId) {
        await updateQuiz(quizId, { questions });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error saving questions:', error);
    }
  };

  const currentQuiz = quizzes.find(q => q.id === quizId);
  if (!currentQuiz) {
    return <div>Quiz not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Questions: {currentQuiz.title}
        </h1>
        <button
          onClick={handleAddQuestion}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Question
        </button>
      </div>

      <div className="space-y-8">
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1 mr-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question {questionIndex + 1}
                </label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Enter question text"
                />
              </div>
              <button
                onClick={() => handleDeleteQuestion(questionIndex)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              {question.options.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-3">
                  <button
                    onClick={() => toggleCorrectAnswer(questionIndex, optionIndex)}
                    className="text-gray-600 hover:text-indigo-600"
                  >
                    {question.correctAnswers.includes(optionIndex) ? (
                      <CheckSquare className="h-5 w-5" />
                    ) : (
                      <Square className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder={`Option ${optionIndex + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-end space-x-4">
        <button
          onClick={() => navigate('/admin/dashboard')}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Save Questions
        </button>
      </div>
    </div>
  );
}