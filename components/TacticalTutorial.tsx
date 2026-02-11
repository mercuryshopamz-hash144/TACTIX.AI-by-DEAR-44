import React from 'react';
import { TutorialGuide } from '../types';
import { 
  ClipboardList, 
  MapPin, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  PlayCircle,
  HelpCircle
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  guide: TutorialGuide;
  language: 'en' | 'tr';
}

export const TacticalTutorial: React.FC<Props> = ({ guide, language }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* HEADER MESSAGE */}
      <div className="bg-ocean-900/60 border-l-4 border-ocean-500 p-6 rounded-r-xl shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-ocean-800 rounded-full flex items-center justify-center shrink-0 border-2 border-ocean-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
             <ClipboardList className="text-ocean-200 w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white mb-1 uppercase tracking-wider">{t.coachSays}</h2>
            <p className="text-ocean-200 italic text-lg leading-relaxed">"{guide.coachEncouragement}"</p>
          </div>
        </div>
      </div>

      {/* STEP 1: FORMATION */}
      <div className="bg-slate-900/40 border border-ocean-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="bg-ocean-900/40 px-6 py-4 border-b border-ocean-700/30 flex items-center justify-between">
           <h3 className="font-display font-bold text-white text-lg flex items-center gap-3">
             <span className="bg-ocean-600 text-white text-xs px-2 py-0.5 rounded font-mono">{t.step1}</span>
             {t.formationSetup}
           </h3>
           <MapPin className="text-ocean-400 w-6 h-6" />
        </div>
        <div className="p-6">
           <ul className="space-y-4 mb-6">
             {guide.formationSteps.map((step, idx) => (
               <li key={idx} className="flex items-start gap-3 text-slate-300">
                 <CheckCircle2 className="w-5 h-5 text-victory shrink-0 mt-0.5" />
                 <span className="font-medium">{step}</span>
               </li>
             ))}
           </ul>
           <div className="bg-slate-950/50 p-5 rounded-lg border border-ocean-900/50">
              <p className="text-xs text-ocean-400 font-tech uppercase font-bold mb-2 flex items-center gap-2">
                 <HelpCircle className="w-4 h-4"/> {t.visualCheck}
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">{guide.formationVisualCheck}</p>
           </div>
        </div>
      </div>

      {/* STEP 2: SETTINGS */}
      <div className="bg-slate-900/40 border border-ocean-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="bg-ocean-900/40 px-6 py-4 border-b border-ocean-700/30 flex items-center justify-between">
           <h3 className="font-display font-bold text-white text-lg flex items-center gap-3">
             <span className="bg-victory text-ocean-900 text-xs px-2 py-0.5 rounded font-mono">{t.step2}</span>
             {t.tacticalSettings}
           </h3>
           <SlidersHorizontal className="text-victory w-6 h-6" />
        </div>
        <div className="p-6 grid gap-4 md:grid-cols-2">
           {guide.settingsSteps.map((step, idx) => (
             <div key={idx} className="bg-slate-950/50 p-5 rounded-lg border border-slate-800 hover:border-victory/30 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-slate-500 text-[10px] font-tech uppercase tracking-wider">{step.location}</span>
                   <span className="text-victory font-display font-bold text-sm bg-victory/10 px-2 py-0.5 rounded border border-victory/20 group-hover:text-glow">{step.instruction}</span>
                </div>
                <h4 className="text-white font-bold mb-2 text-lg">{step.title}</h4>
                <p className="text-slate-400 text-sm leading-snug">{step.reason}</p>
             </div>
           ))}
        </div>
      </div>

      {/* STEP 3: GAME MANAGEMENT */}
      <div className="bg-slate-900/40 border border-ocean-700/30 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="bg-ocean-900/40 px-6 py-4 border-b border-ocean-700/30 flex items-center justify-between">
           <h3 className="font-display font-bold text-white text-lg flex items-center gap-3">
             <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded font-mono">{t.step3}</span>
             {t.matchManagement}
           </h3>
           <Clock className="text-purple-400 w-6 h-6" />
        </div>
        <div className="p-6 space-y-4">
           {guide.substitutionPlan.map((plan, idx) => (
             <div key={idx} className="flex items-start gap-4 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
                <PlayCircle className="w-6 h-6 text-purple-500 shrink-0 mt-1" />
                <div>
                  <p className="text-white font-display font-bold text-md mb-1">{plan.scenario}</p>
                  <p className="text-slate-400 text-sm">{plan.action}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* STEP 4: MISTAKES */}
      <div className="bg-danger/5 border border-danger/20 rounded-xl overflow-hidden backdrop-blur-sm">
        <div className="bg-danger/10 px-6 py-4 border-b border-danger/20 flex items-center justify-between">
           <h3 className="font-display font-bold text-danger text-lg flex items-center gap-2 tracking-wide">
             <AlertTriangle className="w-5 h-5" />
             {t.criticalMistakes}
           </h3>
        </div>
        <div className="p-6 space-y-4">
           {guide.commonMistakes.map((item, idx) => (
             <div key={idx} className="flex gap-4 p-3 rounded hover:bg-danger/5 transition-colors">
                <div className="w-8 h-8 rounded-full bg-danger/20 flex items-center justify-center font-bold text-danger text-lg shrink-0">✗</div>
                <div>
                   <p className="text-red-200 font-bold mb-1">{item.mistake}</p>
                   <p className="text-slate-500 text-sm">✓ {t.fix}: {item.fix}</p>
                </div>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
};
