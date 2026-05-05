"use client";
import { useState, useEffect } from 'react';
import { Train, Clock, RefreshCw, MapPin, AlertCircle } from 'lucide-react';

export default function Home() {
  const [trains, setTrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTrains = async () => {
    setLoading(true);
    setError(false);
    try {
      // This calls your /api/comboios/route.js
      const res = await fetch('/api/comboios'); 
      if (!res.ok) throw new Error('API Blocked');
      const data = await res.json();
      
      if (data.length === 0) {
        // If data is empty, it means the API connected but found no trains
        setError(true);
      } else {
        setTrains(data);
      }
    } catch (err) {
      console.error("Connection Error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchTrains, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-8">
      {/* Header Section */}
      <header className="flex justify-between items-center mb-8 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <h1 className="text-3xl font-black text-blue-700 tracking-tighter">NexPT</h1>
          </div>
          <p className="text-slate-500 text-sm font-medium">Partidas: Lisboa - Oriente</p>
        </div>
        <button 
          onClick={fetchTrains}
          disabled={loading}
          className="p-3 bg-slate-100 hover:bg-blue-100 text-blue-600 rounded-2xl transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
        </button>
      </header>

      {/* Train List Section */}
      <div className="space-y-4">
        {loading && trains.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-bounce mb-4 text-blue-600">
              <Train size={48} />
            </div>
            <p className="text-slate-400 font-medium italic">A consultar horários da IP...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 flex items-center gap-3">
            <AlertCircle />
            <p className="font-medium">Erro ao carregar dados. Tenta novamente.</p>
          </div>
        ) : trains.length > 0 ? (
          trains.map((comboio, idx) => (
            <div 
              key={idx} 
              className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-colors flex justify-between items-center"
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-3 rounded-xl text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                  <Train size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg text-slate-800">{comboio.destino}</span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                      {comboio.operator}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <MapPin size={12} />
                    <span>{comboio.status || 'Confirmado'}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end text-xl font-mono font-bold text-slate-900">
                  <Clock size={16} className="text-blue-500" />
                  {comboio.hora}
                </div>
                <div className={`text-[11px] font-black uppercase tracking-tighter ${comboio.atraso && comboio.atraso !== "0" ? 'text-red-500' : 'text-green-500'}`}>
                  {comboio.atraso && comboio.atraso !== "0" ? `Atraso +${comboio.atraso}m` : 'No Horário'}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-slate-100 p-10 rounded-3xl text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-500">Sem partidas previstas no momento.</p>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-xs text-slate-400 font-medium">
          Dados em tempo real via Infraestruturas de Portugal
        </p>
      </footer>
    </main>
  );
}