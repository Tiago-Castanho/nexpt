// utils/train-logic.js

export function obterComboiosAtivos(data) {
  // Filtra apenas os que têm 'live: true' (em circulação)
  const ativos = Object.entries(data.trains)
    .filter(([id, info]) => info.live === true)
    .map(([id, info]) => ({
      id,
      destino: info.destination,
      atraso: info.delay_msg,
      onde: info.nodes.length > 0 ? info.nodes[info.nodes.length - 1].station_name : "N/A"
    }));

  // Filtra os que estão cancelados/suprimidos
  const suprimidos = Object.entries(data.trains)
    .filter(([id, info]) => info.canceled === true)
    .map(([id, info]) => ({
      id,
      destino: info.destination
    }));

  return { ativos, suprimidos };
}