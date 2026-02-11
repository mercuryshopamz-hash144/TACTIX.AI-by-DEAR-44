import React from 'react';

interface TacticalFieldProps {
  formation: string; // e.g., "4-3-3 A"
  teamName: string;
  isOpponent?: boolean;
}

// Helper to get rough positions for visualization based on formation string
const getPositions = (formation: string) => {
  const f = formation.replace(/\D/g, ''); // Extract numbers e.g. "433"
  // Default 4-3-3
  let layers = [1, 4, 3, 3]; 
  
  if (f.length === 3) {
    layers = [1, parseInt(f[0]), parseInt(f[1]), parseInt(f[2])];
  } else if (f.length === 4) {
    layers = [1, parseInt(f[0]), parseInt(f[1]), parseInt(f[2]), parseInt(f[3])];
  }

  // Generate coordinates for each player in each layer
  const positions: { x: number; y: number }[] = [];
  const fieldHeight = 100;
  const fieldWidth = 100;
  
  // Total sections = layers.length
  const sectionHeight = fieldHeight / (layers.length + 1);

  layers.forEach((count, layerIndex) => {
    const y = (layerIndex + 0.8) * sectionHeight; // Spread vertically
    for (let i = 0; i < count; i++) {
        // Spread horizontally centered
        const x = (fieldWidth * (i + 1)) / (count + 1);
        positions.push({ x, y });
    }
  });

  return positions;
};

export const TacticalField: React.FC<TacticalFieldProps> = ({ formation, teamName, isOpponent = false }) => {
  const positions = getPositions(formation);

  const pinColor = isOpponent 
    ? "bg-danger border-red-900 shadow-danger/50" 
    : "bg-ocean-500 border-ocean-800 shadow-ocean-500/50";
  
  const labelColor = isOpponent ? "text-danger" : "text-ocean-500";

  return (
    <div className={`relative w-full aspect-[2/3] max-w-[300px] mx-auto bg-slate-800/80 rounded-lg border-2 ${isOpponent ? 'border-danger/30' : 'border-ocean-500/30'} overflow-hidden shadow-2xl backdrop-blur-sm`}>
        {/* Field Markings */}
        <div className="absolute inset-2 border border-slate-600/20 rounded-sm"></div>
        <div className="absolute top-0 left-[25%] right-[25%] h-[6%] border-b border-l border-r border-slate-600/20"></div>
        <div className="absolute bottom-0 left-[25%] right-[25%] h-[6%] border-t border-l border-r border-slate-600/20"></div>
        <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-600/20"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-slate-600/20 rounded-full"></div>

        {/* Team Label */}
        <div className={`absolute top-2 left-0 right-0 text-center font-tech text-xs font-bold ${labelColor} uppercase tracking-widest text-glow`}>
            {formation}
        </div>

        {/* Player Pins */}
        {positions.map((pos, idx) => (
            <div
                key={idx}
                className={`absolute w-4 h-4 rounded-full border-2 shadow-lg transform -translate-x-1/2 -translate-y-1/2 ${pinColor} opacity-0 animate-formation-slide`}
                style={{ 
                    left: `${pos.x}%`, 
                    top: `${isOpponent ? 100 - pos.y : pos.y}%`,
                    animationDelay: `${idx * 100}ms`
                }}
            >
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-slate-400 opacity-0 hover:opacity-100 whitespace-nowrap bg-black/80 px-1 rounded pointer-events-none">
                   {idx + 1}
                </div>
            </div>
        ))}
    </div>
  );
};
