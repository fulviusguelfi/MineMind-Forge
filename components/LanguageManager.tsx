
import React, { useState, useRef } from 'react';
import { Upload, FileJson, Check, AlertTriangle, Globe, X } from 'lucide-react';
import { UserProfile } from '../types';

interface LanguageManagerProps {
  user: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
  currentLanguage: string;
  onSetLanguage: (lang: string) => void;
  onClose: () => void;
}

const LanguageManager: React.FC<LanguageManagerProps> = ({ 
  user, 
  onUpdateUser, 
  currentLanguage,
  onSetLanguage,
  onClose 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic schema validation
        if (!json.title || !json.commands) {
            throw new Error("Invalid Language File. Missing 'title' or 'commands' keys.");
        }

        // Use filename as code (e.g. 'es.json' -> 'es')
        const langCode = file.name.replace('.json', '').toLowerCase();
        
        // Update user profile securely
        const updatedUser = { ...user };
        updatedUser.customLanguages = { 
            ...updatedUser.customLanguages, 
            [langCode]: json 
        };
        
        // Persist logic handled by parent via callback which calls authService
        onUpdateUser(updatedUser);
        setSuccess(`Language '${langCode}' added successfully!`);
        setError(null);
      } catch (err) {
        setError("Failed to parse JSON. Please ensure valid syntax.");
        setSuccess(null);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-md animate-fade-in overflow-hidden">
        
        <div className="p-5 bg-gray-900 border-b border-gray-700 flex justify-between items-center">
            <h3 className="font-bold text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Language Settings
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>

        <div className="p-6 space-y-6">
            
            {/* Current Selection */}
            <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Interface Language</label>
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => onSetLanguage('en')}
                        className={`px-3 py-2 rounded border text-sm ${currentLanguage === 'en' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
                    >
                        English
                    </button>
                    <button 
                        onClick={() => onSetLanguage('pt')}
                        className={`px-3 py-2 rounded border text-sm ${currentLanguage === 'pt' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
                    >
                        Português
                    </button>
                    {Object.keys(user.customLanguages).map(lang => (
                        <button 
                            key={lang}
                            onClick={() => onSetLanguage(lang)}
                            className={`px-3 py-2 rounded border text-sm uppercase ${currentLanguage === lang ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
            </div>

            {/* Upload Section */}
            <div className="border-t border-gray-700 pt-6">
                <h4 className="font-bold text-gray-200 mb-2 text-sm">Upload Private Translation</h4>
                <p className="text-xs text-gray-500 mb-4">
                    Upload a .json file. This translation is encrypted and visible only to you.
                </p>

                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-900/50"
                >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-300 font-medium">Click to upload JSON</span>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleFileUpload}
                />

                {error && (
                    <div className="mt-3 p-3 bg-red-900/20 border border-red-800 rounded flex items-center gap-2 text-red-400 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mt-3 p-3 bg-green-900/20 border border-green-800 rounded flex items-center gap-2 text-green-400 text-xs">
                        <Check className="w-4 h-4" />
                        {success}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageManager;
