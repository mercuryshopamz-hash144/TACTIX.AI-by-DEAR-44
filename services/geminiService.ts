import { GoogleGenAI, Type, Schema, LiveServerMessage, Modality, Blob } from "@google/genai";
import { AnalysisReport, TeamData, ScannedTeamData, TutorialGuide, DocumentInsight, SimulationResult, TacticalSettings } from "../types";
import { TACTIX_SYSTEM_IDENTITY, VISION_SCOUT_IDENTITY, COACH_ALPHA_IDENTITY, DOCMASTER_IDENTITY, SIMULATION_ENGINE_IDENTITY, OSM_KNOWLEDGE_BASE, VOICE_ASSISTANT_IDENTITY } from "../constants";

const apiKey = process.env.API_KEY || ""; 

const ai = new GoogleGenAI({ apiKey });

// --- ANALYSIS SCHEMA ---
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    opponentIntel: {
      type: Type.OBJECT,
      properties: {
        threatLevel: { type: Type.NUMBER, description: "1 to 10 scale" },
        keyWeakness: { type: Type.STRING },
        analysis: { type: Type.STRING },
      },
    },
    tacticalBattlePlan: {
      type: Type.OBJECT,
      properties: {
        recommendedFormation: { type: Type.STRING },
        winProbability: { type: Type.NUMBER, description: "Percentage 0-100" },
        rationale: { type: Type.STRING },
        settings: {
          type: Type.OBJECT,
          properties: {
            style: { type: Type.STRING },
            passing: { type: Type.STRING },
            pressing: { type: Type.STRING },
            aggression: { type: Type.STRING },
            offsideTrap: { type: Type.BOOLEAN },
            marking: { type: Type.STRING },
            tempo: { type: Type.STRING },
            focus: { type: Type.STRING },
          },
        },
        lineTactics: {
          type: Type.OBJECT,
          properties: {
            forwards: { type: Type.STRING },
            midfielders: { type: Type.STRING },
            defenders: { type: Type.STRING },
          },
        },
      },
    },
    gameManagement: {
      type: Type.OBJECT,
      properties: {
        substitutionStrategy: { type: Type.STRING },
        formationChangeTriggers: { type: Type.STRING },
        criticalThreats: { 
          type: Type.ARRAY, 
          items: { type: Type.STRING } 
        },
      },
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        mostLikelyScore: { type: Type.STRING },
        keyToVictory: { type: Type.STRING },
      },
    },
  },
  required: ["opponentIntel", "tacticalBattlePlan", "gameManagement", "prediction"],
};

// --- VISION SCHEMA ---
const visionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    teamName: { type: Type.STRING, description: "Name of the team found in image" },
    formation: { type: Type.STRING, description: "e.g. 4-3-3 A, 4-4-2 B" },
    averageRating: { type: Type.NUMBER, description: "Team overall rating 1-150" },
    recentForm: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING, enum: ["W", "L", "D"] },
      description: "Last 3-5 match results"
    }
  }
};

// --- TUTORIAL SCHEMA ---
const tutorialSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    formationSteps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Step by step to select formation"
    },
    formationVisualCheck: { type: Type.STRING, description: "What shape to look for" },
    settingsSteps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          instruction: { type: Type.STRING },
          location: { type: Type.STRING },
          reason: { type: Type.STRING }
        }
      }
    },
    substitutionPlan: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          scenario: { type: Type.STRING, description: "e.g. 60th minute losing" },
          action: { type: Type.STRING }
        }
      }
    },
    commonMistakes: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          mistake: { type: Type.STRING },
          fix: { type: Type.STRING }
        }
      }
    },
    coachEncouragement: { type: Type.STRING }
  }
};

// --- DOCMASTER SCHEMA ---
const docMasterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, description: "e.g., Tactical Guide, Player Database" },
    keyInsights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "General tactical principles extracted"
    },
    tacticalRules: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Specific rules like 'If 433 then Wing Play'"
    }
  }
};

