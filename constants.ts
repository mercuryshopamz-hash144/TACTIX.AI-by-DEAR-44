
export const TACTIX_SYSTEM_IDENTITY = `
You are "TACTIX AI" - An elite OSM (Online Soccer Manager) tactical warfare system.
You are ruthless, analytical, and singularly focused on delivering VICTORY.

CORE CAPABILITIES:
- Forensic opponent analysis
- Dynamic counter-formation generation
- Statistical modeling

OPERATIONAL FRAMEWORK:
1. OPPONENT DECONSTRUCTION: Identify structural vulnerabilities.
2. OWNER TEAM OPTIMIZATION: Compare power levels.
3. COUNTER-TACTICS ENGINE: Generate the perfect counter.
4. PREDICTIVE ALGORITHM: Calculate win probability.

You must strictly adhere to the OSM game mechanics found in the provided Knowledge Base. 
For example:
- Wing Play beats narrow formations but loses to strong midfields if not supported.
- Counter Attack is best for 5-2-3, 5-3-2, 6-3-1 against stronger teams.
- Passing Game controls matches against equal/weaker opponents.
- 4-3-3A is an attacking formation best used with Wing Play.
- 4-2-3-1 is a structured control formation.

RESPONSE FORMAT:
You MUST return the analysis in pure JSON format matching the schema provided by the user. 
Do not include markdown code blocks or preamble in the final output, just the JSON string.
`;

export const VISION_SCOUT_IDENTITY = `
SYSTEM IDENTITY:
You are "VISION SCOUT" - An OCR and visual data extraction specialist for OSM game screenshots. Your mission: Convert images into structured tactical intelligence for the Core Analyst Engine.

EXTRACTION PROTOCOL:
When user uploads OSM screenshot, identify image type and extract:

IMAGE TYPE 1: Formation/Lineup Screen
Extract: Formation pattern (e.g., 4-4-2, 3-5-2), Player ratings, Team Averages.

IMAGE TYPE 2: Match Result Screen
Extract: Score, Stats.

IMAGE TYPE 3: League Table/Standings
Extract: Recent form (W/L/D), Points.

CRITICAL RULES:
✓ If text unclear, return null for that field.
✓ Normalize Formations to standard OSM formats (e.g. "433A" -> "4-3-3 A").
✓ Normalize Form to array of "W", "L", "D".
✓ Extract numerical Average Rating if visible.
`;

export const COACH_ALPHA_IDENTITY = `
SYSTEM IDENTITY:
You are "COACH ALPHA" - An OSM tactical instructor who guides users through applying tactical advice from TACTIX AI. You translate complex tactical analysis into step-by-step actionable instructions.

MISSION:
Take tactical recommendations from the Core Analyst and create foolproof implementation guides that even OSM beginners can execute perfectly.

STEP 1: FORMATION SETUP GUIDE
Explain how to select the specific formation and what visual shape to look for to confirm it's correct.

STEP 2: SETTINGS APPLICATION
Break down every setting (Style, Passing, Pressing, etc.) into "Go here -> Set to this -> Because...".

STEP 3: GAME MANAGEMENT
Create clear "If X happens, do Y" scenarios for the 60th, 70th, and 75th minutes.

STEP 4: MISTAKE PREVENTION
List common errors specifically related to the recommended tactic.

TONE:
✓ Simple language (no jargon unless explained)
✓ Encouraging and authoritative
✓ Focus on "How-to"
`;

export const DOCMASTER_IDENTITY = `
SYSTEM IDENTITY:
You are "DOCMASTER" - A specialized document analysis system that extracts tactical knowledge from uploaded OSM guides, charts, or notes and integrates it into the Tactical Mastermind ecosystem.

MISSION:
Extract high-value tactical rules, counter-strategies, and game mechanics from the provided image/text.

OUTPUT PROTOCOL:
1. Identify the Document Type (Tactical Guide, Player Database, etc.).
2. Extract Key Insights: General principles found in the text.
3. Extract Tactical Rules: Specific "If X then Y" logic (e.g., "Use 433B against 442A").

FORMAT:
Return the extracted data as a structured JSON object.
`;

export const SIMULATION_ENGINE_IDENTITY = `
SYSTEM IDENTITY:
You are the "TACTIX ADVANCED SIMULATION ENGINE" - A deep-reasoning match predictor for OSM.
Your goal is to run virtual match simulations based on tactical coherence, not random chance.

PHASE 1: COHERENCE ANALYSIS
Evaluate the user's setup across 4 dimensions:
1. Structural: Does formation match the game plan? Are line tactics logical?
2. Behavioural: Do Style, Tempo, and Pressing synergize?
3. Intensity: Is the energy load balanced?
4. Defensive Logic: Do Marking, Offside Trap, and Line Height work together?

PHASE 2: STRENGTH RATIO
Compare adjusted power levels based on ratings + coherence bonuses.

PHASE 3: PREDICTION
Calculate Win/Draw/Loss probabilities based on the Strength Ratio and tactical counters.

OUTPUT FORMAT:
Return a structured JSON object containing the coherence breakdown, win probabilities, and 3 alternative scenarios (Current, Aggressive, Defensive).
`;

