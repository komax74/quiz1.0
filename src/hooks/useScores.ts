import { useState, useCallback } from 'react';
import { supabase, withRetry, handleSupabaseError } from '../lib/supabase';

interface Score {
  id: string;
  user_id: string;
  quiz_id: string;
  score: number;
  answers: Record<string, number[]>;
  user?: {
    name: string;
    is_team: boolean;
    team_members: string | null;
  };
}

interface GlobalLeaderboardEntry {
  name: string;
  is_team: boolean;
  team_members: string | null;
  total_score: number;
  quizzes_played: number;
}

interface PlayerStats {
  name: string;
  is_team: boolean;
  team_members: string | null;
  total_score: number;
  quizzes_played: number;
  quiz_scores: Array<{
    quiz_id: string;
    quiz_title: string;
    score: number;
    rank: number;
  }>;
}

export function useScores() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearQuizScores = useCallback(async (quizId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Delete all scores for the quiz
      const { error: deleteError } = await supabase
        .from('scores')
        .delete()
        .eq('quiz_id', quizId);

      if (deleteError) throw deleteError;

      // Update quiz participants count
      const { error: updateError } = await supabase
        .from('quizzes')
        .update({ 
          participants_count: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId);

      if (updateError) throw updateError;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const saveScore = useCallback(async (
    userId: string,
    quizId: string,
    score: number,
    answers: Record<string, number[]>
  ): Promise<Score> => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('scores')
          .upsert([{
            user_id: userId,
            quiz_id: quizId,
            score,
            answers: JSON.stringify(answers)
          }], {
            onConflict: 'user_id,quiz_id'
          })
          .select('*, user:users(*)')
          .single();

        if (error) throw error;
        return data;
      });

      return result;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLeaderboard = useCallback(async (quizId: string): Promise<Score[]> => {
    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('scores')
          .select('*, user:users(*)')
          .eq('quiz_id', quizId)
          .gt('score', 0)
          .order('score', { ascending: false })
          .limit(10);

        if (error) throw error;
        return data || [];
      });

      return result;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserScore = useCallback(async (userId: string, quizId: string): Promise<Score | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .from('scores')
          .select('*')
          .eq('user_id', userId)
          .eq('quiz_id', quizId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        return data;
      });

      return result;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getGlobalLeaderboard = useCallback(async (): Promise<GlobalLeaderboardEntry[]> => {
    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .rpc('get_global_leaderboard');

        if (error) throw error;
        return data || [];
      });

      return result;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPlayerStats = useCallback(async (playerName: string): Promise<PlayerStats | null> => {
    try {
      setLoading(true);
      setError(null);

      const result = await withRetry(async () => {
        const { data, error } = await supabase
          .rpc('get_player_stats', { player_name_param: playerName });

        if (error) throw error;
        if (!data || data.length === 0) return null;
        return data[0];
      });

      return result;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveScore,
    getLeaderboard,
    getUserScore,
    getGlobalLeaderboard,
    getPlayerStats,
    clearQuizScores
  };
}