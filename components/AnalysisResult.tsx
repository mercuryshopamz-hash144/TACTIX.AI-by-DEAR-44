import React from 'react';
import { AnalysisReport } from '../types';
import { TacticalField } from './TacticalField';
import { ShieldAlert, Trophy, Target, TrendingUp, Zap, BarChart3, Crosshair } from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  report: AnalysisReport;
  language: 'en' | 'tr';
}

const ProgressBar: React.FC<{ value: number; colorClass: string; animate?: boolean }> = ({ value, colorClass, animate = true }) => (
    <div className="h-4 w-full bg-slate-900/50 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-sm relative">
        <div 
            className={`h-full ${colorClass} ${animate ? 'animate-bar-fill' : ''} shadow-[0_0_10px_currentColor]`}
            style={{ 
                width: animate ? '0%' : `${value}%` 
            }}
        >
             {/* Simple shimmer effect via CSS in styles could be added here */}
        </div>
        <style>{`
            @keyframes barFill-${value} {
                from { width: 0%; }
                to { width: ${value}%; }
            }
        `}</style>
        <div 
             className={`h-full ${colorClass} absolute top-0 left-0 opacity-80`}
             style={{ animation: `barFill-${value} 1.5s ease-out forwards` }}
        ></div>
    </div>
);

