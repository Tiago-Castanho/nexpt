import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

    if (!stationId) return NextResponse.json([]);

    const agora = new Date();
    const fim = new Date(agora.getTime() + 4 * 60 * 60 * 1000);

    const f = (d: Date) => {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    // Construção da URL - Foros de Amora deve ser 9417111
    const url = `https://servicos.infraestruturasdeportugal.pt/negocios-e-servicos/partidas-chegadas/${stationId}/${f(agora)}/${f(fim)}/URB%7CSUBUR`;
    
    console.log(`>>> A CONSULTAR IP: ${url}`); // Vê isto no teu terminal!

    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
        'Referer': 'https://www.infraestruturasdeportugal.pt/'
      }
    });

    const texto = await res.text();
    if (!texto.includes('{')) return NextResponse.json([]);

    const data = JSON.parse(texto.replace(/<[^>]*>?/gm, '').trim());
    const comboiosMap = new Map();

    const IDS_NORTE = ["9431112", "9431021", "9431054", "9431088", "9431096"];
    const NOMES_NORTE = ["ROMA", "AREEIRO", "ENTRECAMPOS", "SETE RIOS", "CAMPOLIDE"];

    if (data.response && Array.isArray(data.response)) {
      data.response.forEach((node: any) => {
        (node.NodesComboioTabelsPartidasChegadas || []).forEach((c: any) => {
          if (c.Operador === "FERTAGUS") {
            const num = String(c.NComboio1);
            const dName = (c.NomeEstacaoDestino || "").toUpperCase();
            const dId = String(c.CodEstacaoDestino);

            const isNorte = IDS_NORTE.includes(dId) || NOMES_NORTE.some(n => dName.includes(n));
            
            // Captura HH:mm
            const match = (c.DataHoraPartidaChegada || "").match(/\d{2}:\d{2}/);
            const hora = match ? match[0] : "00:00";

            const item = {
              id: num,
              hora,
              destino: c.NomeEstacaoDestino,
              atraso: c.Observacoes?.toLowerCase().includes("suprimido") ? "SUPRIMIDO" : 
                      (c.TempoAtraso && c.TempoAtraso !== "0" ? `+${c.TempoAtraso} MIN` : ""),
              passou: c.ComboioPassou,
              sentido: isNorte ? "Norte" : "Sul"
            };

            const exist = comboiosMap.get(num);
            if (!exist || hora > exist.hora) comboiosMap.set(num, item);
          }
        });
      });
    }

    return NextResponse.json(Array.from(comboiosMap.values()).sort((a, b) => a.hora.localeCompare(b.hora)));
  } catch (e) {
    return NextResponse.json([]);
  }
}