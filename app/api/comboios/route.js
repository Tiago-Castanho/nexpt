import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stationId = '9417087';
    // Usamos a data atual formatada
    const agora = new Date();
    const dataStr = agora.toISOString().split('T')[0] + ' ' + 
                    String(agora.getHours()).padStart(2, '0') + ':' + 
                    String(agora.getMinutes()).padStart(2, '0');

    // Este é o URL que a LiveTagus provavelmente ataca, mas com um "disfarce"
    const url = `https://servicos.infraestruturasdeportugal.pt/pt-pt/negocios-e-servicos/partidas-chegadas-search/${stationId}/${encodeURIComponent(dataStr)}/2026-05-06%2004:00/INTERNACIONAL,%20ALFA,%20IC,%20IR,%20REGIONAL,%20URB%7CSUBUR,%20ESPECIAL`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // A ordem e o tipo de headers aqui é o que faz a diferença
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'pt-PT,pt;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Connection': 'keep-alive',
        'Referer': 'https://servicos.infraestruturasdeportugal.pt/pt-pt/horarios',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
      },
      cache: 'no-store'
    });

    const texto = await response.text();

    // Se continuar a vir HTML, a IP baniu o teu IP de casa temporariamente
    if (texto.includes('<!DOCTYPE')) {
      return NextResponse.json({ 
        success: false, 
        error: "Bloqueio de IP. A IP (Infraestruturas) detetou o teu servidor local.",
        dica: "Se publicares isto na Vercel (online), provavelmente já vai funcionar porque o IP muda."
      });
    }

    const data = JSON.parse(texto);
    const lista = data.response[0].NodesComboioTabelsPartidasChegadas;

    const comboios = lista
      .filter(item => item.Operador === "FERTAGUS")
      .map(item => ({
        id: item.NComboio1,
        hora: item.DataHoraPartidaChegada,
        destino: item.NomeEstacaoDestino,
        atraso: item.Observacoes || "No horário",
        estado: item.ComboioPassou ? "Passou" : "Confirmado"
      }));

    return NextResponse.json({ success: true, comboios });

  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}