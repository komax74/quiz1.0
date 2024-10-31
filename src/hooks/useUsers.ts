import { useState } from 'react';
import { supabase, withRetry, handleSupabaseError } from '../lib/supabase';

interface User {
  id: string;
  name: string;
  is_team: boolean;
  team_members?: string[];
}

export function useUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNameExists = async (name: string): Promise<boolean> => {
    try {
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('users')
          .select('id')
          .eq('name', name)
          .maybeSingle();
      });

      if (error) throw error;
      return !!data;
    } catch (err) {
      console.error('Error checking name:', err);
      throw handleSupabaseError(err);
    }
  };

  const createUser = async (name: string, isTeam: boolean, teamMembers?: string[]): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      
      // First check if user exists
      const { data: existingUser, error: fetchError } = await withRetry(async () => {
        return await supabase
          .from('users')
          .select('*')
          .eq('name', name)
          .maybeSingle();
      });

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        return existingUser;
      }

      // Create new user if doesn't exist
      const { data, error } = await withRetry(async () => {
        return await supabase
          .from('users')
          .insert([{
            name,
            is_team: isTeam,
            team_members: teamMembers ? JSON.stringify(teamMembers) : null
          }])
          .select()
          .single();
      });

      if (error) throw error;
      if (!data) throw new Error('No data received from server');

      return data;
    } catch (err) {
      console.error('Error creating user:', err);
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    checkNameExists,
    createUser
  };
}