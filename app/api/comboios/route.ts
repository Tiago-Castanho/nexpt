import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const parseIPSafe = (text: string) => {
  try {
    const clean = text.replace(/<[^>]*>?/gm, '').trim();
    const jsonStart = clean.indexOf('{');
    if (jsonStart === -1) return null;
    return JSON.parse(clean.substring(jsonStart));
  } catch (e) {
    return null;
  }
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

    if (!stationId) return NextResponse.json([]);

    const agora = new Date();
    const dataHoje = agora.toISOString().split('T')[0];
    
    const f = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': 'https://www.infraestruturasdeportugal.pt/'
    };

    const urlPartidas = `https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/partidas-chegadas/${stationId}/${f(agora)}/${f(new Date(agora.getTime() + 6 * 60 * 60 * 1000))}/URB%7CSUBUR`;
    
    const resPartidas = await fetch(urlPartidas, { cache: 'no-store', headers });
    const dataPartidas = parseIPSafe(await resPartidas.text());

    if (!dataPartidas?.response) return NextResponse.json([]);

    // 1. Extrair comboios e remover duplicados por ID
    const comboiosMap = new Map();
    
    for (const node of dataPartidas.response) {
      for (const c of (node.NodesComboioTabelsPartidasChegadas || [])) {
        if (c.Operador === "FERTAGUS") {
          // Se o comboio já existe, mantemos o que tem dados mais completos (ou o primeiro que aparecer)
          if (!comboiosMap.has(c.NComboio1)) {
            comboiosMap.set(c.NComboio1, c);
          }
        }
      }
    }

    const comboiosBrutos = Array.from(comboiosMap.values());

    const comboiosCompletos = await Promise.all(comboiosBrutos.map(async (c) => {
      const nComboio = c.NComboio1;
      let itinerario = [];

      try {
        const resGPS = await fetch(`https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/horarios-ncombio/${nComboio}/${dataHoje}`, { cache: 'no-store', headers });
        const dataGPS = parseIPSafe(await resGPS.text());
        const nodes = dataGPS?.response?.NodesHorarioNComboio || dataGPS?.response?.NodesPassagemComboio || [];
        
        itinerario = nodes.map((p: any) => ({
          id: String(p.CodEstacao || p.NodeID),
          estacao: p.NomeEstacao,
          hora: p.Hora || p.HoraProgramada,
          passou: p.ComboioPassou === true || p.ComboioPassou === "S"
        }));
      } catch (e) {}

      const obs = (c.Observacoes || "").toUpperCase();
      const destName = (c.NomeEstacaoDestino || "").toUpperCase();
      const isNorte = destName.includes("ROMA") || destName.includes("AREEIRO") || destName.includes("ENTRECAMPOS") || destName.includes("SETE RIOS");

      return {
        id: String(nComboio),
        hora: (c.DataHoraPartidaChegada || "").match(/\d{2}:\d{2}/)?.[0] || "--:--",
        destino: c.NomeEstacaoDestino,
        destinoId: String(c.CodEstacaoDestino),
        atraso: c.TempoAtraso > 0 ? `+${c.TempoAtraso} MIN` : "",
        suprimido: obs.includes("SUPRIMIDO") || obs.includes("CANCELADO"),
        sentido: isNorte ? "Norte" : "Sul",
        carruagens: (obs.includes("DUPLA") || obs.includes("8 CAR") || parseInt(nComboio) < 14300) ? 8 : 4,
        itinerario
      };
    }));

    return NextResponse.json(comboiosCompletos);

  } catch (e) {
    return NextResponse.json([]);
  }
}