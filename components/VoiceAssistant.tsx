import React from 'react';
import { MicOff, X, AudioWaveform } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  isActive: boolean;
  onDisconnect: () => void;
  language: 'en' | 'tr';
}

export const VoiceAssistant: React.FC<Props> = ({ isActive, onDisconnect, language }) => {
  const t = TRANSLATIONS[language];
  
  if (!isActive) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 animate-fade-in-up md:right-8 md:bottom-24">
      <div className="relative group">
        <div className="absolute inset-0 bg-ocean-500/30 rounded-full blur-xl animate-pulse"></div>
        <div className="bg-slate-900/90 border border-ocean-500/50 backdrop-blur-md p-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[200px]">
          
          {/* Visualizer Circle */}
          <div className="relative w-12 h-12 flex items-center justify-center">
             <div className="absolute inset-0 bg-ocean-500 rounded-full opacity-20 animate-ping"></div>
             <div className="w-10 h-10 bg-ocean-900 rounded-full border-2 border-ocean-400 flex items-center justify-center z-10">
                <AudioWaveform className="w-5 h-5 text-ocean-200 animate-pulse" />
             </div>
          </div>

          <div className="flex-1">
             <h4 className="text-white font-display font-bold text-sm tracking-wide">{t.voiceAssistant}</h4>
             <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 bg-victory rounded-full animate-pulse"></span>
                <span className="text-[10px] text-ocean-300 font-mono uppercase">{t.listening}</span>
             </div>
          </div>

          <button 
            onClick={onDisconnect}
            className="p-2 hover:bg-danger/20 rounded-lg text-slate-500 hover:text-danger transition-colors"
            title={t.disconnect}
          >
            <MicOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};