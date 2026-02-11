import React, { useState, useEffect, useRef } from 'react';
import { SimulationResult } from '../types';
import { 
  Zap, 
  ShieldCheck, 
  Activity, 
  BrainCircuit, 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Swords,
  X,
  Clock,
  Play,
  Volume2
} from 'lucide-react';
import { TRANSLATIONS } from '../constants';

interface Props {
  result: SimulationResult;
  onClose: () => void;
  language: 'en' | 'tr';
}

const CoherenceBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="flex justify-between text-xs font-tech uppercase mb-1 text-slate-400">
      <span>{label}</span>
      <span className={color}>{value}/100</span>
    </div>
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div 
        className={`h-full rounded-full transition-all duration-1000 ${color.replace('text-', 'bg-')}`} 
        style={{ width: `${value}%` }}
      ></div>
    </div>
  </div>
);

// --- SOUND EFFECTS UTILS ---
const playWhistle = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1500, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);

    // Second short blast for fulltime
    setTimeout(() => {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1500, ctx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.2);
        gain2.gain.setValueAtTime(0.5, ctx.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc2.start();
        osc2.stop(ctx.currentTime + 0.5);
    }, 600);

  } catch (e) {
    console.error("Audio play failed", e);
  }
};

const playCrowdNoise = (durationMs: number) => {
    // Simulated crowd noise using filtered noise usually requires a buffer.
    // We will simulate a "goal" cheer using simple noise if possible, or just skip complexity for now.
    // Instead, let's try a simple rising noise for a goal.
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const bufferSize = ctx.sampleRate * 2; // 2 seconds
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.5, ctx.currentTime + 0.5);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2);
        
        // Lowpass filter to make it sound more like a crowd/roar
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
    } catch (e) {
        console.error(e);
    }
};

