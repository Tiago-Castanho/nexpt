"use client";

import { useEffect, useState } from 'react';
import { Wifi } from 'lucide-react';

export default function StationHeader({ name = "Pragal" }: { name?: string }) {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-slate-900 pb-12">
      <div className="flex flex-col items-center md:items-start gap-1">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-2xl">
            <Wifi size={24} className="text-white animate-pulse" />
          </div>
          <h1 className="text-6xl font-black uppercase tracking-tighter text-white">
            Nex<span className="text-blue-600">PT</span>
          </h1>
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-600 pl-1">
          Monitorização de Rede • {name}
        </p>
      </div>

      <div className="relative group">
        <div className="absolute -inset-4 bg-blue-600/5 rounded-[40px] blur-xl group-hover:bg-blue-600/10 transition-all"></div>
        <div className="relative bg-slate-900/40 border border-slate-800/80 px-12 py-6 rounded-[32px] backdrop-blur-xl">
          <p className="text-[10px] text-blue-500 uppercase font-black mb-1 tracking-[0.4em] text-center">Global System Time</p>
          <p className="text-6xl font-mono font-black text-white tracking-tighter leading-none">
            {mounted ? time.toLocaleTimeString('pt-PT', { hour12: false }) : "--:--:--"}
          </p>
        </div>
      </div>
    </div>
  );
}