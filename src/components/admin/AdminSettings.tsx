import React, { useState, useEffect } from 'react';
import { Brain, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlatformSettingsContext } from '../../context/PlatformSettingsContext';
import { compressImage } from '../../utils/imageCompression';

export default function AdminSettings() {
  const navigate = useNavigate();
  const { settings, updateSettings, loading } = usePlatformSettingsContext();
  const [error, setError] = useState<string>('');
  const [localSettings, setLocalSettings] = useState({
    logo: '',
    logoHeight: 32,
    platformName: '',
    welcomeTitle: '',
    welcomeSubtitle: '',
    homeIcon: '',
    homeIconHeight: 64,
    correctAnswerScore: 5,
    incorrectAnswerScore: -2,
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        logo: settings.logo || '',
        logoHeight: settings.logoHeight || 32,
        platformName: settings.platformName || '',
        welcomeTitle: settings.welcomeTitle || '',
        welcomeSubtitle: settings.welcomeSubtitle || '',
        homeIcon: settings.homeIcon || '',
        homeIconHeight: settings.homeIconHeight || 64,
        correctAnswerScore: settings.correctAnswerScore || 5,
        incorrectAnswerScore: settings.incorrectAnswerScore || -2,
      });
    }
  }, [settings]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'homeIcon') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const preserveTransparency = file.type === 'image/png';
          const compressedImage = await compressImage(reader.result as string, preserveTransparency);
          setLocalSettings(prev => ({ ...prev, [type]: compressedImage }));
          setHasChanges(true);
          setError('');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image. Please try a different image.');
      }
    }
  };

  const handleTextChange = (field: string, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleNumberChange = (field: string, value: string) => {
    const num = parseInt(value) || 0;
    setLocalSettings(prev => ({ ...prev, [field]: num }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateSettings(localSettings);
      navigate('/admin/dashboard');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
              hasChanges
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Save Changes
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Scoring Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Scoring Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points per Correct Answer
              </label>
              <input
                type="number"
                value={localSettings.correctAnswerScore}
                onChange={(e) => handleNumberChange('correctAnswerScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points per Incorrect Answer
              </label>
              <input
                type="number"
                value={localSettings.incorrectAnswerScore}
                onChange={(e) => handleNumberChange('incorrectAnswerScore', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Header Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Header Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Logo
              </label>
              <div className="flex items-center space-x-4">
                {localSettings.logo ? (
                  <div className="relative">
                    <img
                      src={localSettings.logo}
                      alt="Platform logo"
                      style={{ height: `${localSettings.logoHeight}px` }}
                      className="object-contain"
                    />
                    <button
                      onClick={() => {
                        setLocalSettings(prev => ({ ...prev, logo: '' }));
                        setHasChanges(true);
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Brain className="h-12 w-12 text-indigo-600" />
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'logo')}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Height (px):</label>
                    <input
                      type="number"
                      min="0"
                      value={localSettings.logoHeight}
                      onChange={(e) => handleNumberChange('logoHeight', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Name
              </label>
              <input
                type="text"
                value={localSettings.platformName}
                onChange={(e) => handleTextChange('platformName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Home Page Settings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Home Page Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Home Icon
              </label>
              <div className="flex items-center space-x-4">
                {localSettings.homeIcon ? (
                  <div className="relative">
                    <img
                      src={localSettings.homeIcon}
                      alt="Home icon"
                      style={{ height: `${localSettings.homeIconHeight}px` }}
                      className="object-contain"
                    />
                    <button
                      onClick={() => {
                        setLocalSettings(prev => ({ ...prev, homeIcon: '' }));
                        setHasChanges(true);
                      }}
                      className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Brain className="h-12 w-12 text-indigo-600" />
                )}
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'homeIcon')}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Height (px):</label>
                    <input
                      type="number"
                      min="0"
                      value={localSettings.homeIconHeight}
                      onChange={(e) => handleNumberChange('homeIconHeight', e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Title
              </label>
              <input
                type="text"
                value={localSettings.welcomeTitle}
                onChange={(e) => handleTextChange('welcomeTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Welcome Subtitle
              </label>
              <input
                type="text"
                value={localSettings.welcomeSubtitle}
                onChange={(e) => handleTextChange('welcomeSubtitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}