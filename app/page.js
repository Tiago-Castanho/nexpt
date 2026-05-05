"use client";
import { useState, useEffect } from 'react';

export default function NexPT() {
  const [data, setData] = useState({ trains: [], stationName: "", isBlocked: false });
  const [type, setType] = useState('2'); // 2: Partidas | 1: Chegadas
  const [loading, setLoading] = useState(true);

  const fetchData = async (currentType = type) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comboios?stationId=9438001&type=${currentType}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error("Erro na ligação");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 60000); // 1 minuto para evitar ban de IP
    return () => clearInterval(interval);
  }, [type]);

  return (
    <div className="nexpt-app">
      <header className="main-header">
        <div className="info">
          <div className={`status-dot ${data.isBlocked ? 'blocked' : 'live'}`}></div>
          <h1>{data.stationName || "Carregando..."}</h1>
        </div>

        <div className="direction-switcher">
          <button className={type === '2' ? 'active' : ''} onClick={() => setType('2')}>PARTIDAS</button>
          <button className={type === '1' ? 'active' : ''} onClick={() => setType('1')}>CHEGADAS</button>
        </div>
      </header>

      {data.isBlocked && (
        <div className="block-warning">
          ⚠️ O teu IP local está temporariamente restringido pela IP. Tenta abrir o site oficial para validar a sessão.
        </div>
      )}

      <main className="board">
        {data.trains?.map((t, i) => (
          <div key={i} className={`train-row ${t.Delay > 0 ? 'late' : 'ontime'}`}>
            <div className="time-block">
              <span className="hour">{t.Time}</span>
              {t.Delay > 0 && <span className="delay">+{t.Delay}m</span>}
            </div>
            <div className="dest-block">
              <span className="dest-name">{t.DestinyStationName}</span>
              <span className="service">{t.ServiceType} {t.TrainId}</span>
            </div>
            <div className="platform-block">
              <span className="label">LINHA</span>
              <span className="num">{t.Platform || "—"}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}