export async function GET() {
  try {
    // We are switching to a public schedule search endpoint which is often more stable
    const url = `https://servicos.infraestruturasdeportugal.pt/proxy/piv/api/v1/horarios/estacao/0002/partidas`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Referer': 'https://www.infraestruturasdeportugal.pt/pt-pt/horarios',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache'
      }
    });

    const contentType = response.headers.get("content-type");
    
    // Check if we actually got JSON. If we got HTML, it means we are blocked.
    if (!contentType || !contentType.includes("application/json")) {
      console.error("IP blocked us with an HTML page.");
      return Response.json({ error: "Blocked by IP Security" }, { status: 403 });
    }

    const data = await response.json();
    const list = data.listaHorarios || [];

    const cleanTrains = list.map(t => ({
      destino: t.nomeDestino || 'N/A',
      hora: t.horaProgramada || '--:--',
      atraso: t.atraso || "0",
      operator: t.operador || 'CP',
      status: t.estadoComboio || 'A confirmar'
    }));

    return Response.json(cleanTrains);
  } catch (error) {
    console.error("Detailed Error:", error.message);
    return Response.json([], { status: 500 });
  }
}