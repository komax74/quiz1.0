import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { compressImage } from '../../utils/imageCompression';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string;
  onSave: (logo: string) => void;
}

export default function LogoUploadModal({
  isOpen,
  onClose,
  currentLogo,
  onSave,
}: LogoUploadModalProps) {
  const [previewLogo, setPreviewLogo] = useState<string>(currentLogo);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const compressedImage = await compressImage(reader.result as string);
          setPreviewLogo(compressedImage);
          setError('');
        };
        reader.readAsDataURL(file);
      } catch (err) {
        setError('Error processing image. Please try a different image.');
      }
    }
  };

  const handleSave = () => {
    onSave(previewLogo);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Update Logo</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-center">
            {previewLogo ? (
              <div className="relative">
                <img
                  src={previewLogo}
                  alt="Logo preview"
                  className="h-24 object-contain"
                />
                <button
                  onClick={() => setPreviewLogo('')}
                  className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg">
                <Upload className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}