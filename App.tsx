import React, { useState, useRef, useEffect } from 'react';
import { Shield, Swords, Cpu, Settings, Activity, Camera, Upload, Check, GraduationCap, BookOpen, ChevronRight, BarChart2, Zap, BrainCircuit, Lock, Globe, Mic } from 'lucide-react';
import { AnalysisReport, TeamData, TutorialGuide, DocumentInsight, SimulationResult } from './types';
import { analyzeMatchup, scanScreenshot, generateCoachingGuide, runSimulation, connectLiveSession } from './services/geminiService';
import { AnalysisResult as AnalysisResultComponent } from './components/AnalysisResult';
import { TacticalTutorial } from './components/TacticalTutorial';
import { KnowledgeBase } from './components/KnowledgeBase';
import { SimulationRoom } from './components/SimulationRoom';
import { VoiceAssistant } from './components/VoiceAssistant';
import { INITIAL_TEAM_DATA, TRANSLATIONS } from './constants';

const App: React.FC = () => {
  // State
  const [language, setLanguage] = useState<'en' | 'tr'>('en');
  
  // Load My Team from local storage or use initial
  const [myTeam, setMyTeam] = useState<TeamData>(() => {
    try {
        const saved = localStorage.getItem('TACTIX_MY_TEAM');
        return saved ? JSON.parse(saved) : INITIAL_TEAM_DATA;
    } catch (e) {
        return INITIAL_TEAM_DATA;
    }
  });

  // Load Opponent from local storage or use initial
  const [opponent, setOpponent] = useState<TeamData>(() => {
    try {
        const saved = localStorage.getItem('TACTIX_OPPONENT');
        return saved ? JSON.parse(saved) : {
            name: "Opponent FC",
            formation: "4-4-2 B",
            averageRating: 88,
            recentForm: ['W', 'D', 'W'],
            homeOrAway: 'Home', // My team is Away if opponent is Home
            keyPlayers: []
        };
    } catch (e) {
        return {
            name: "Opponent FC",
            formation: "4-4-2 B",
            averageRating: 88,
            recentForm: ['W', 'D', 'W'],
            homeOrAway: 'Home',
            keyPlayers: []
        };
    }
  });

  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [tutorial, setTutorial] = useState<TutorialGuide | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<DocumentInsight[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingTutorial, setLoadingTutorial] = useState(false);
  const [loadingSimulation, setLoadingSimulation] = useState(false);
  const [scanning, setScanning] = useState<'myTeam' | 'opponent' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'setup' | 'analysis' | 'tutorial' | 'knowledge'>('setup');

  // Voice Assistant State
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [voiceSession, setVoiceSession] = useState<{ disconnect: () => void } | null>(null);

  // Refs for hidden file inputs
  const myTeamFileRef = useRef<HTMLInputElement>(null);
  const opponentFileRef = useRef<HTMLInputElement>(null);

  const t = TRANSLATIONS[language];

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('TACTIX_MY_TEAM', JSON.stringify(myTeam));
  }, [myTeam]);

  useEffect(() => {
    localStorage.setItem('TACTIX_OPPONENT', JSON.stringify(opponent));
  }, [opponent]);

  // Cleanup voice session on unmount
  useEffect(() => {
    return () => {
      if (voiceSession) {
        voiceSession.disconnect();
      }
    };
  }, [voiceSession]);

  // Computed Context for Gemini
  const getKnowledgeContext = () => {
    return knowledgeBase.flatMap(doc => [
        `--- FROM DOC: ${doc.filename} (${doc.type}) ---`,
        ...doc.tacticalRules,
        ...doc.keyInsights
    ]);
  };

  const handleToggleVoice = async () => {
    if (isVoiceActive && voiceSession) {
      voiceSession.disconnect();
      setVoiceSession(null);
      setIsVoiceActive(false);
    } else {
      try {
        const session = await connectLiveSession(setIsVoiceActive, language);
        setVoiceSession(session);
      } catch (e: any) {
        setError("Voice connection failed: " + e.message);
        setIsVoiceActive(false);
      }
    }
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setTutorial(null); // Reset tutorial on new analysis
    setSimulationResult(null);
    try {
      const result = await analyzeMatchup(myTeam, opponent, "", getKnowledgeContext(), language);
      setReport(result);
      setActiveTab('analysis');
    } catch (e: any) {
      setError(e.message || "Analysis failed. Ensure API Key is active.");
    } finally {
      setLoading(false);
    }
  };

  const handleGetTutorial = async () => {
    if (!report) return;
    setLoadingTutorial(true);
    setError(null);
    try {
        const guide = await generateCoachingGuide(report, getKnowledgeContext(), language);
        setTutorial(guide);
        setActiveTab('tutorial');
    } catch (e: any) {
        setError(e.message || "Coach Alpha is currently unavailable.");
    } finally {
        setLoadingTutorial(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!report) return;
    setLoadingSimulation(true);
    setError(null);
    try {
        // Use the report's recommended tactics as the base for simulation
        const result = await runSimulation(
            myTeam, 
            opponent, 
            report.tacticalBattlePlan.settings,
            report.tacticalBattlePlan.lineTactics,
            language
        );
        setSimulationResult(result);
    } catch (e: any) {
        setError(e.message || "Simulation Engine unavailable.");
    } finally {
        setLoadingSimulation(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'myTeam' | 'opponent') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(target);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        // Safe regex to handle jpeg, png, etc.
        const base64String = reader.result?.toString().replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        if (base64String) {
            const data = await scanScreenshot(base64String);
            
            // Map scanned data to state
            const updateFn = target === 'myTeam' ? setMyTeam : setOpponent;
            const currentState = target === 'myTeam' ? myTeam : opponent;

            updateFn({
                ...currentState,
                name: data.teamName || currentState.name,
                formation: data.formation || currentState.formation,
                averageRating: data.averageRating || currentState.averageRating,
                recentForm: data.recentForm?.length ? data.recentForm : currentState.recentForm
            });
        }
      } catch (err: any) {
        setError("Scan failed: " + err.message);
      } finally {
        setScanning(null);
        // Reset input
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-ocean-500/30 pb-20 font-sans bg-[#020617] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-ocean-900/20 via-[#020617] to-[#020617]">
      
      {/* NAVBAR */}
      <nav className="border-b border-ocean-700/30 bg-ocean-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('setup')}>
              <div className="w-10 h-10 bg-ocean-600 rounded-lg flex items-center justify-center border border-ocean-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:rotate-180 transition-transform duration-700">
                <Cpu className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                  <span className="font-display font-bold text-2xl tracking-tighter text-white leading-none">
                    TACTIX<span className="text-ocean-500">.AI</span>
                  </span>
                  <span className="text-[10px] text-ocean-300 font-mono tracking-widest uppercase">{t.tacticalWarfare}</span>
              </div>
            </div>
            
            <div className="flex gap-4 sm:gap-6 text-xs font-mono text-ocean-200/70 items-center">
               <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-ocean-900/50 border border-ocean-700/30">
                   <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-victory opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-victory"></span>
                    </span>
                   <span className="font-bold text-victory hidden sm:inline">{t.systemActive}</span>
               </div>

               {/* VOICE ASSISTANT BUTTON */}
               <button
                  onClick={handleToggleVoice}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg border transition-all ${isVoiceActive ? 'bg-victory/20 text-victory border-victory animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:border-ocean-500'}`}
                  title={isVoiceActive ? t.disconnect : t.voiceAssistant}
               >
                 <Mic className="w-5 h-5" />
               </button>
               
               {/* LANGUAGE TOGGLE */}
               <button 
                  onClick={() => setLanguage(prev => prev === 'en' ? 'tr' : 'en')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-ocean-800 border border-slate-700 hover:border-ocean-500 transition-all font-bold text-white shadow-lg"
               >
                   <Globe className="w-4 h-4" />
                   {language === 'en' ? 'EN' : 'TR'}
               </button>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HEADER */}
        {activeTab === 'setup' && (
             <div className="mb-10 text-center animate-fade-in-up">
                <h1 className="text-4xl md:text-6xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-ocean-200 to-ocean-500 mb-4 uppercase tracking-tight drop-shadow-sm">
                    Tactical Dominance
                </h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed font-light">
                    Engage Gemini 3 neural engines for forensic opponent analysis and probability modeling.
                </p>
            </div>
        )}

        {/* ERROR BANNER */}
        {error && (
            <div className="mb-8 bg-danger/10 border border-danger/40 text-danger p-4 rounded-xl flex items-center gap-4 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                <Shield className="w-6 h-6 shrink-0" />
                <p className="font-bold">{error}</p>
            </div>
        )}

        {/* TABS NAVIGATION */}
        <div className="flex justify-center mb-10 overflow-x-auto">
            <div className="flex gap-1 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-md">
                <button 
                    onClick={() => setActiveTab('setup')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'setup' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                   <BarChart2 className="w-4 h-4" /> {t.analysis}
                </button>
                <button 
                    onClick={() => setActiveTab('knowledge')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'knowledge' ? 'bg-warning text-ocean-900 shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'}`}
                >
                    <BookOpen className="w-4 h-4" />
                    {t.knowledge}
                    {knowledgeBase.length > 0 && <span className="ml-1 bg-ocean-900 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">{knowledgeBase.length}</span>}
                </button>
                <button 
                    onClick={() => setActiveTab('analysis')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'analysis' ? 'bg-victory text-ocean-900 shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'} ${!report ? 'opacity-70' : ''}`}
                >
                    <Shield className="w-4 h-4" /> 
                    {t.report}
                    {!report && <Lock className="w-3 h-3 ml-1 opacity-50" />}
                </button>
                <button 
                    onClick={() => setActiveTab('tutorial')}
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold font-display uppercase tracking-wider transition-all duration-300 flex items-center gap-2 whitespace-nowrap ${activeTab === 'tutorial' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800'} ${!tutorial ? 'opacity-70' : ''}`}
                >
                    <GraduationCap className="w-4 h-4" /> 
                    {t.coach}
                    {!tutorial && <Lock className="w-3 h-3 ml-1 opacity-50" />}
                </button>
            </div>
        </div>

        {/* SETUP VIEW */}
        {activeTab === 'setup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up">
                
                {/* MY TEAM CARD */}
                <div className="bg-slate-900/60 border border-ocean-700/30 rounded-2xl p-6 relative overflow-hidden group backdrop-blur-md hover:border-ocean-500/50 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ocean-600 to-ocean-400"></div>
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-ocean-500/10 rounded-full blur-3xl group-hover:bg-ocean-500/20 transition-all"></div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                            <div className="p-2 bg-ocean-900 rounded-lg border border-ocean-700">
                                 <Shield className="text-ocean-400 w-6 h-6" />
                            </div>
                            {t.mySquad}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => myTeamFileRef.current?.click()}
                                disabled={scanning !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-ocean-900 text-ocean-300 text-xs font-bold rounded-lg border border-ocean-800 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:text-white"
                            >
                                {scanning === 'myTeam' ? <Activity className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                {scanning === 'myTeam' ? t.scanning : t.autoScan}
                            </button>
                            <input 
                                type="file" 
                                ref={myTeamFileRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'myTeam')}
                            />
                        </div>
                    </div>

                    <div className={`space-y-6 transition-opacity ${scanning === 'myTeam' ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                        <div className="group/input">
                            <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-ocean-400 transition-colors">{t.teamName}</label>
                            <input 
                                type="text" 
                                value={myTeam.name}
                                onChange={(e) => setMyTeam({...myTeam, name: e.target.value})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-display font-bold text-lg focus:outline-none focus:border-ocean-500 focus:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="group/input">
                                <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-ocean-400 transition-colors">{t.formation}</label>
                                <select 
                                    value={myTeam.formation}
                                    onChange={(e) => setMyTeam({...myTeam, formation: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-ocean-500 transition-all appearance-none"
                                >
                                    {["4-3-3 A", "4-3-3 B", "4-4-2 A", "4-4-2 B", "3-4-3 A", "3-4-3 B", "5-3-2", "5-2-3", "4-2-3-1", "4-5-1"].map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="group/input">
                                <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-ocean-400 transition-colors">{t.rating}</label>
                                <input 
                                    type="number" 
                                    value={myTeam.averageRating}
                                    onChange={(e) => setMyTeam({...myTeam, averageRating: parseInt(e.target.value)})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-ocean-500 transition-all text-center"
                                />
                            </div>
                        </div>
                         <div>
                             <label className="block text-[10px] font-tech text-slate-500 mb-2 uppercase tracking-widest">{t.venueStatus}</label>
                             <div className="grid grid-cols-2 gap-3 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
                                <button 
                                    onClick={() => setMyTeam({...myTeam, homeOrAway: 'Home'})}
                                    className={`text-sm py-2 rounded-lg font-bold transition-all font-display uppercase tracking-wide ${myTeam.homeOrAway === 'Home' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {t.home}
                                </button>
                                <button 
                                    onClick={() => setMyTeam({...myTeam, homeOrAway: 'Away'})}
                                    className={`text-sm py-2 rounded-lg font-bold transition-all font-display uppercase tracking-wide ${myTeam.homeOrAway === 'Away' ? 'bg-ocean-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                >
                                    {t.away}
                                </button>
                             </div>
                        </div>
                    </div>
                </div>

                {/* OPPONENT CARD */}
                <div className="bg-slate-900/60 border border-danger/20 rounded-2xl p-6 relative overflow-hidden group backdrop-blur-md hover:border-danger/40 transition-all duration-500">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-danger to-orange-500"></div>
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-danger/5 rounded-full blur-3xl group-hover:bg-danger/10 transition-all"></div>

                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                             <div className="p-2 bg-red-950/50 rounded-lg border border-red-900/50">
                                 <Swords className="text-danger w-6 h-6" />
                             </div>
                            {t.opponent}
                        </h2>
                         <div className="flex items-center gap-3">
                            <button 
                                onClick={() => opponentFileRef.current?.click()}
                                disabled={scanning !== null}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-red-950 text-red-400 text-xs font-bold rounded-lg border border-red-900/30 transition-all disabled:opacity-50 hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] hover:text-white"
                            >
                                {scanning === 'opponent' ? <Activity className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                {scanning === 'opponent' ? t.scanning : t.autoScan}
                            </button>
                            <input 
                                type="file" 
                                ref={opponentFileRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleFileUpload(e, 'opponent')}
                            />
                        </div>
                    </div>

                    <div className={`space-y-6 transition-opacity ${scanning === 'opponent' ? 'opacity-50 blur-sm' : 'opacity-100'}`}>
                        <div className="group/input">
                            <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-danger transition-colors">{t.teamName}</label>
                            <input 
                                type="text" 
                                value={opponent.name}
                                onChange={(e) => setOpponent({...opponent, name: e.target.value})}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-display font-bold text-lg focus:outline-none focus:border-danger focus:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-5">
                            <div className="group/input">
                                <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-danger transition-colors">{t.formation}</label>
                                <select 
                                    value={opponent.formation}
                                    onChange={(e) => setOpponent({...opponent, formation: e.target.value})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-danger transition-all appearance-none"
                                >
                                    {["4-3-3 A", "4-3-3 B", "4-4-2 A", "4-4-2 B", "3-4-3 A", "3-4-3 B", "5-3-2", "5-2-3", "4-2-3-1", "4-5-1", "6-3-1"].map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="group/input">
                                <label className="block text-[10px] font-tech text-slate-500 mb-1 uppercase tracking-widest group-focus-within/input:text-danger transition-colors">{t.rating}</label>
                                <input 
                                    type="number" 
                                    value={opponent.averageRating}
                                    onChange={(e) => setOpponent({...opponent, averageRating: parseInt(e.target.value)})}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-4 py-3 text-white font-mono font-bold text-lg focus:outline-none focus:border-danger transition-all text-center"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-tech text-slate-500 mb-2 uppercase tracking-widest">{t.recentForm}</label>
                            <div className="flex gap-3">
                                {opponent.recentForm.map((result, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            const newForm = [...opponent.recentForm];
                                            const next = result === 'W' ? 'D' : result === 'D' ? 'L' : 'W';
                                            newForm[idx] = next as 'W'|'L'|'D';
                                            setOpponent({...opponent, recentForm: newForm});
                                        }}
                                        className={`w-full py-3 rounded-lg font-bold font-mono text-lg border border-slate-700/50 transition-all ${
                                            result === 'W' ? 'bg-victory/20 text-victory border-victory/30' : 
                                            result === 'L' ? 'bg-danger/20 text-danger border-danger/30' : 
                                            'bg-warning/20 text-warning border-warning/30'
                                        }`}
                                    >
                                        {result}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MAIN ACTION */}
                <div className="lg:col-span-2 flex justify-center mt-4">
                    <button 
                        onClick={handleAnalyze}
                        disabled={loading || scanning !== null}
                        className={`
                            relative overflow-hidden group px-16 py-5 bg-ocean-600 rounded-xl font-display font-black text-white tracking-widest text-xl shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1
                        `}
                    >
                        <span className="relative z-10 flex items-center gap-4">
                            {loading ? (
                                <>
                                    <Settings className="w-6 h-6 animate-spin" />
                                    {t.processingIntel}
                                </>
                            ) : (
                                <>
                                    <Zap className="w-6 h-6 fill-current" />
                                    {t.initiateAnalysis}
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-ocean-500 to-ocean-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* Shine effect */}
                        <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 group-hover:animate-[shine_1s_ease-in-out]"></div>
                    </button>
                    <style>{`
                        @keyframes shine {
                            100% { left: 100%; }
                        }
                    `}</style>
                </div>

            </div>
        )}

        {/* KNOWLEDGE BASE VIEW */}
        {activeTab === 'knowledge' && (
            <KnowledgeBase 
                insights={knowledgeBase}
                onAddInsight={(insight) => setKnowledgeBase([...knowledgeBase, insight])}
                onRemoveInsight={(id) => setKnowledgeBase(knowledgeBase.filter(k => k.id !== id))}
                language={language}
            />
        )}

        {/* ANALYSIS VIEW */}
        {activeTab === 'analysis' && (
            report ? (
                <div className="space-y-10 animate-fade-in-up">
                    
                    {/* SIMULATION CARD */}
                    <div className="bg-gradient-to-r from-slate-900 to-ocean-900/40 border border-ocean-500/30 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                            <BrainCircuit className="w-48 h-48 text-ocean-400" />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
                                <Activity className="w-6 h-6 text-ocean-400" />
                                {t.tacticalWarRoom}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1 max-w-lg">
                                {language === 'tr' 
                                    ? "Başlama vuruşundan önce taktiksel uyumu test etmek ve maç sonuçlarını tahmin etmek için gelişmiş simülasyonlar çalıştırın."
                                    : "Run advanced simulations to test tactical coherence and predict match outcomes before kickoff."}
                            </p>
                        </div>

                        <div className="relative z-10">
                            <button
                                onClick={handleRunSimulation}
                                disabled={loadingSimulation}
                                className="group relative flex items-center gap-3 px-8 py-3 bg-ocean-600 hover:bg-ocean-500 text-white rounded-xl font-display font-bold uppercase tracking-wider transition-all shadow-lg hover:shadow-ocean-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loadingSimulation ? <Activity className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />}
                                {loadingSimulation ? t.simulating : t.runSimulation}
                            </button>
                        </div>
                    </div>

                    <AnalysisResultComponent report={report} language={language} />
                    
                    <div className="flex justify-center pb-8">
                        <button
                            onClick={handleGetTutorial}
                            disabled={loadingTutorial}
                            className="group flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-display font-bold text-lg transition-all shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 transform hover:-translate-y-1"
                        >
                            {loadingTutorial ? <Activity className="w-6 h-6 animate-spin" /> : <GraduationCap className="w-6 h-6" />}
                            {loadingTutorial ? t.generatingGuide : t.teachMe}
                            {!loadingTutorial && <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border-2 border-slate-800 border-dashed">
                        <Shield className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-slate-400 mb-4">{t.reportLocked}</h3>
                    <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                        {t.reportLockedDesc}
                    </p>
                    <button 
                        onClick={() => setActiveTab('setup')}
                        className="px-8 py-3 bg-ocean-600 hover:bg-ocean-500 text-white rounded-xl font-bold font-display uppercase tracking-wider transition-all shadow-lg hover:shadow-ocean-500/40"
                    >
                        {t.goToSetup}
                    </button>
                </div>
            )
        )}

        {/* TUTORIAL VIEW */}
        {activeTab === 'tutorial' && (
            tutorial ? (
                <TacticalTutorial guide={tutorial} language={language} />
            ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in-up">
                    <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border-2 border-slate-800 border-dashed">
                        <GraduationCap className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-3xl font-display font-bold text-slate-400 mb-4">{t.coachOffline}</h3>
                    <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                        {t.coachOfflineDesc}
                    </p>
                    <button 
                        onClick={() => report ? handleGetTutorial() : setActiveTab('setup')}
                        disabled={loadingTutorial}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold font-display uppercase tracking-wider transition-all shadow-lg hover:shadow-blue-500/40 flex items-center gap-2 disabled:opacity-50"
                    >
                        {loadingTutorial ? <Activity className="w-5 h-5 animate-spin" /> : null}
                        {report ? t.generateCoachGuide : t.startAnalysis}
                    </button>
                </div>
            )
        )}

        {/* SIMULATION MODAL */}
        {simulationResult && (
            <SimulationRoom 
                result={simulationResult} 
                onClose={() => setSimulationResult(null)}
                language={language}
            />
        )}

        {/* VOICE ASSISTANT OVERLAY */}
        <VoiceAssistant 
            isActive={isVoiceActive} 
            onDisconnect={() => {
                if (voiceSession) voiceSession.disconnect();
                setVoiceSession(null);
                setIsVoiceActive(false);
            }}
            language={language}
        />

      </main>

      <footer className="fixed bottom-0 w-full bg-slate-950/80 backdrop-blur-md border-t border-slate-800 py-3 z-40">
         <div className="max-w-7xl mx-auto px-4 text-center flex justify-between items-center text-[10px] text-slate-500 font-mono uppercase tracking-wider">
             <span>TACTIX AI © 2025</span>
             <span className="flex items-center gap-2">
                 {t.poweredBy}
                 <div className="w-2 h-2 bg-ocean-500 rounded-full animate-pulse"></div>
             </span>
             <span>{t.classified}</span>
         </div>
      </footer>

    </div>
  );
};

export default App;