import { createClient } from '@supabase/supabase-js';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const supabaseUrl = 'https://auyauskosefqkdizgbog.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1eWF1c2tvc2VmcWtkaXpnYm9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMDM4MTAsImV4cCI6MjA0NTg3OTgxMH0.h2NyjR6ixMNZ_O7xHUkp03EV7gHLvAQh_lc0THdP9ZM';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': '*/*'
    }
  },
  db: {
    schema: 'public'
  }
});

// Utility function to handle retries
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    const result = await operation();
    // Only check for null/undefined if the operation is not a delete operation
    if (result === null && !operation.toString().includes('delete')) {
      throw new Error('Operation returned no result');
    }
    return result;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return withRetry(operation, retries - 1);
    }
    throw error;
  }
}

// Utility function to handle Supabase errors
export function handleSupabaseError(error: any): Error {
  console.error('Supabase error:', error);
  
  if (error.code === 'PGRST116') {
    return new Error('Resource not found');
  }
  
  if (error.code === '23505') {
    return new Error('Duplicate record');
  }
  
  if (error.message) {
    return new Error(error.message);
  }
  
  return new Error('An unexpected error occurred');
}