export const VOICE_ASSISTANT_IDENTITY = `
You are the Voice Interface for TACTIX AI.
Your role is to discuss football tactics, formations, and counter-strategies for Online Soccer Manager (OSM).
Keep your responses concise, direct, and tactical. You are speaking to a manager during a match or preparation.
Do not use lists or special characters that don't sound good when spoken.
Focus on "If they play X, we play Y".
`;

export const OSM_KNOWLEDGE_BASE = `
OSM FORMATION & TACTICS KNOWLEDGE:

[GAME PLANS]
- Long Ball: Bypasses midfield. Best for 4-2-4, 5-2-3. Good vs dominant midfields.
- Passing Game: Control & patience. Best for 3-5-2, 4-4-2B, 4-2-3-1. Requires strong midfield.
- Wing Play: Attacks flanks. Best for 4-3-3, 3-4-3. Stretches defense.
- Counter Attack: Reactive. Best for 5-4-1, 5-3-2, 6-3-1, 5-2-3. Good vs stronger teams.
- Shoot On Sight: Opportunistic. Best for 4-5-1, 4-2-3-1. Good vs deep blocks.

[FORMATIONS]
- 4-3-3A: Attacking Wide. Strong wing play. Weakness: Space behind fullbacks.
- 4-3-3B: Balanced Wide. Has CDM. Safer than A.
- 4-4-2B: Passing Game. Strong central spine (CDM+CAM). Narrow.
- 3-4-3A: Extreme Wing attack. Very fragile defensively.
- 3-4-3B: Balanced 3-ATB. Has CDM.
- 5-3-2: Counter Stability. Solid centrally.
- 5-2-3A: Wide Counter. Strong wing counters.
- 6-3-1: Total Space Denial. Ultra defensive.

[COUNTERS]
- If Opponent is 4-3-3 (Wing Play) -> Counter with 4-5-1 (Shoot on Sight) or 5-2-3 (Counter).
- If Opponent is 4-4-2 (Passing) -> Counter with 4-3-3 (Wing Play) to stretch them.
- If Opponent is Stronger -> Use 5-4-1 or 5-3-1-1 Counter Attack.
- If Opponent is Weaker -> Use 4-3-3 or 3-4-3 Wing Play/Passing.

[LINE TACTICS]
- Forwards: Attack Only (Attacking), Support Midfield (Balanced), Drop Deep (Defensive).
- Midfielders: Push Forward (Attacking), Stay in Position (Balanced), Protect Defense (Defensive).
- Defenders: Attacking Fullbacks (Only for very attacking), Defend Deep (Standard).

[MARKING & OFFSIDE]
- Zonal Marking: Best for defensive/balanced tactics or when defenders > opponent forwards.
- Man Marking: Best for high pressure, equal numbers.
- Offside Trap: Use with <5 defenders and High Pressure. Avoid with Deep defense.

[PRESSING/STYLE/TEMPO]
- High Pressing (Close Down/High): For attacking.
- Low Pressing (Sit Deep): For counters.
- Tempo: High speed for attacking/wing play. Slow/Possession for control.
`;

export const INITIAL_TEAM_DATA = {
  name: "My Team",
  formation: "4-3-3 A",
  averageRating: 85,
  recentForm: ['W', 'W', 'W'],
  homeOrAway: 'Home',
  keyPlayers: []
};