// --- SIMULATION SCHEMA ---
const simulationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coherence: {
      type: Type.OBJECT,
      properties: {
        structural: { type: Type.NUMBER },
        behavioural: { type: Type.NUMBER },
        intensity: { type: Type.NUMBER },
        defensive: { type: Type.NUMBER },
        overall: { type: Type.NUMBER },
        feedback: { type: Type.STRING },
      }
    },
    strengthAnalysis: {
      type: Type.OBJECT,
      properties: {
        myPower: { type: Type.NUMBER },
        opponentPower: { type: Type.NUMBER },
        ratio: { type: Type.NUMBER },
        contextModifier: { type: Type.STRING },
      }
    },
    prediction: {
      type: Type.OBJECT,
      properties: {
        winChance: { type: Type.NUMBER },
        drawChance: { type: Type.NUMBER },
        lossChance: { type: Type.NUMBER },
        score: { type: Type.STRING },
      }
    },
    scenarios: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          winChance: { type: Type.NUMBER },
          coherence: { type: Type.NUMBER },
          impact: { type: Type.STRING },
        }
      }
    }
  }
};

// --- AUDIO HELPERS ---
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// --- API FUNCTIONS ---

export const analyzeMatchup = async (
  myTeam: TeamData,
  opponent: TeamData,
  additionalNotes: string = "",
  knowledgeContext: string[] = [],
  language: 'en' | 'tr' = 'en'
): Promise<AnalysisReport> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const langInstruction = language === 'tr' ? "OUTPUT RESPONSE IN TURKISH LANGUAGE." : "OUTPUT RESPONSE IN ENGLISH LANGUAGE.";

  const prompt = `
    PERFORM PHASE 1-5 ANALYSIS PROTOCOL.
    ${langInstruction}

    MY TEAM DATA:
    Name: ${myTeam.name}
    Formation: ${myTeam.formation}
    Avg Rating: ${myTeam.averageRating}
    Status: ${myTeam.homeOrAway}
    Recent Form: ${myTeam.recentForm.join("-")}

    OPPONENT DATA:
    Name: ${opponent.name}
    Formation: ${opponent.formation}
    Avg Rating: ${opponent.averageRating}
    Recent Form: ${opponent.recentForm.join("-")}

    ADDITIONAL NOTES:
    ${additionalNotes}

    CORE KNOWLEDGE BASE:
    ${OSM_KNOWLEDGE_BASE}

    IMPORTED KNOWLEDGE (FROM UPLOADED DOCS):
    ${knowledgeContext.length > 0 ? knowledgeContext.join("\n") : "None"}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: TACTIX_SYSTEM_IDENTITY,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from TACTIX AI");
    
    return JSON.parse(text) as AnalysisReport;
  } catch (error) {
    console.error("Tactical Analysis Failed:", error);
    throw error;
  }
};

export const scanScreenshot = async (base64Image: string): Promise<ScannedTeamData> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Supports multimodal
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: "Analyze this OSM screenshot. Extract tactical data for the visible team." }
          ]
        }
      ],
      config: {
        systemInstruction: VISION_SCOUT_IDENTITY,
        responseMimeType: "application/json",
        responseSchema: visionSchema,
        temperature: 0.1, // Low temp for extraction accuracy
      },
    });

    const text = response.text;
    if (!text) throw new Error("Vision Scout failed to extract data.");
    
    return JSON.parse(text) as ScannedTeamData;
  } catch (error) {
    console.error("Vision Scan Failed:", error);
    throw error;
  }
};

export const processDocument = async (base64Image: string, filename: string): Promise<DocumentInsight> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            { inlineData: { mimeType: "image/jpeg", data: base64Image } },
            { text: "Analyze this tactical document. Extract key formations, rules, and strategies." }
          ]
        }
      ],
      config: {
        systemInstruction: DOCMASTER_IDENTITY,
        responseMimeType: "application/json",
        responseSchema: docMasterSchema,
        temperature: 0.2,
      },
    });

    const text = response.text;
    if (!text) throw new Error("DocMaster failed to process document.");
    
    const data = JSON.parse(text);
    
    return {
      id: Math.random().toString(36).substr(2, 9),
      filename,
      timestamp: Date.now(),
      type: data.type,
      keyInsights: data.keyInsights || [],
      tacticalRules: data.tacticalRules || []
    };
  } catch (error) {
    console.error("Doc Processing Failed:", error);
    throw error;
  }
};

export const generateCoachingGuide = async (report: AnalysisReport, knowledgeContext: string[] = [], language: 'en' | 'tr' = 'en'): Promise<TutorialGuide> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const langInstruction = language === 'tr' ? "OUTPUT RESPONSE IN TURKISH LANGUAGE." : "OUTPUT RESPONSE IN ENGLISH LANGUAGE.";

  const prompt = `
    GENERATE BEGINNER TUTORIAL BASED ON THIS ANALYSIS:
    ${JSON.stringify(report)}
    
    Create a fool-proof, step-by-step guide for an OSM beginner to apply these exact tactics.

    INCORPORATE THESE ADVANCED INSIGHTS IF RELEVANT:
    ${knowledgeContext.length > 0 ? knowledgeContext.join("\n") : "None"}

    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        { role: "user", parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: COACH_ALPHA_IDENTITY,
        responseMimeType: "application/json",
        responseSchema: tutorialSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("Coach Alpha is offline.");

    return JSON.parse(text) as TutorialGuide;
  } catch (error) {
    console.error("Tutorial Generation Failed:", error);
    throw error;
  }
}

