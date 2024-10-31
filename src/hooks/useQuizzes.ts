import { useState, useEffect, useCallback } from 'react';
import { supabase, withRetry, handleSupabaseError } from '../lib/supabase';
import { Quiz } from '../types/quiz';

interface SupabaseQuiz {
  id: string;
  title: string;
  image_url: string;
  is_active: boolean;
  questions: string;
  participants_count: number;
  created_at: string;
  updated_at: string;
}

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatQuiz = (data: SupabaseQuiz): Quiz => {
    try {
      return {
        id: data.id,
        title: data.title || '',
        imageUrl: data.image_url || '',
        isActive: Boolean(data.is_active),
        questions: typeof data.questions === 'string' ? JSON.parse(data.questions) : data.questions || [],
        participantsCount: Number(data.participants_count) || 0
      };
    } catch (err) {
      throw new Error('Invalid quiz data format');
    }
  };

  const fetchQuizzes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: supabaseQuizzes, error: fetchError } = await withRetry(async () => {
        return await supabase
          .from('quizzes')
          .select('*')
          .order('created_at', { ascending: false });
      });

      if (fetchError) throw fetchError;

      const formattedQuizzes = (supabaseQuizzes || []).map(formatQuiz);
      setQuizzes(formattedQuizzes);
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      setQuizzes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const createQuiz = async (quiz: Partial<Quiz>): Promise<Quiz> => {
    try {
      setError(null);
      const newQuiz = {
        title: quiz.title || '',
        image_url: quiz.imageUrl || '',
        is_active: Boolean(quiz.isActive),
        questions: JSON.stringify(quiz.questions || []),
        participants_count: 0
      };

      const { data, error: insertError } = await withRetry(async () => {
        return await supabase
          .from('quizzes')
          .insert([newQuiz])
          .select()
          .single();
      });

      if (insertError) throw insertError;
      if (!data) throw new Error('No data returned from insert operation');

      const formattedQuiz = formatQuiz(data);
      setQuizzes(prev => [formattedQuiz, ...prev]);
      return formattedQuiz;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    }
  };

  const updateQuiz = async (id: string, updates: Partial<Quiz>): Promise<Quiz> => {
    try {
      setError(null);
      const formattedUpdates = {
        title: updates.title,
        image_url: updates.imageUrl,
        is_active: updates.isActive,
        questions: updates.questions ? JSON.stringify(updates.questions) : undefined,
        participants_count: updates.participantsCount,
        updated_at: new Date().toISOString()
      };

      const { data, error: updateError } = await withRetry(async () => {
        return await supabase
          .from('quizzes')
          .update(formattedUpdates)
          .eq('id', id)
          .select()
          .single();
      });

      if (updateError) throw updateError;
      if (!data) throw new Error('No data returned from update operation');

      const formattedQuiz = formatQuiz(data);
      setQuizzes(prev => prev.map(q => (q.id === id ? formattedQuiz : q)));
      return formattedQuiz;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    }
  };

  const deleteQuiz = async (id: string): Promise<void> => {
    try {
      setError(null);

      const { error: scoresError } = await withRetry(async () => {
        return await supabase
          .from('scores')
          .delete()
          .eq('quiz_id', id);
      });

      if (scoresError) throw scoresError;

      const { error: quizError } = await withRetry(async () => {
        return await supabase
          .from('quizzes')
          .delete()
          .eq('id', id);
      });

      if (quizError) throw quizError;

      setQuizzes(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    }
  };

  return {
    quizzes,
    loading,
    error,
    createQuiz,
    updateQuiz,
    deleteQuiz,
    refreshQuizzes: fetchQuizzes,
  };
}