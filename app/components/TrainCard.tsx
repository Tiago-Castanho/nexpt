import { ChevronRight, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';

export default function TrainCard({ train }: { train: any }) {
  return (
    <div className="group relative overflow-hidden glass-card p-5 rounded-2xl hover:border-blue-500/50 transition-all duration-300 animate-in">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-6">
          <div className="text-center min-w-[70px]">
            <span className="text-2xl font-bold block neon-text">{train.HoraProgramada}</span>
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Partida</span>
          </div>

          <div className="h-12 w-[1px] bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                train.Servico === "ALFA" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
              }`}>
                {train.Servico} {train.Comboio}
              </span>
            </div>
            <h2 className="text-xl font-bold uppercase tracking-tight group-hover:text-blue-400 transition-colors">
              {train.Destino}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-center">
            <span className="block text-[10px] text-slate-500 uppercase font-bold">Linha</span>
            <span className="text-2xl font-mono font-bold text-cyan-400 neon-text">{train.Linha || '--'}</span>
          </div>
          
          <div className="hidden md:flex flex-col items-end gap-1">
            <StatusBadge status={train.EstadoComboio} />
            <div className="flex items-center gap-1 text-slate-500">
              <Clock size={12} />
              <span className="text-[10px] font-mono">{train.HoraComboio}</span>
            </div>
          </div>
          
          <ChevronRight className="text-slate-700 group-hover:text-blue-500 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );
}