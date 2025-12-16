
import React from 'react';
import { BotCommand, AppLanguage } from '../types';
import { UI_TEXT } from '../constants';
import { Download, FileText, Terminal, X } from 'lucide-react';
import { generateCommandsPDF } from '../services/pdfService';

interface CommandListProps {
  commands: BotCommand[];
  onClose: () => void;
  language: AppLanguage;
}

const CommandList: React.FC<CommandListProps> = ({ commands, onClose, language }) => {
  const t = UI_TEXT[language];

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    generateCommandsPDF(commands);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-900 rounded-t-xl">
          <div className="flex items-center gap-3">
             <div className="p-2.5 bg-blue-900/20 rounded-lg border border-blue-500/30">
               <Terminal className="w-5 h-5 text-blue-400" />
             </div>
             <div>
               <h3 className="text-lg font-bold text-white tracking-tight">{t.commands}</h3>
               <p className="text-xs text-gray-400 font-mono">In-game Control Reference</p>
             </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors border border-gray-600"
            >
                <Download className="w-3.5 h-3.5" />
                {t.downloadPdf}
            </button>
            <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-[#111827] custom-scrollbar">
          <div className="bg-blue-900/10 border border-blue-900/30 p-4 rounded-lg flex gap-3 items-start">
             <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
             <p className="text-sm text-gray-300 leading-relaxed">
               {t.dictIntro}
             </p>
          </div>
          
          <div className="grid gap-3">
            {commands.map((cmd, idx) => (
              <div key={idx} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/30 transition-all group">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                  <span className="font-mono text-lg font-bold text-blue-400 group-hover:text-blue-300 transition-colors">{cmd.command}</span>
                  <span className="font-mono text-[10px] bg-gray-900 border border-gray-700 px-2 py-1 rounded text-gray-400 self-start">{cmd.usage}</span>
                </div>
                <p className="text-gray-300 text-sm mb-3 border-l-2 border-gray-700 pl-3">{cmd.description}</p>
                <div className="text-xs text-gray-500 font-mono bg-[#0d1117] p-2 rounded border border-gray-800">
                  <span className="text-gray-600 select-none">$ </span> 
                  <span className="text-green-400/90">{cmd.example}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors shadow-lg"
          >
            {t.closeDict}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandList;
