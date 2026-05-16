import { useEffect, useState } from 'react';
interface Props {
  areaName: string | null;
}
export function AreaTooltip({ areaName }: Props) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);
  if (!areaName) return null;
  return (
    <div
      className="fixed z-[100] pointer-events-none bg-slate-900/90 text-white p-3 rounded-lg border border-white/20 shadow-2xl backdrop-blur-md transition-opacity duration-200"
      style={{
        left: pos.x + 15,
        top: pos.y + 15,
        opacity: areaName ? 1 : 0
      }}
    >
      <div className="text-[9px] uppercase font-bold text-blue-400 tracking-widest mb-1">
        DKI Jakarta Territory
      </div>
      <div className="text-sm font-bold truncate max-w-[200px]">
        {areaName.toUpperCase()}
      </div>
      <div className="mt-2 pt-2 border-t border-white/10 flex gap-4">
        <div>
          <div className="text-[9px] text-white/50 uppercase">AQI Status</div>
          <div className="text-xs text-green-400 font-mono font-bold">GOOD</div>
        </div>
        <div>
          <div className="text-[9px] text-white/50 uppercase">Active Sensors</div>
          <div className="text-xs font-mono">3 Units</div>
        </div>
      </div>
      <div className="mt-1 text-[8px] text-white/30 italic">
        Real-time interpolation active
      </div>
    </div>
  );
}