export const AnalysisResult: React.FC<Props> = ({ report, language }) => {
  const { opponentIntel, tacticalBattlePlan, gameManagement, prediction } = report;
  const t = TRANSLATIONS[language];

  return (
    <div className="space-y-6 animate-fade-in-up pb-20">
      
      {/* HEADER: VS BAR */}
      <div className="bg-ocean-900/60 border border-ocean-700/50 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md shadow-lg border-glow">
         <div className="text-center md:text-left w-full md:w-auto">
            <h2 className="text-sm text-ocean-200 font-display font-bold tracking-widest mb-1 uppercase">{t.winProbability}</h2>
            <div className="flex items-center gap-4 w-full md:w-80">
                <span className="text-victory font-tech font-bold text-3xl text-glow">{tacticalBattlePlan.winProbability}%</span>
                <ProgressBar value={tacticalBattlePlan.winProbability} colorClass="bg-victory" />
            </div>
         </div>
         <div className="flex items-center gap-4 bg-slate-950/40 p-3 rounded-lg border border-ocean-700/30">
             <Trophy className="w-10 h-10 text-warning animate-pulse" />
             <div className="text-right">
                 <p className="text-xs text-slate-400 font-display font-bold uppercase tracking-wider">{t.predictedScore}</p>
                 <p className="text-3xl font-tech font-black text-white text-glow">{prediction.mostLikelyScore}</p>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMN 1: INTEL */}
        <div className="space-y-6">
            <div className="bg-slate-900/40 border border-danger/30 p-5 rounded-xl backdrop-blur-sm hover:border-danger/50 transition-colors">
                <div className="flex items-center gap-2 mb-4 border-b border-danger/20 pb-2">
                    <ShieldAlert className="w-5 h-5 text-danger" />
                    <h3 className="text-danger font-display font-bold text-lg tracking-wide">{t.opponentIntel}</h3>
                </div>
                <div className="space-y-5">
                    <div>
                        <p className="text-xs text-slate-400 font-tech uppercase mb-1">{t.threatLevel}</p>
                        <div className="flex items-center gap-3">
                            <div className="flex-1">
                                 <ProgressBar value={opponentIntel.threatLevel * 10} colorClass="bg-danger" />
                            </div>
                            <span className="text-danger font-tech font-bold text-xl">{opponentIntel.threatLevel}/10</span>
                        </div>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-tech uppercase mb-2">{t.criticalWeakness}</p>
                        <p className="text-sm text-red-100 bg-danger/10 p-3 rounded border border-danger/20 leading-relaxed">
                            {opponentIntel.keyWeakness}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-tech uppercase mb-1">{t.tacticalAnalysis}</p>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans">
                            {opponentIntel.analysis}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/40 border border-ocean-700/30 p-5 rounded-xl backdrop-blur-sm">
                 <div className="flex items-center gap-2 mb-4 border-b border-ocean-700/30 pb-2">
                    <TrendingUp className="w-5 h-5 text-ocean-500" />
                    <h3 className="text-ocean-500 font-display font-bold text-lg tracking-wide">{t.gameManagement}</h3>
                </div>
                <ul className="space-y-3 text-sm text-slate-300">
                    <li className="flex gap-2">
                        <span className="text-ocean-500 font-bold font-mono">{t.subs}</span>
                        {gameManagement.substitutionStrategy}
                    </li>
                    <li className="flex gap-2">
                        <span className="text-ocean-500 font-bold font-mono">{t.adapt}</span>
                        {gameManagement.formationChangeTriggers}
                    </li>
                </ul>
                <div className="mt-4 pt-4 border-t border-slate-800/50">
                    <p className="text-xs text-warning font-display font-bold uppercase mb-2">{t.criticalThreats}</p>
                    {gameManagement.criticalThreats.map((threat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 mb-1 font-mono">
                            <span className="w-1.5 h-1.5 bg-warning rounded-full animate-pulse"></span>
                            {threat}
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* COLUMN 2: TACTICAL FIELD (CENTER) */}
        <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-full bg-ocean-900/80 border border-ocean-500/50 p-2 rounded-t-xl text-center border-b-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <span className="text-ocean-200 font-display font-bold text-lg tracking-[0.2em] uppercase text-glow">{t.masterPlan}</span>
            </div>
            <TacticalField formation={tacticalBattlePlan.recommendedFormation} teamName="My Team" />
            
            <div className="w-full bg-slate-900/80 border border-t-0 border-ocean-500/30 p-5 rounded-b-xl space-y-4 backdrop-blur-md">
                 <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400 text-xs font-tech uppercase">{t.formation}</span>
                    <span className="text-ocean-400 font-tech font-bold text-xl">{tacticalBattlePlan.recommendedFormation}</span>
                 </div>
                 <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                    <span className="text-slate-400 text-xs font-tech uppercase">{t.style}</span>
                    <span className="text-white font-bold text-sm">{tacticalBattlePlan.settings.style}</span>
                 </div>
                 <div className="grid grid-cols-2 gap-3 text-xs">
                     <div className="bg-slate-950/50 p-2 rounded text-center border border-slate-800">
                         <span className="block text-slate-500 mb-1 font-mono uppercase">{t.passing}</span>
                         <span className="text-ocean-200 font-bold">{tacticalBattlePlan.settings.passing}</span>
                     </div>
                     <div className="bg-slate-950/50 p-2 rounded text-center border border-slate-800">
                         <span className="block text-slate-500 mb-1 font-mono uppercase">{t.focus}</span>
                         <span className="text-ocean-200 font-bold">{tacticalBattlePlan.settings.focus}</span>
                     </div>
                 </div>
            </div>
        </div>

        {/* COLUMN 3: DIRECTIVES */}
        <div className="space-y-6">
             <div className="bg-slate-900/40 border border-victory/30 p-5 rounded-xl h-full backdrop-blur-sm hover:border-victory/50 transition-colors">
                <div className="flex items-center gap-2 mb-4 border-b border-victory/20 pb-2">
                    <Target className="w-5 h-5 text-victory" />
                    <h3 className="text-victory font-display font-bold text-lg tracking-wide">{t.battleDirectives}</h3>
                </div>
                
                <div className="space-y-6">
                    {/* Sliders */}
                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1 font-tech uppercase">
                                <span>{t.pressing}</span>
                                <span className="text-victory">{tacticalBattlePlan.settings.pressing}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-victory rounded-full w-3/4 shadow-[0_0_10px_#10B981]"></div></div>
                        </div>
                        <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1 font-tech uppercase">
                                <span>{t.aggression}</span>
                                <span className="text-victory">{tacticalBattlePlan.settings.aggression}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-victory rounded-full w-1/2 shadow-[0_0_10px_#10B981]"></div></div>
                        </div>
                         <div>
                            <div className="flex justify-between text-xs text-slate-400 mb-1 font-tech uppercase">
                                <span>{t.tempo}</span>
                                <span className="text-victory">{tacticalBattlePlan.settings.tempo}</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-victory rounded-full w-2/3 shadow-[0_0_10px_#10B981]"></div></div>
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-3">
                         <div className="bg-slate-950/50 p-3 rounded border border-slate-700 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.offsideTrap}</span>
                            <span className={`font-display font-bold text-lg ${tacticalBattlePlan.settings.offsideTrap ? 'text-victory text-glow' : 'text-slate-600'}`}>
                                {tacticalBattlePlan.settings.offsideTrap ? t.active : t.off}
                            </span>
                         </div>
                         <div className="bg-slate-950/50 p-3 rounded border border-slate-700 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{t.marking}</span>
                            <span className="font-display font-bold text-white text-md text-center">{tacticalBattlePlan.settings.marking}</span>
                         </div>
                    </div>

                    {/* Line Tactics */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                        <p className="text-xs text-victory font-display font-bold uppercase tracking-widest flex items-center gap-2">
                             <Crosshair className="w-3 h-3" /> {t.lineOrders}
                        </p>
                        <div className="flex items-center gap-3 text-sm bg-slate-950/30 p-2 rounded border border-slate-800/50">
                            <span className="w-6 h-6 rounded bg-ocean-900 flex items-center justify-center text-xs font-bold text-ocean-200 font-mono">F</span>
                            <span className="text-slate-200 font-medium">{tacticalBattlePlan.lineTactics.forwards}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-slate-950/30 p-2 rounded border border-slate-800/50">
                            <span className="w-6 h-6 rounded bg-ocean-900 flex items-center justify-center text-xs font-bold text-ocean-200 font-mono">M</span>
                            <span className="text-slate-200 font-medium">{tacticalBattlePlan.lineTactics.midfielders}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm bg-slate-950/30 p-2 rounded border border-slate-800/50">
                            <span className="w-6 h-6 rounded bg-ocean-900 flex items-center justify-center text-xs font-bold text-ocean-200 font-mono">D</span>
                            <span className="text-slate-200 font-medium">{tacticalBattlePlan.lineTactics.defenders}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

      {/* RATIONALE FOOTER */}
      <div className="bg-ocean-900/30 border border-ocean-700/30 p-6 rounded-xl flex items-start gap-5 backdrop-blur-md">
          <div className="p-3 bg-warning/10 rounded-full border border-warning/20 shrink-0">
             <Zap className="w-6 h-6 text-warning" />
          </div>
          <div>
              <h4 className="text-warning font-display font-bold text-lg mb-2 tracking-wide">{t.tacticalRationale}</h4>
              <p className="text-slate-300 text-sm italic leading-relaxed font-serif border-l-2 border-warning/30 pl-4">
                  "{tacticalBattlePlan.rationale}"
              </p>
              <div className="mt-3 text-xs text-slate-500 font-mono">
                  <span className="font-bold text-ocean-400 uppercase">{t.keyToVictory}</span> 
                  {prediction.keyToVictory}
              </div>
          </div>
      </div>

    </div>
  );
};
