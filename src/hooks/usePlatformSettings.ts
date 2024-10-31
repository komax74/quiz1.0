import { useState, useEffect } from 'react';
import { supabase, withRetry, handleSupabaseError } from '../lib/supabase';

interface PlatformSettings {
  logo: string;
  logoHeight: number;
  platformName: string;
  welcomeTitle: string;
  welcomeSubtitle: string;
  homeIcon: string;
  homeIconHeight: number;
  correctAnswerScore: number;
  incorrectAnswerScore: number;
}

const defaultSettings: PlatformSettings = {
  logo: '',
  logoHeight: 32,
  platformName: 'BrainQuest',
  welcomeTitle: 'Welcome to BrainQuest',
  welcomeSubtitle: 'Choose a quiz and test your knowledge',
  homeIcon: '',
  homeIconHeight: 64,
  correctAnswerScore: 5,
  incorrectAnswerScore: -2,
};

export function usePlatformSettings() {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await withRetry(async () => {
        return await supabase
          .from('platform_settings')
          .select('*')
          .eq('id', 1)
          .single();
      });

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          await createDefaultSettings();
          return;
        }
        throw fetchError;
      }

      if (data) {
        setSettings({
          logo: data.logo || defaultSettings.logo,
          logoHeight: data.logo_height || defaultSettings.logoHeight,
          platformName: data.platform_name || defaultSettings.platformName,
          welcomeTitle: data.welcome_title || defaultSettings.welcomeTitle,
          welcomeSubtitle: data.welcome_subtitle || defaultSettings.welcomeSubtitle,
          homeIcon: data.home_icon || defaultSettings.homeIcon,
          homeIconHeight: data.home_icon_height || defaultSettings.homeIconHeight,
          correctAnswerScore: data.correct_answer_score || defaultSettings.correctAnswerScore,
          incorrectAnswerScore: data.incorrect_answer_score || defaultSettings.incorrectAnswerScore,
        });
      }
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const { error: insertError } = await withRetry(async () => {
        return await supabase
          .from('platform_settings')
          .insert([{
            id: 1,
            logo: defaultSettings.logo,
            logo_height: defaultSettings.logoHeight,
            platform_name: defaultSettings.platformName,
            welcome_title: defaultSettings.welcomeTitle,
            welcome_subtitle: defaultSettings.welcomeSubtitle,
            home_icon: defaultSettings.homeIcon,
            home_icon_height: defaultSettings.homeIconHeight,
            correct_answer_score: defaultSettings.correctAnswerScore,
            incorrect_answer_score: defaultSettings.incorrectAnswerScore,
          }]);
      });

      if (insertError) throw insertError;
      setSettings(defaultSettings);
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      setError(null);
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error: updateError } = await withRetry(async () => {
        return await supabase
          .from('platform_settings')
          .update({
            logo: updatedSettings.logo,
            logo_height: updatedSettings.logoHeight,
            platform_name: updatedSettings.platformName,
            welcome_title: updatedSettings.welcomeTitle,
            welcome_subtitle: updatedSettings.welcomeSubtitle,
            home_icon: updatedSettings.homeIcon,
            home_icon_height: updatedSettings.homeIconHeight,
            correct_answer_score: updatedSettings.correctAnswerScore,
            incorrect_answer_score: updatedSettings.incorrectAnswerScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', 1);
      });

      if (updateError) throw updateError;
      setSettings(updatedSettings);
      return updatedSettings;
    } catch (err) {
      const error = handleSupabaseError(err);
      setError(error.message);
      throw error;
    }
  };

  return {
    settings,
    loading,
    error,
    updateSettings,
  };
}