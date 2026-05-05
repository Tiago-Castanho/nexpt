import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = `https://servicos.infraestruturasdeportugal.pt/PFP/PFP_Station_Search_Board.aspx?type=2&stationId=9438001`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Referer': 'https://www.infraestruturasdeportugal.pt/'
      },
      next: { revalidate: 0 }
    });

    const text = await res.text();

    if (text.trim().startsWith('<')) {
      console.error("❌ Bloqueio WAF da IP detectado.");
      return NextResponse.json({ error: "IP_BLOCKED" }, { status: 403 });
    }

    return NextResponse.json(JSON.parse(text));
  } catch (err) {
    return NextResponse.json({ error: "CONNECTION_ERROR" }, { status: 500 });
  }
}