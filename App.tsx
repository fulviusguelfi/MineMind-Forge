
import React, { useState, useEffect } from 'react';
import { BotConfig, GeneratedFile, AIBehavior, PluginType, Nationality, AppLanguage, UserProfile } from './types';
import { INITIAL_CONFIG, BOT_COMMANDS, UI_TEXT } from './constants';
import { generatePluginCode } from './services/geminiService';
import { updateUserLanguages } from './services/authService';
import ConfigPanel from './components/ConfigPanel';
import CodeViewer from './components/CodeViewer';
import ChatSimulator from './components/ChatSimulator';
import CommandList from './components/CommandList';
import LanguageManager from './components/LanguageManager';
import { LoginScreen } from './components/LoginScreen';
import { Code, MessageSquare, Box, Terminal, BookOpen, HelpCircle, Globe, LogOut, Settings } from 'lucide-react';

const App: React.FC = () => {
  // Auth State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // App State
  const [bots, setBots] = useState<BotConfig[]>([INITIAL_CONFIG]);
  const [selectedBotId, setSelectedBotId] = useState<string>(INITIAL_CONFIG.id);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'chat'>('code');
  const [showCommands, setShowCommands] = useState(false);
  const [showLangManager, setShowLangManager] = useState(false);
  const [language, setLanguage] = useState<string>('en');

  // Load language pack logic
  const getUiText = () => {
      // Check built-in
      if (UI_TEXT[language as keyof typeof UI_TEXT]) {
          return UI_TEXT[language as keyof typeof UI_TEXT];
      }
      // Check user custom
      if (currentUser?.customLanguages && currentUser.customLanguages[language]) {
          return currentUser.customLanguages[language];
      }
      // Fallback
      return UI_TEXT['en'];
  };

  const t = getUiText();
  const selectedBot = bots.find(b => b.id === selectedBotId) || bots[0];

  const handleLogout = () => {
      setCurrentUser(null);
      setLanguage('en');
      setBots([INITIAL_CONFIG]);
  };

  const handleUpdateUser = (updatedUser: UserProfile) => {
      // Update local state and persist via service logic (handled in LanguageManager usually, but we sync here)
      const persisted = updateUserLanguages(updatedUser, '', {}); // Just triggers save
      setCurrentUser(persisted);
  };

  const handleAddBot = () => {
    const newId = `bot-${Date.now()}`;
    const newBot: BotConfig = {
      ...INITIAL_CONFIG,
      id: newId,
      name: `New Bot ${bots.length + 1}`,
      behavior: AIBehavior.GENERALIST,
      nationality: Nationality.AMERICAN,
    };
    setBots([...bots, newBot]);
    setSelectedBotId(newId);
  };

  const handleDeleteBot = (id: string) => {
    if (bots.length <= 1) return;
    const newBots = bots.filter(b => b.id !== id);
    setBots(newBots);
    if (selectedBotId === id) {
      setSelectedBotId(newBots[0].id);
    }
  };

  const handleUpdateBot = (id: string, newConfig: BotConfig) => {
    setBots(bots.map(b => (b.id === id ? newConfig : b)));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const files = await generatePluginCode(bots);
      setGeneratedFiles(files);
      setActiveTab('code');
    } catch (error) {
      alert("Failed to generate code. Please try again or check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Auth Guard
  if (!currentUser) {
      return <LoginScreen onLoginSuccess={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen bg-[#111827] text-gray-200 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-900/30 rounded-lg border border-green-800">
               <Box className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">MineMind <span className="text-green-500">Forge</span></h1>
              <p className="text-xs text-gray-500 font-mono">{t.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-400">
             
             {/* Language / User Settings */}
             <div className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1.5 border border-gray-700">
                 <button 
                   onClick={() => setShowLangManager(true)}
                   className="flex items-center gap-2 hover:text-white transition-colors"
                   title="Language Settings"
                 >
                   <Globe className="w-4 h-4 text-blue-400" />
                   <span className="font-mono font-bold uppercase">{language}</span>
                 </button>
                 <div className="w-px h-4 bg-gray-600"></div>
                 <button onClick={handleLogout} title="Logout" className="hover:text-red-400"><LogOut className="w-4 h-4" /></button>
             </div>

             <button 
               onClick={() => setShowCommands(true)}
               className="flex items-center gap-2 hover:text-white transition-colors hidden sm:flex"
             >
               <BookOpen className="w-4 h-4" />
               <span className="hidden sm:inline">{t.commands}</span>
             </button>
            <div className="h-4 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center gap-1 hidden sm:flex">
              <Terminal className="w-4 h-4" />
              <span>v1.2.0</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="flex-grow p-4 md:p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-80px)]">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 h-full min-h-[500px]">
          <ConfigPanel 
            bots={bots}
            selectedBotId={selectedBotId}
            onSelectBot={setSelectedBotId}
            onUpdateBot={handleUpdateBot}
            onAddBot={handleAddBot}
            onDeleteBot={handleDeleteBot}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            language={language}
          />
        </div>

        {/* Right Column: Output & Simulation */}
        <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
          
          {/* Tabs */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'code' 
                  ? 'bg-gray-800 text-white shadow-md border border-gray-700' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <Code className="w-4 h-4" />
              {t.generatedSource}
            </button>
            
            <div className="relative group">
              <button
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-gray-800 text-white shadow-md border border-gray-700' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {t.chatSimulator}
                <HelpCircle className="w-3.5 h-3.5 text-gray-500 opacity-60 group-hover:opacity-100" />
              </button>
              
              <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 hidden group-hover:block animate-fade-in-up">
                <div className="flex gap-3">
                  <div className="mt-1 w-8 h-8 rounded bg-green-900/30 flex items-center justify-center flex-shrink-0 text-green-500 border border-green-500/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{t.sandboxTitle}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {t.sandboxDesc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow relative overflow-hidden rounded-xl bg-gray-900 border border-gray-800 shadow-inner">
             {activeTab === 'code' ? (
               <div className="absolute inset-0 p-1">
                 <CodeViewer files={generatedFiles} language={language} />
               </div>
             ) : (
               <div className="absolute inset-0 p-1">
                 {selectedBot && (
                    <ChatSimulator key={selectedBot.id} config={selectedBot} language={language} />
                 )}
               </div>
             )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {showCommands && (
        <CommandList 
          commands={BOT_COMMANDS} 
          onClose={() => setShowCommands(false)} 
          language={language}
        />
      )}
      {showLangManager && (
        <LanguageManager 
           user={currentUser}
           onUpdateUser={handleUpdateUser}
           currentLanguage={language}
           onSetLanguage={(l) => { setLanguage(l); setShowLangManager(false); }}
           onClose={() => setShowLangManager(false)}
        />
      )}
    </div>
  );
};

export default App;
