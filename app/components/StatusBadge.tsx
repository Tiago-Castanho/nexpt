interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isOk = status.toLowerCase().includes("horas");
  const isDelayed = status.toLowerCase().includes("atraso");
  const isCancelled = status.toLowerCase().includes("supri");

  const colors = isOk 
    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
    : isCancelled 
      ? "bg-red-500/10 text-red-400 border-red-500/20"
      : "bg-amber-500/10 text-amber-400 border-amber-500/20";

  return (
    <span className={`px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${colors}`}>
      {status}
    </span>
  );
}