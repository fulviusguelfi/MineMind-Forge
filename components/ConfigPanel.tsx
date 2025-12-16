
import React from 'react';
import { BotConfig, PluginType, AIBehavior, Nationality, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';
import { Settings, Cpu, Shield, MessageSquare, Save, Plus, Trash2, Users, Layers, Globe } from 'lucide-react';

interface ConfigPanelProps {
  bots: BotConfig[];
  selectedBotId: string;
  onSelectBot: (id: string) => void;
  onUpdateBot: (id: string, newConfig: BotConfig) => void;
  onAddBot: () => void;
  onDeleteBot: (id: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  language: AppLanguage;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  bots, 
  selectedBotId, 
  onSelectBot, 
  onUpdateBot, 
  onAddBot, 
  onDeleteBot, 
  onGenerate, 
  isGenerating,
  language
}) => {
  
  const selectedBot = bots.find(b => b.id === selectedBotId);
  const canDelete = bots.length > 1;
  const t = UI_TEXT[language];

  const handleChange = (field: keyof BotConfig, value: any) => {
    if (selectedBot) {
      onUpdateBot(selectedBotId, { ...selectedBot, [field]: value });
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 flex flex-col h-full overflow-hidden">
      
      {/* Panel Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-900/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-green-500" />
          <h2 className="text-lg font-bold text-gray-100">{t.projectConfig}</h2>
        </div>
      </div>

      <div className="flex-grow flex flex-col overflow-y-auto custom-scrollbar">
        
        {/* Bot List Section */}
        <div className="p-4 border-b border-gray-700 bg-gray-800/50">
          <div className="flex justify-between items-center mb-3">
             <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
               <Users className="w-3 h-3" />
               {t.botProfiles} ({bots.length})
             </h3>
             <button 
               onClick={onAddBot}
               className="text-xs bg-gray-700 hover:bg-gray-600 text-green-400 px-2 py-1.5 rounded border border-gray-600 flex items-center gap-1 transition-colors font-medium"
             >
               <Plus className="w-3 h-3" /> {t.addProfile}
             </button>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {bots.map(bot => (
              <button
                key={bot.id}
                onClick={() => onSelectBot(bot.id)}
                className={`relative group flex-shrink-0 px-3 py-2 rounded-lg text-sm border transition-all ${
                  bot.id === selectedBotId 
                    ? 'bg-green-900/20 border-green-500/50 text-white shadow-sm ring-1 ring-green-500/20' 
                    : 'bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${bot.id === selectedBotId ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></span>
                  <span className="font-medium max-w-[80px] truncate">{bot.name}</span>
                </div>
                {canDelete && (
                  <div 
                    onClick={(e) => { e.stopPropagation(); onDeleteBot(bot.id); }}
                    className="absolute -top-1.5 -right-1.5 bg-gray-800 hover:bg-red-900 text-gray-400 hover:text-red-200 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all cursor-pointer border border-gray-600 hover:border-red-700 shadow-md"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-3 h-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Edit Form */}
        {selectedBot ? (
          <div className="p-6 space-y-8">
            
            {/* General Info */}
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t.profileName}</label>
                  <input
                    type="text"
                    value={selectedBot.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
                    placeholder="e.g. MinerBot"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{t.archetype}</label>
                  <select
                    value={selectedBot.behavior}
                    onChange={(e) => handleChange('behavior', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none appearance-none"
                  >
                    {Object.values(AIBehavior).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Nationality Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
                   <Globe className="w-3 h-3" /> {t.nationality}
                </label>
                <select
                  value={selectedBot.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none appearance-none"
                >
                  {Object.values(Nationality).map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-1.5 ml-1">
                  * {t.nationalityDesc}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" /> {t.targetPlatform}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PluginType).map((type) => (
                    <button
                      key={type}
                      onClick={() => handleChange('pluginType', type)}
                      className={`px-2 py-3 rounded-lg text-xs font-bold transition-all border flex items-center justify-center text-center ${
                        selectedBot.pluginType === type
                          ? 'bg-green-600 text-white border-green-500 shadow-lg shadow-green-900/20'
                          : 'bg-gray-700/50 text-gray-400 border-gray-700 hover:bg-gray-700 hover:text-gray-200'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Neural Parameters */}
            <div className="space-y-6 pt-6 border-t border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-gray-200 uppercase tracking-wide">{t.neuralParams}</h3>
              </div>

              {/* Learning Rate Slider */}
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                  <span>{t.learningRate}</span>
                  <span className="text-purple-400">{(selectedBot.learningRate * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedBot.learningRate}
                  onChange={(e) => handleChange('learningRate', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 transition-all"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>{t.rigid}</span>
                  <span>{t.adaptive}</span>
                </div>
              </div>

              {/* Aggressiveness Slider */}
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between text-xs text-gray-400 mb-2 font-medium">
                  <div className="flex items-center gap-1">
                     <Shield className="w-3 h-3" />
                     <span>{t.aggressiveness}</span>
                  </div>
                  <span className="text-red-400">{(selectedBot.aggressiveness * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedBot.aggressiveness}
                  onChange={(e) => handleChange('aggressiveness', parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-500 hover:accent-red-400 transition-all"
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1">
                  <span>{t.pacifist}</span>
                  <span>{t.hostile}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4 bg-gray-900/30 p-3 rounded-lg border border-gray-800 hover:border-gray-700 transition-colors">
                 <input
                  type="checkbox"
                  id="canChat"
                  checked={selectedBot.canChat}
                  onChange={(e) => handleChange('canChat', e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-offset-gray-900"
                 />
                 <label htmlFor="canChat" className="text-sm text-gray-300 flex items-center gap-2 cursor-pointer select-none">
                   <MessageSquare className="w-4 h-4 text-green-500" />
                   {t.enableChat}
                 </label>
              </div>
            </div>

            {/* System Instruction */}
            <div className="pt-6 border-t border-gray-700">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t.customInstructions}</label>
              <textarea
                value={selectedBot.systemInstruction}
                onChange={(e) => handleChange('systemInstruction', e.target.value)}
                className="w-full h-32 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-sm text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none resize-none leading-relaxed font-mono"
                placeholder={t.customInstructionsPlaceholder}
              />
            </div>

          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center h-full">
            <Users className="w-12 h-12 mb-2 opacity-20" />
            <p>Select a bot profile to edit.</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-900 border-t border-gray-700 z-10">
        <button
          onClick={onGenerate}
          disabled={isGenerating || bots.length === 0}
          className={`w-full py-3.5 rounded-lg flex items-center justify-center gap-2 font-bold text-white transition-all transform active:scale-[0.99] ${
            isGenerating || bots.length === 0
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-lg hover:shadow-green-500/25 ring-1 ring-white/10'
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t.generating}
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              {t.generateBtn}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfigPanel;
