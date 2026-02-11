import React, { useRef, useState } from 'react';
import { DocumentInsight } from '../types';
import { FileText, Upload, Trash2, BookOpen, Lightbulb, CheckCircle } from 'lucide-react';
import { processDocument } from '../services/geminiService';
import { TRANSLATIONS } from '../constants';

interface Props {
  insights: DocumentInsight[];
  onAddInsight: (insight: DocumentInsight) => void;
  onRemoveInsight: (id: string) => void;
  language: 'en' | 'tr';
}

export const KnowledgeBase: React.FC<Props> = ({ insights, onAddInsight, onRemoveInsight, language }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = TRANSLATIONS[language];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result?.toString().replace(/^data:image\/(.*);base64,/, '');
        if (base64String) {
            const insight = await processDocument(base64String, file.name);
            onAddInsight(insight);
        }
      } catch (err: any) {
        setError("Failed to process document: " + err.message);
      } finally {
        setProcessing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 animate-fade-in-up pb-20">
      
      {/* HEADER */}
      <div className="bg-warning/10 border border-warning/30 p-6 rounded-xl flex items-start gap-5 backdrop-blur-md">
        <div className="p-3 bg-warning/20 rounded-lg shrink-0 border border-warning/30">
           <BookOpen className="text-warning w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-display font-bold text-warning mb-2 tracking-wide">{t.tacticalArchives}</h2>
          <p className="text-amber-100/70 text-sm leading-relaxed max-w-2xl">
            {t.uploadDesc}
          </p>
        </div>
      </div>

      {/* UPLOAD AREA */}
      <div className="flex justify-center">
         <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
            className="group relative flex flex-col items-center justify-center w-full max-w-2xl h-48 border-2 border-dashed border-slate-600/50 rounded-xl hover:border-ocean-500 hover:bg-slate-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
         >
             <div className="absolute inset-0 bg-ocean-900/0 group-hover:bg-ocean-900/10 transition-colors"></div>
            {processing ? (
                <div className="flex flex-col items-center gap-4 z-10">
                     <div className="relative">
                         <div className="w-12 h-12 border-4 border-ocean-500/30 border-t-ocean-500 rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2 h-2 bg-ocean-500 rounded-full animate-ping"></div>
                         </div>
                     </div>
                    <span className="text-ocean-400 font-tech text-sm animate-pulse tracking-widest uppercase">{t.analyzingDoc}</span>
                </div>
            ) : (
                <div className="flex flex-col items-center z-10">
                    <div className="p-4 bg-slate-800 rounded-full mb-4 group-hover:scale-110 transition-transform shadow-lg group-hover:shadow-ocean-500/20">
                         <Upload className="w-8 h-8 text-slate-400 group-hover:text-ocean-400 transition-colors" />
                    </div>
                    <span className="text-slate-300 font-display font-bold text-lg group-hover:text-white transition-colors">{t.clickToUpload}</span>
                    <span className="text-slate-500 text-xs mt-2 font-mono">{t.supportsImages}</span>
                </div>
            )}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileUpload}
            />
         </button>
      </div>

      {error && (
        <div className="bg-danger/10 text-danger p-4 rounded-lg text-sm text-center border border-danger/30 font-bold animate-pulse">
            {error}
        </div>
      )}

      {/* INSIGHTS LIST */}
      <div className="grid gap-6">
         {insights.length === 0 && !processing && (
             <div className="text-center text-slate-600 py-12 flex flex-col items-center">
                 <FileText className="w-12 h-12 mb-4 opacity-20" />
                 <p className="italic font-display text-lg">{t.noDocs}</p>
                 <p className="text-xs text-slate-700 mt-2">{t.uploadHint}</p>
             </div>
         )}

         {insights.map((insight) => (
             <div key={insight.id} className="bg-slate-900/60 border border-slate-700/50 rounded-xl overflow-hidden group hover:border-ocean-500/50 transition-all backdrop-blur-md">
                 <div className="px-6 py-4 border-b border-slate-700/50 flex justify-between items-center bg-slate-950/40">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-ocean-900/50 rounded border border-ocean-700/30">
                            <FileText className="text-ocean-400 w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-display font-bold text-lg">{insight.filename}</h3>
                            <span className="text-[10px] text-ocean-300 font-mono uppercase bg-ocean-900/40 px-2 py-0.5 rounded border border-ocean-800">{insight.type}</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onRemoveInsight(insight.id)}
                        className="text-slate-500 hover:text-danger hover:bg-danger/10 transition-all p-2 rounded-lg"
                        title="Remove Document"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
                 
                 <div className="p-6 grid md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs text-slate-500 font-tech font-bold uppercase mb-4 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-warning" /> {t.keyInsights}
                        </h4>
                        <ul className="space-y-3">
                            {insight.keyInsights.map((text, i) => (
                                <li key={i} className="text-slate-300 text-sm flex items-start gap-3 group/item">
                                    <span className="w-1.5 h-1.5 bg-warning rounded-full mt-1.5 shrink-0 group-hover/item:shadow-[0_0_8px_#F59E0B] transition-shadow"></span>
                                    <span className="leading-relaxed">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs text-slate-500 font-tech font-bold uppercase mb-4 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-victory" /> {t.detectedRules}
                        </h4>
                        <ul className="space-y-2">
                            {insight.tacticalRules.map((text, i) => (
                                <li key={i} className="text-emerald-100/80 text-sm flex items-start gap-2 bg-emerald-950/20 p-2 rounded border border-emerald-900/30 hover:bg-emerald-950/40 transition-colors">
                                    <span className="text-victory font-mono font-bold text-xs mt-0.5 shrink-0">#{i+1}</span>
                                    <span className="leading-snug">{text}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                 </div>
             </div>
         ))}
      </div>

    </div>
  );
};