export const runSimulation = async (
  myTeam: TeamData,
  opponent: TeamData,
  tactics: TacticalSettings,
  lineTactics: any,
  language: 'en' | 'tr' = 'en'
): Promise<SimulationResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const langInstruction = language === 'tr' ? "OUTPUT RESPONSE IN TURKISH LANGUAGE." : "OUTPUT RESPONSE IN ENGLISH LANGUAGE.";

  const prompt = `
    RUN MATCH SIMULATION PROTOCOL.

    MY TEAM:
    Formation: ${myTeam.formation}
    Rating: ${myTeam.averageRating}
    Status: ${myTeam.homeOrAway}
    
    MY TACTICS:
    ${JSON.stringify(tactics)}
    Line Tactics: ${JSON.stringify(lineTactics)}

    OPPONENT:
    Formation: ${opponent.formation}
    Rating: ${opponent.averageRating}
    
    SIMULATE THE OUTCOME BASED ON TACTICAL COHERENCE.
    
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: {
        systemInstruction: SIMULATION_ENGINE_IDENTITY,
        responseMimeType: "application/json",
        responseSchema: simulationSchema,
        thinkingConfig: { thinkingBudget: 32768 },
      },
    });

    const text = response.text;
    if (!text) throw new Error("Simulation Engine offline.");

    return JSON.parse(text) as SimulationResult;
  } catch (error) {
    console.error("Simulation Failed:", error);
    throw error;
  }
};

// --- LIVE VOICE ASSISTANT ---

export const connectLiveSession = async (
  onActive: (isActive: boolean) => void,
  language: 'en' | 'tr' = 'en'
) => {
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  let nextStartTime = 0;
  const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
  const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
  
  const sources = new Set<AudioBufferSourceNode>();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

  const langInstruction = language === 'tr' ? "You must speak in Turkish." : "You must speak in English.";
  const fullSystemInstruction = `${VOICE_ASSISTANT_IDENTITY}\n\n${OSM_KNOWLEDGE_BASE}\n\n${langInstruction}`;

  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-12-2025',
    callbacks: {
      onopen: () => {
        onActive(true);
        // Stream audio from the microphone
        const source = inputAudioContext.createMediaStreamSource(stream);
        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
        
        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
          const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
          const pcmBlob = createBlob(inputData);
          sessionPromise.then((session) => {
            session.sendRealtimeInput({ media: pcmBlob });
          });
        };
        
        source.connect(scriptProcessor);
        scriptProcessor.connect(inputAudioContext.destination);
      },
      onmessage: async (message: LiveServerMessage) => {
        const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
        if (base64EncodedAudioString) {
          nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
          const audioBuffer = await decodeAudioData(
            decode(base64EncodedAudioString),
            outputAudioContext,
            24000,
            1
          );
          const source = outputAudioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(outputAudioContext.destination);
          
          source.addEventListener('ended', () => {
            sources.delete(source);
          });
          
          source.start(nextStartTime);
          nextStartTime = nextStartTime + audioBuffer.duration;
          sources.add(source);
        }

        const interrupted = message.serverContent?.interrupted;
        if (interrupted) {
            for (const source of sources.values()) {
                source.stop();
                sources.delete(source);
            }
            nextStartTime = 0;
        }
      },
      onclose: () => {
        onActive(false);
      },
      onerror: (e) => {
        console.error("Live session error", e);
        onActive(false);
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Fenrir' } },
      },
      systemInstruction: fullSystemInstruction,
    },
  });

  return {
    disconnect: async () => {
      const session = await sessionPromise;
      session.close();
      inputAudioContext.close();
      outputAudioContext.close();
      stream.getTracks().forEach(track => track.stop());
    }
  };
};