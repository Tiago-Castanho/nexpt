"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { 
  ArrowRightLeft, Zap, TrainFront, MapPin, CheckCircle2, 
  Circle, Navigation, CircleDot, Loader2, ChevronDown
} from 'lucide-react'

interface Paragem { id: string; estacao: string; hora: string; passou: boolean; }
interface Comboio { id: string; hora: string; destino: string; destinoId: string; atraso: string; suprimido: boolean; sentido: "Norte" | "Sul"; carruagens: number; itinerario: Paragem[]; }

const ESTACOES = [
  { nome: "Roma-Areeiro", id: "9466035", zona: "Norte" },
  { nome: "Entrecampos", id: "9466050", zona: "Norte" },
  { nome: "Sete Rios", id: "9466076", zona: "Norte" },
  { nome: "Campolide", id: "9467033", zona: "Norte" },
  { nome: "Pragal", id: "9417087", zona: "Sul" },
  { nome: "Corroios", id: "9417137", zona: "Sul" },
  { nome: "Foros de Amora", id: "9417152", zona: "Sul" },
  { nome: "Fogueteiro", id: "9417186", zona: "Sul" },
  { nome: "Coina", id: "9417236", zona: "Sul" },
  { nome: "Pinhal Novo", id: "9468007", zona: "Sul" },
  { nome: "Setúbal", id: "9468122", zona: "Sul" },
];

const ItinerarioBar = ({ itinerario, origemId, destinoId, formatName }: any) => {
  const ultimaParagem = [...(itinerario || [])].reverse().find(p => p.passou);

  return (
    <div className="flex items-center gap-6 py-8 border-y border-white/5 overflow-x-auto no-scrollbar mb-8 scroll-smooth">
      {itinerario?.map((p: any, idx: number) => {
        const isAtual = ultimaParagem?.id === p.id;
        const isTarget = p.id === origemId || p.id === destinoId;

        return (
          <div key={`${p.id}-${idx}`} className="flex flex-col items-center min-w-[100px]">
            <div className={`mb-4 transition-all duration-500 ${isAtual ? 'text-blue-400 scale-125' : p.passou ? 'text-emerald-500' : isTarget ? 'text-white' : 'text-white/10'}`}>
              {isAtual ? <Navigation size={22} className="rotate-45 fill-current" /> : 
               p.passou ? <CheckCircle2 size={18} /> :
               p.id === destinoId ? <MapPin size={20} className="fill-current" /> :
               p.id === origemId ? <CircleDot size={18} /> : <Circle size={14} />}
            </div>
            <span className={`text-[10px] font-black uppercase text-center tracking-tighter ${isAtual ? 'text-blue-400' : p.passou ? 'text-emerald-500/60' : isTarget ? 'text-white' : 'text-white/20'}`}>
              {formatName(p.estacao)}
            </span>
          </div>
        )
      })}
    </div>
  );
};

