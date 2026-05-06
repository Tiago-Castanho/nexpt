"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { ArrowRight, Zap, Users, TrainFront, Clock, CheckCircle2, Circle } from 'lucide-react'

// Definição estendida para suportar o itinerário (nodes)
interface Comboio {
  id: string;
  hora: string;
  destino: string;
  atraso: string;
  passou: boolean;
  sentido: "Norte" | "Sul";
  itinerario?: { estacao: string; hora: string; passou: boolean }[];
}

// IDs TÉCNICOS CORRIGIDOS (Essenciais para o backend responder corretamente)
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

export default function NexPT() {
  const [trains, setTrains] = useState<Comboio[]>([])
  const [loading, setLoading] = useState(true)
  const [origem, setOrigem] = useState(ESTACOES[4]) // Pragal
  const [destinoUser, setDestinoUser] = useState(ESTACOES[0]) // Roma-Areeiro
  const [currentTime, setCurrentTime] = useState("")

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTrains = useCallback(async () => {
    try {
      const res = await fetch(`/api/comboios?stationId=${origem.id}&_t=${Date.now()}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrains(data);
      }
    } catch (e) {
      console.error("Erro na procura de dados:", e);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  }, [origem.id]);

  useEffect(() => {
    setLoading(true);
    setTrains([]); 
    fetchTrains();
    
    const interval = setInterval(fetchTrains, 30000);
    return () => clearInterval(interval);
  }, [fetchTrains]);

  const handleOrigemChange = (id: string) => {
    const novaEstacao = ESTACOES.find(s => s.id === id)!;
    setOrigem(novaEstacao);
    if (id === destinoUser.id) {
      const fallback = ESTACOES.find(s => s.id !== id)!;
      setDestinoUser(fallback);
    }
  };

  const filtered = useMemo(() => {
    return trains
      .filter((t) => t.sentido === destinoUser.zona && !t.passou)
      .slice(0, 4);
  }, [trains, destinoUser.zona]);

  return (
    <main className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
      <div className="max-w-[1700px] mx-auto space-y-12">
        
        <div className="flex justify-between items-end border-b border-white/10 pb-8">
          <div className="flex items-center gap-3 text-blue-500">
            <TrainFront size={40} />
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              Nex<span className="text-white">PT</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-4xl font-mono font-black tabular-nums tracking-tighter">
              {currentTime}
            </p>
            <p className="text-[10px] text-blue-500/50 font-bold uppercase tracking-[0.3em]">Live Node Tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-8 bg-slate-900/20 p-10 rounded-[50px] border border-white/5 backdrop-blur-3xl shadow-2xl">
          <div className="space-y-2">
            <label className="text-blue-500 font-black uppercase text-[10px] ml-4 tracking-[0.3em]">Estação de Partida</label>
            <select 
              value={origem.id}
              onChange={(e) => handleOrigemChange(e.target.value)}
              className="w-full bg-slate-950 border-2 border-slate-800 p-6 rounded-3xl font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              {ESTACOES.map(st => (
                <option key={st.id} value={st.id}>{st.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-center text-blue-500/20 max-lg:rotate-90">
            <ArrowRight size={40} />
          </div>

          <div className="space-y-2">
            <label className="text-blue-500 font-black uppercase text-[10px] ml-4 tracking-[0.3em]">Destino Pretendido</label>
            <select 
              value={destinoUser.id}
              onChange={(e) => setDestinoUser(ESTACOES.find(s => s.id === e.target.value)!)}
              className="w-full bg-slate-950 border-2 border-slate-800 p-6 rounded-3xl font-black uppercase outline-none focus:border-blue-500 transition-all cursor-pointer appearance-none"
            >
              {ESTACOES.map(st => (
                <option key={st.id} value={st.id} disabled={st.id === origem.id}>
                  {st.nome}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-40 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 mb-4"></div>
            <p className="text-blue-500 font-black uppercase tracking-[0.5em] text-sm animate-pulse">Sincronizando {origem.nome}...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {filtered.length > 0 ? filtered.map((train) => (
              <div 
                key={train.id} 
                className="relative bg-slate-900/30 border-2 border-slate-800 p-12 rounded-[70px] min-h-[520px] flex flex-col justify-between group hover:border-blue-500/50 transition-all duration-500 shadow-2xl"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-blue-500">
                      <Zap size={24} fill="currentColor" />
                      <span className="text-lg font-black tracking-[0.5em] uppercase italic">Partida</span>
                    </div>
                    <h2 className="text-[12rem] font-mono font-black leading-[0.75] tracking-tighter">
                      {train.hora}
                    </h2>
                  </div>
                  <div className={`h-12 w-12 rounded-full ${train.atraso ? 'bg-orange-500 animate-pulse' : 'bg-emerald-500'}`} />
                </div>

                {/* VISUALIZAÇÃO DE NODES (O NOVO COMPONENTE DE HORAS PREVISTAS) */}
                <div className="relative overflow-x-auto no-scrollbar py-4 mb-4">
                  <div className="flex items-start gap-8 min-w-max">
                    {train.itinerario?.map((p, idx) => (
                      <div key={idx} className="flex flex-col items-center w-20 relative">
                        {idx !== train.itinerario!.length - 1 && (
                          <div className={`absolute top-2.5 left-1/2 w-full h-[1px] ${p.passou ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                        )}
                        <div className={`${p.passou ? 'text-emerald-500' : 'text-white/10'}`}>
                          {p.passou ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                        </div>
                        <p className={`text-[8px] font-bold uppercase text-center mt-3 leading-tight ${p.passou ? 'opacity-30' : 'opacity-100'}`}>
                          {p.estacao.split(' ')[0]}
                        </p>
                        <p className="text-[8px] font-mono opacity-40 mt-1">{p.hora}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                   <h3 className="text-8xl font-black tracking-tighter uppercase leading-none truncate">
                     {train.destino}
                   </h3>
                   <p className="text-blue-500 font-black tracking-[0.2em] text-xs uppercase italic">
                     Sentido {train.sentido}
                   </p>
                </div>

                <div className="flex justify-between items-center pt-8 border-t border-white/5 text-slate-500 font-black tracking-widest text-[11px] uppercase">
                  <div className="flex items-center gap-2"><Users size={18} /> Lotação OK</div>
                  <div className={`flex items-center gap-2 font-black ${train.atraso ? 'text-orange-500' : 'text-emerald-500'}`}>
                    <Clock size={18} /> {train.atraso || "No Horário"}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-40 text-center border-2 border-dashed border-slate-800 rounded-[60px] bg-slate-900/5">
                <p className="text-slate-500 text-xl font-black uppercase tracking-[0.3em]">
                  Sem comboios de {origem.nome} para {destinoUser.nome}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}