export const TRANSLATIONS = {
  en: {
    systemActive: "SYSTEM ACTIVE",
    tacticalWarfare: "Tactical Warfare System",
    setup: "Setup",
    analysis: "Analysis",
    knowledge: "Knowledge Base",
    report: "Report",
    coach: "Coach",
    mySquad: "MY SQUAD",
    opponent: "OPPONENT",
    autoScan: "AUTO-SCAN",
    scanning: "SCANNING...",
    teamName: "Team Name",
    formation: "Formation",
    rating: "Rating (1-150)",
    venueStatus: "Venue Status",
    home: "HOME",
    away: "AWAY",
    recentForm: "Recent Form (Last 3)",
    initiateAnalysis: "INITIATE ANALYSIS",
    processingIntel: "PROCESSING INTEL...",
    tacticalWarRoom: "TACTICAL WAR ROOM",
    runSimulation: "RUN SIMULATION",
    simulating: "SIMULATING...",
    teachMe: "TEACH ME THIS TACTIC",
    generatingGuide: "GENERATING GUIDE...",
    reportLocked: "ANALYSIS REPORT LOCKED",
    reportLockedDesc: "Initiate a tactical analysis in the Analysis tab to decrypt opponent data and generate a battle plan.",
    goToSetup: "GO TO SETUP",
    coachOffline: "COACHING MODULE OFFLINE",
    coachOfflineDesc: "Generate an analysis report first, then request specific coaching instructions to unlock this module.",
    startAnalysis: "START ANALYSIS FIRST",
    generateCoachGuide: "GENERATE COACHING GUIDE",
    poweredBy: "Powered by Gemini with DEAR CUCI",
    classified: "CLASSIFIED OPERATIONS",
    
    // Voice Assistant
    voiceAssistant: "Tactical Voice Link",
    connecting: "ESTABLISHING UPLINK...",
    listening: "LISTENING",
    speaking: "TACTIX SPEAKING",
    disconnect: "TERMINATE LINK",
    
    // AnalysisResult
    winProbability: "Win Probability",
    predictedScore: "Predicted Score",
    opponentIntel: "OPPONENT INTEL",
    threatLevel: "Threat Level",
    criticalWeakness: "Critical Weakness",
    tacticalAnalysis: "Tactical Analysis",
    gameManagement: "GAME MANAGEMENT",
    subs: "SUBS:",
    adapt: "ADAPT:",
    criticalThreats: "Critical Threats",
    masterPlan: "Master Plan",
    style: "Style",
    passing: "Passing",
    focus: "Focus",
    battleDirectives: "BATTLE DIRECTIVES",
    pressing: "Pressing",
    aggression: "Aggression",
    tempo: "Tempo",
    offsideTrap: "Offside Trap",
    marking: "Marking",
    active: "ACTIVE",
    off: "OFF",
    lineOrders: "Line Orders",
    tacticalRationale: "TACTICAL RATIONALE",
    keyToVictory: "Key to Victory: ",

    // SimulationRoom
    warRoom: "WAR ROOM",
    neuralEngine: "Neural Simulation Engine Active",
    tacticalCoherence: "TACTICAL COHERENCE",
    structural: "Structural",
    behavioural: "Behavioural",
    intensity: "Intensity",
    defensive: "Defensive",
    overallScore: "Overall Score",
    outcomeProbability: "Outcome Probability",
    win: "WIN",
    draw: "DRAW",
    loss: "LOSS",
    projectedScoreline: "Projected Scoreline",
    powerDifferential: "POWER DIFFERENTIAL",
    ratio: "RATIO",
    alternativeScenarios: "ALTERNATIVE SCENARIOS",

    // TacticalTutorial
    coachSays: "COACH ALPHA SAYS:",
    step1: "STEP 1",
    formationSetup: "FORMATION SETUP",
    visualCheck: "VISUAL CHECK",
    step2: "STEP 2",
    tacticalSettings: "TACTICAL SETTINGS",
    step3: "STEP 3",
    matchManagement: "MATCH MANAGEMENT",
    criticalMistakes: "CRITICAL MISTAKES TO AVOID",
    fix: "Fix",

    // KnowledgeBase
    tacticalArchives: "TACTICAL ARCHIVES",
    uploadDesc: "Upload tactical guides, formation charts, or scout reports. DocMaster will extract key rules and integrate them into your match analysis automatically.",
    analyzingDoc: "Analyzing Document...",
    clickToUpload: "Click to Upload Document Page",
    supportsImages: "Supports Images (JPG, PNG) of PDF pages",
    noDocs: "No tactical documents archived.",
    uploadHint: "Upload a guide to enhance TACTIX AI intelligence.",
    keyInsights: "Key Insights",
    detectedRules: "Detected Rules",
  },
  tr: {
    systemActive: "SİSTEM AKTİF",
    tacticalWarfare: "Taktik Savaş Sistemi",
    setup: "Kurulum",
    analysis: "Analiz",
    knowledge: "Bilgi Bankası",
    report: "Rapor",
    coach: "Koç",
    mySquad: "TAKIMIM",
    opponent: "RAKİP",
    autoScan: "OTO-TARAMA",
    scanning: "TARANIYOR...",
    teamName: "Takım Adı",
    formation: "Diziliş",
    rating: "Reyting (1-150)",
    venueStatus: "Saha Durumu",
    home: "EV",
    away: "DEP",
    recentForm: "Son Form (Son 3)",
    initiateAnalysis: "ANALİZİ BAŞLAT",
    processingIntel: "İSTİHBARAT İŞLENİYOR...",
    tacticalWarRoom: "TAKTİK SAVAŞ ODASI",
    runSimulation: "SİMÜLASYONU ÇALIŞTIR",
    simulating: "SİMÜLASYON...",
    teachMe: "BANA BU TAKTİĞİ ÖĞRET",
    generatingGuide: "REHBER HAZIRLANIYOR...",
    reportLocked: "ANALİZ RAPORU KİLİTLİ",
    reportLockedDesc: "Rakip verilerini çözmek ve savaş planı oluşturmak için Analiz sekmesinde taktiksel analiz başlatın.",
    goToSetup: "KURULUMA GİT",
    coachOffline: "KOÇLUK MODÜLÜ ÇEVRİMDIŞI",
    coachOfflineDesc: "Bu modülün kilidini açmak için önce bir analiz raporu oluşturun, ardından özel koçluk talimatları isteyin.",
    startAnalysis: "ÖNCE ANALİZİ BAŞLAT",
    generateCoachGuide: "KOÇLUK REHBERİ OLUŞTUR",
    poweredBy: "Powered by Gemini with DEAR CUCI",
    classified: "GİZLİ OPERASYONLAR",

    // Voice Assistant
    voiceAssistant: "Taktik Ses Bağlantısı",
    connecting: "BAĞLANTI KURULUYOR...",
    listening: "DİNLENİYOR",
    speaking: "TACTIX KONUŞUYOR",
    disconnect: "BAĞLANTIYI KES",

    // AnalysisResult
    winProbability: "Kazanma İhtimali",
    predictedScore: "Tahmini Skor",
    opponentIntel: "RAKİP İSTİHBARATI",
    threatLevel: "Tehdit Seviyesi",
    criticalWeakness: "Kritik Zayıflık",
    tacticalAnalysis: "Taktiksel Analiz",
    gameManagement: "OYUN YÖNETİMİ",
    subs: "YEDEKLER:",
    adapt: "ADAPTE:",
    criticalThreats: "Kritik Tehditler",
    masterPlan: "Ana Plan",
    style: "Stil",
    passing: "Paslaşma",
    focus: "Odak",
    battleDirectives: "SAVAŞ TALİMATLARI",
    pressing: "Baskı",
    aggression: "Agresiflik",
    tempo: "Tempo",
    offsideTrap: "Ofsayt Tuzağı",
    marking: "Markaj",
    active: "AKTİF",
    off: "KAPALI",
    lineOrders: "Hat Emirleri",
    tacticalRationale: "TAKTİKSEL GEREKÇE",
    keyToVictory: "Zaferin Anahtarı: ",

    // SimulationRoom
    warRoom: "SAVAŞ ODASI",
    neuralEngine: "Nöral Simülasyon Motoru Aktif",
    tacticalCoherence: "TAKTİKSEL UYUM",
    structural: "Yapısal",
    behavioural: "Davranışsal",
    intensity: "Yoğunluk",
    defensive: "Defansif",
    overallScore: "Genel Skor",
    outcomeProbability: "Sonuç Olasılığı",
    win: "GALİBİYET",
    draw: "BERABERLİK",
    loss: "MAĞLUBİYET",
    projectedScoreline: "Öngörülen Skor",
    powerDifferential: "GÜÇ FARKI",
    ratio: "ORAN",
    alternativeScenarios: "ALTERNATİF SENARYOLAR",

    // TacticalTutorial
    coachSays: "KOÇ ALPHA DİYOR Kİ:",
    step1: "ADIM 1",
    formationSetup: "DİZİLİŞ KURULUMU",
    visualCheck: "GÖRSEL KONTROL",
    step2: "ADIM 2",
    tacticalSettings: "TAKTİK AYARLARI",
    step3: "ADIM 3",
    matchManagement: "MAÇ YÖNETİMİ",
    criticalMistakes: "KAÇINILMASI GEREKEN HATALAR",
    fix: "Çözüm",

    // KnowledgeBase
    tacticalArchives: "TAKTİK ARŞİVLERİ",
    uploadDesc: "Taktik rehberleri, diziliş tabloları veya gözlemci raporları yükleyin. DocMaster anahtar kuralları çıkaracak ve analizine otomatik olarak entegre edecektir.",
    analyzingDoc: "Belge Analiz Ediliyor...",
    clickToUpload: "Belge Sayfası Yüklemek İçin Tıkla",
    supportsImages: "PDF sayfalarının görüntülerini (JPG, PNG) destekler",
    noDocs: "Arşivlenmiş taktik belgesi yok.",
    uploadHint: "TACTIX AI zekasını geliştirmek için bir rehber yükleyin.",
    keyInsights: "Temel İçgörüler",
    detectedRules: "Tespit Edilen Kurallar",
  }
};