export default function NexPT() {
  const [trains, setTrains] = useState<Comboio[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [origem, setOrigem] = useState(ESTACOES[6]) 
  const [destinoUser, setDestinoUser] = useState(ESTACOES[1]) 

  const fetchTrains = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    try {
      const res = await fetch(`/api/comboios?stationId=${origem.id}&t=${Date.now()}`);
      const data = await res.json();
      setTrains(Array.isArray(data) ? data : []);
    } catch (e) { 
      setTrains([]); 
    } finally { 
      setLoading(false); 
    }
  }, [origem.id]);

  useEffect(() => {
    fetchTrains(true);
    const timer = setInterval(() => fetchTrains(false), 30000);
    return () => clearInterval(timer);
  }, [fetchTrains]);

  const formatStationName = (name: string) => {
    const u = name.toUpperCase();
    if (u.includes("SETE RIOS")) return "Sete Rios";
    if (u.includes("ROMA")) return "Roma";
    if (u.includes("FOROS")) return "Amora";
    return name.split(/[\s-]/)[0];
  };

  const filtered = useMemo(() => {
    const agora = new Date();
    const hAtual = agora.getHours();

    return [...trains]
      .filter((t) => t.sentido === destinoUser.zona)
      .sort((a, b) => {
        const [hA, mA] = a.hora.split(':').map(Number);
        const [hB, mB] = b.hora.split(':').map(Number);
        let tA = hA * 60 + mA;
        let tB = hB * 60 + mB;

        if (hAtual >= 20) {
          if (tA < 300) tA += 1440;
          if (tB < 300) tB += 1440;
        }
        return tA - tB;
      })
      .slice(0, showAll ? 6 : 2);
  }, [trains, destinoUser.zona, showAll]);

  return (
    <main className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1100px] mx-auto space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-4 bg-white/[0.02] p-6 rounded-[30px] border border-white/5">
          <select value={origem.id} onChange={(e) => { setOrigem(ESTACOES.find(s => s.id === e.target.value)!); setShowAll(false); }} className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl font-bold uppercase text-xs appearance-none cursor-pointer text-center outline-none">
            {ESTACOES.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <button onClick={() => { const t = origem; setOrigem(destinoUser); setDestinoUser(t); setShowAll(false); }} className="p-4 rounded-full bg-blue-500/10 text-blue-500 active:scale-90 transition-transform"><ArrowRightLeft size={24} /></button>
          <select value={destinoUser.id} onChange={(e) => { setDestinoUser(ESTACOES.find(s => s.id === e.target.value)!); setShowAll(false); }} className="w-full bg-slate-950 border border-white/10 p-4 rounded-xl font-bold uppercase text-xs appearance-none cursor-pointer text-center outline-none">
            {ESTACOES.map(s => <option key={s.id} value={s.id} disabled={s.id === origem.id}>{s.nome}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
        ) : (
          <div className="space-y-8">
            {filtered.map((train) => {
              const infoChegada = train.itinerario?.find(p => p.id === destinoUser.id);
              const viagemComecou = train.itinerario?.some(p => p.passou);

              return (
                <div key={`${train.id}-${train.hora}`} className={`p-8 rounded-[40px] border transition-all ${train.suprimido ? 'opacity-40 bg-red-950/10 border-red-900/20' : 'bg-[#05070a] border-white/5'}`}>
                  
                  <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center gap-8">
                      <div className="flex flex-col items-center justify-center bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                        <div className="flex gap-1">
                          {[...Array(train.carruagens)].map((_, i) => (
                            <div key={i} className="w-2.5 h-5 bg-blue-500 rounded-sm" />
                          ))}
                        </div>
                        <span className="text-[9px] font-black mt-2 text-blue-400/80 uppercase">{train.carruagens} UNIDADES</span>
                      </div>
                      <div className="flex flex-col">
                        <div className="text-[10px] font-black uppercase text-blue-500 flex items-center gap-2 mb-2">
                            <Zap size={12} className="fill-current" /> {viagemComecou ? 'Em Circulação' : 'Programado'}
                        </div>
                        <h2 className="text-7xl font-mono font-black italic tracking-tighter leading-none">{train.hora}</h2>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-white/30 mb-1">Estimativa Destino</p>
                      <p className="text-3xl font-mono font-black text-blue-100">{infoChegada?.hora || "--:--"}</p>
                    </div>
                  </div>

                  {viagemComecou ? (
                    <ItinerarioBar 
                      itinerario={train.itinerario} 
                      origemId={origem.id} 
                      destinoId={destinoUser.id} 
                      formatName={formatStationName} 
                    />
                  ) : (
                    <div className="h-24 mb-8 border-y border-white/[0.02]" />
                  )}

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-mono text-blue-400/60 mb-1 tracking-widest uppercase italic">Serviço Fertagus {train.id}</p>
                      <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">{train.destino}</h3>
                    </div>
                    <div className={`px-6 py-3 rounded-full border font-black text-[10px] uppercase tracking-widest ${train.atraso ? 'border-orange-500/20 text-orange-400 bg-orange-500/5' : 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'}`}>
                      {train.suprimido ? 'Suprimido' : (train.atraso || 'Programado')}
                    </div>
                  </div>
                </div>
              );
            })}

            {trains.length > 2 && (
              <button 
                onClick={() => setShowAll(!showAll)}
                className="w-full py-6 rounded-[30px] border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-all flex items-center justify-center gap-3 group"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 group-hover:text-blue-400 transition-colors">
                  {showAll ? 'Mostrar Menos' : 'Ver mais horários'}
                </span>
                <ChevronDown size={16} className={`text-white/20 group-hover:text-blue-400 transition-all ${showAll ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
        )}
      </div>
      <style jsx global>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
    </main>
  )
}