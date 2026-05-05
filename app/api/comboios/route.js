import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const stationId = searchParams.get('stationId') || '9438001';
  const type = searchParams.get('type') || '2';

  try {
    const url = `https://servicos.infraestruturasdeportugal.pt/PFP/PFP_Station_Search_Board.aspx?type=${type}&stationId=${stationId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Headers essenciais que o browser envia para este endpoint específico
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Referer': 'https://www.infraestruturasdeportugal.pt/',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept-Language': 'pt-PT,pt;q=0.9',
        'Cache-Control': 'no-cache'
      },
      cache: 'no-store'
    });

    const text = await response.text();

    // Se o texto contém HTML, o IP bloqueou o servidor local
    if (text.includes('<html') || text.includes('<!DOCTYPE')) {
      return NextResponse.json({ 
        trains: [], 
        stationName: "Acesso Negado (IP)", 
        isBlocked: true 
      });
    }

    try {
      const data = JSON.parse(text);
      return NextResponse.json({
        trains: data.Nodes?.[0]?.Elements || [],
        stationName: data.Nodes?.[0]?.StationName || "Estação",
        isBlocked: false
      });
    } catch (e) {
      return NextResponse.json({ trains: [], isBlocked: true });
    }

  } catch (error) {
    return NextResponse.json({ trains: [], isBlocked: true }, { status: 200 });
  }
}