export const SimulationRoom: React.FC<Props> = ({ result, onClose, language }) => {
  const { coherence, strengthAnalysis, prediction, scenarios } = result;
  const t = TRANSLATIONS[language];

  // Simulation State
  const [simStage, setSimStage] = useState<'intro' | 'playing' | 'finished'>('intro');
  const [matchTime, setMatchTime] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchLog, setMatchLog] = useState<{time: number, text: string, type: 'goal'|'chance'|'card'|'normal'}[]>([]);

  // Parse result score
  const targetScore = prediction.score || "0-0";
  const [targetHome, targetAway] = targetScore.split('-').map(s => parseInt(s.trim())) || [0, 0];
  
  // Calculate Goal Times
  const goalTimes = useRef<{time: number, team: 'home'|'away'}[]>([]);
  
  useEffect(() => {
    // Generate random goal times
    const goals: {time: number, team: 'home'|'away'}[] = [];
    for(let i=0; i<targetHome; i++) goals.push({ time: Math.floor(Math.random() * 85) + 1, team: 'home' });
    for(let i=0; i<targetAway; i++) goals.push({ time: Math.floor(Math.random() * 85) + 1, team: 'away' });
    goals.sort((a, b) => a.time - b.time);
    goalTimes.current = goals;
  }, [targetHome, targetAway]);

  // Start Simulation
  const startMatch = () => {
    setSimStage('playing');
    playWhistle();
  };

  // Match Loop
  useEffect(() => {
    if (simStage !== 'playing') return;

    const interval = setInterval(() => {
        setMatchTime(prev => {
            const nextTime = prev + 1;
            
            // Check for goals
            const goal = goalTimes.current.find(g => g.time === nextTime);
            if (goal) {
                if (goal.team === 'home') setHomeScore(s => s + 1);
                else setAwayScore(s => s + 1);
                
                setMatchLog(prevLog => [{
                    time: nextTime,
                    text: "GOAL!!! The stadium erupts!",
                    type: 'goal'
                }, ...prevLog]);
                
                playCrowdNoise(2000);
            } 
            // Random Events
            else if (Math.random() > 0.96) {
                const events = [
                    "Dangerous attack...",
                    "Great save by the keeper!",
                    "Corner kick awarded.",
                    "Midfield battle intensifying.",
                    "Tactical adjustment detected.",
                    "Shot hits the post!"
                ];
                const text = events[Math.floor(Math.random() * events.length)];
                setMatchLog(prevLog => [{
                    time: nextTime,
                    text: text,
                    type: text.includes("save") || text.includes("post") ? 'chance' : 'normal'
                }, ...prevLog]);
            }

            if (nextTime >= 90) {
                clearInterval(interval);
                playWhistle();
                setTimeout(() => setSimStage('finished'), 2000);
                return 90;
            }
            return nextTime;
        });
    }, 100); // Speed of simulation (100ms per minute)

    return () => clearInterval(interval);
  }, [simStage]);

  // Calculate widths for strength bars
  const totalPower = strengthAnalysis.myPower + strengthAnalysis.opponentPower;
  const myPowerPct = (strengthAnalysis.myPower / totalPower) * 100;
  const oppPowerPct = (strengthAnalysis.opponentPower / totalPower) * 100;

  // --- MATCH SIMULATION VIEW ---
  if (simStage !== 'finished') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-fade-in-up">
        <div className="w-full max-w-3xl bg-slate-900 border border-ocean-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center p-8 relative">
            
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-ocean-900/40 via-transparent to-transparent opacity-50"></div>
            
            {simStage === 'intro' ? (
                <div className="text-center space-y-8 relative z-10 py-12">
                    <div className="w-24 h-24 bg-ocean-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse">
                        <Swords className="w-12 h-12 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-display font-black text-white mb-2">{t.runSimulation}</h2>
                        <p className="text-ocean-300 font-mono text-sm tracking-wider uppercase">Neural Engine Ready</p>
                    </div>
                    <button 
                        onClick={startMatch}
                        className="px-10 py-4 bg-victory hover:bg-emerald-400 text-ocean-900 font-black font-display text-xl rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all hover:scale-105 flex items-center gap-3 mx-auto"
                    >
                        <Play className="w-6 h-6 fill-current" /> KICK OFF
                    </button>
                </div>
            ) : (
                <div className="w-full relative z-10">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <div className="flex items-center gap-2">
                             <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                             <span className="text-red-500 font-mono text-xs uppercase tracking-widest font-bold">LIVE MATCH</span>
                        </div>
                        <div className="flex items-center gap-2 text-ocean-400">
                             <Clock className="w-4 h-4" />
                             <span className="font-mono text-xl font-bold">{matchTime}'</span>
                        </div>
                    </div>

                    {/* Scoreboard */}
                    <div className="flex justify-between items-center mb-12">
                        <div className="text-center w-1/3">
                            <h3 className="text-2xl font-display font-bold text-white mb-1">MY TEAM</h3>
                            <div className="text-6xl font-black text-white font-mono text-glow">{homeScore}</div>
                        </div>
                        <div className="text-slate-600 font-display text-2xl font-bold">VS</div>
                        <div className="text-center w-1/3">
                            <h3 className="text-2xl font-display font-bold text-white mb-1">OPPONENT</h3>
                            <div className="text-6xl font-black text-white font-mono text-glow">{awayScore}</div>
                        </div>
                    </div>

                    {/* Timeline / Progress */}
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-8">
                        <div className="h-full bg-victory transition-all duration-300 ease-linear" style={{ width: `${(matchTime/90)*100}%` }}></div>
                    </div>

                    {/* Commentary Log */}
                    <div className="h-48 overflow-hidden relative">
                        <div className="space-y-3">
                            {matchLog.slice(0, 4).map((log, idx) => (
                                <div key={log.time + idx} className={`flex items-start gap-4 animate-fade-in-up ${idx === 0 ? 'opacity-100' : 'opacity-50'}`}>
                                    <span className="font-mono text-ocean-400 text-sm font-bold w-8 shrink-0">{log.time}'</span>
                                    <span className={`text-sm font-medium ${log.type === 'goal' ? 'text-victory font-bold text-lg' : log.type === 'chance' ? 'text-warning' : 'text-slate-300'}`}>
                                        {log.text}
                                    </span>
                                </div>
                            ))}
                            {matchLog.length === 0 && (
                                <p className="text-slate-500 text-center italic mt-10">Match starting...</p>
                            )}
                        </div>
                        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-900 to-transparent"></div>
                    </div>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- FINAL RESULTS VIEW ---
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fade-in-up">
      <div className="w-full max-w-5xl bg-slate-900 border border-ocean-500/30 rounded-2xl shadow-2xl overflow-hidden max-h-[95vh] overflow-y-auto flex flex-col">
        
        {/* HEADER */}
        <div className="bg-ocean-900/50 p-6 border-b border-ocean-700/30 flex justify-between items-center sticky top-0 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-ocean-600 rounded-lg animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-black text-white tracking-wider leading-none">{t.warRoom}</h2>
              <p className="text-[10px] text-ocean-300 font-mono uppercase tracking-widest">{t.neuralEngine}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-y-auto">
          
          {/* LEFT: COHERENCE */}
          <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl flex flex-col h-full">
            <h3 className="text-ocean-400 font-display font-bold text-lg mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5" /> {t.tacticalCoherence}
            </h3>
            
            <div className="space-y-5 mb-8 flex-grow">
              <CoherenceBar label={t.structural} value={coherence.structural} color="text-emerald-400" />
              <CoherenceBar label={t.behavioural} value={coherence.behavioural} color="text-blue-400" />
              <CoherenceBar label={t.intensity} value={coherence.intensity} color="text-warning" />
              <CoherenceBar label={t.defensive} value={coherence.defensive} color="text-purple-400" />
            </div>

            <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 mt-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-500 font-bold uppercase">{t.overallScore}</span>
                <span className={`text-3xl font-tech font-black ${coherence.overall >= 80 ? 'text-victory' : coherence.overall >= 60 ? 'text-warning' : 'text-danger'}`}>
                  {coherence.overall}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed border-l-2 border-ocean-500 pl-3 italic">
                "{coherence.feedback}"
              </p>
            </div>
          </div>

          {/* CENTER: PREDICTION & STRENGTH */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* WIN PROBABILITY CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-ocean-900/20 border border-ocean-500/30 p-6 rounded-xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                 <Trophy className="w-64 h-64 text-ocean-500" />
               </div>
               
               <div className="grid md:grid-cols-2 gap-8 relative z-10">
                 {/* Probability Numbers */}
                 <div>
                   <h3 className="text-slate-500 font-tech uppercase text-[10px] tracking-widest mb-3">{t.outcomeProbability}</h3>
                   <div className="flex items-baseline gap-2 mb-2">
                     <span className={`text-6xl font-black ${prediction.winChance >= 50 ? 'text-victory' : 'text-warning'} text-glow`}>
                       {prediction.winChance}%
                     </span>
                     <span className="text-2xl font-display text-ocean-400 uppercase font-bold">{t.win}</span>
                   </div>
                   <div className="flex gap-4 text-xs font-mono text-slate-400 font-bold">
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-slate-500 rounded-full"></div> {t.draw}: {prediction.drawChance}%</span>
                     <span className="flex items-center gap-1"><div className="w-2 h-2 bg-danger rounded-full"></div> {t.loss}: {prediction.lossChance}%</span>
                   </div>
                 </div>

                 {/* Score Prediction */}
                 <div className="text-left md:text-right flex flex-col justify-center">
                   <h3 className="text-slate-500 font-tech uppercase text-[10px] tracking-widest mb-2">{t.projectedScoreline}</h3>
                   <span className="text-5xl font-mono font-black text-white">{prediction.score}</span>
                 </div>
               </div>

               {/* Probability Bar */}
               <div className="mt-8 flex h-3 rounded-full overflow-hidden bg-slate-800">
                 <div className="bg-victory h-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${prediction.winChance}%` }}></div>
                 <div className="bg-slate-500 h-full" style={{ width: `${prediction.drawChance}%` }}></div>
                 <div className="bg-danger h-full" style={{ width: `${prediction.lossChance}%` }}></div>
               </div>
            </div>

            {/* STRENGTH ANALYSIS */}
            <div className="bg-slate-950/50 border border-slate-800 p-5 rounded-xl">
               <div className="flex items-center justify-between mb-4">
                  <h3 className="text-slate-400 font-display font-bold text-sm flex items-center gap-2">
                    <Swords className="w-4 h-4" /> {t.powerDifferential}
                  </h3>
                  <span className="text-xs font-mono text-ocean-400 bg-ocean-900/30 px-2 py-1 rounded border border-ocean-500/20">
                    {t.ratio}: {strengthAnalysis.ratio}%
                  </span>
               </div>
               
               <div className="relative h-12 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex items-center mb-2">
                  {/* My Team Bar */}
                  <div 
                    className="h-full bg-gradient-to-r from-ocean-800 to-ocean-600 flex items-center justify-start pl-4 text-xs font-bold text-white whitespace-nowrap transition-all duration-1000 relative z-10"
                    style={{ width: `${myPowerPct}%` }}
                  >
                    {t.mySquad} ({strengthAnalysis.myPower})
                  </div>
                  
                  {/* VS Divider */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-700 z-20"></div>

                  {/* Opponent Bar */}
                  <div 
                    className="h-full bg-gradient-to-l from-red-900 to-red-700 flex items-center justify-end pr-4 text-xs font-bold text-white whitespace-nowrap transition-all duration-1000 absolute right-0 top-0 bottom-0"
                    style={{ width: `${oppPowerPct}%` }}
                  >
                    {t.opponent} ({strengthAnalysis.opponentPower})
                  </div>
               </div>
               <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">{strengthAnalysis.contextModifier}</p>
            </div>

            {/* SCENARIOS */}
            <h3 className="text-slate-400 font-display font-bold text-sm mt-6 mb-3 flex items-center gap-2">
               <Zap className="w-4 h-4 text-warning" /> {t.alternativeScenarios}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios.map((scenario, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl hover:border-ocean-500/30 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{scenario.name}</span>
                    {scenario.winChance > prediction.winChance ? (
                      <TrendingUp className="w-4 h-4 text-victory" />
                    ) : scenario.winChance < prediction.winChance ? (
                      <TrendingDown className="w-4 h-4 text-danger" />
                    ) : (
                      <Activity className="w-4 h-4 text-slate-500" />
                    )}
                  </div>
                  
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className={`text-2xl font-black ${scenario.winChance > 50 ? 'text-white' : 'text-slate-400'} group-hover:text-ocean-400 transition-colors`}>
                      {scenario.winChance}%
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{t.win}</span>
                  </div>
                  
                  <p className="text-[10px] text-slate-400 leading-tight border-t border-slate-800 pt-2 mt-2">
                    {scenario.impact}
                  </p>
                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    );
  }
};
