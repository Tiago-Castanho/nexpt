"use client";
import { useState, useEffect } from 'react';
import { processTrainData } from '../utils/train-logic';

export default function NexPT() {
  const [trains, setTrains] = useState([]);
  const [status, setStatus] = useState("loading");

  const update = async () => {
    try {
      const res = await fetch('/api/comboios');
      if (!res.ok) throw new Error();

      const data = await res.json();
      const raw = data.Nodes?.[0]?.Elements || [];
      const station = data.Nodes?.[0]?.StationName || "Pragal";

      const processed = raw.map(t => processTrainData(t, station));
      setTrains(processed);
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    update();
    const i = setInterval(update, 60000); // 1 min para evitar novos bloqueios
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'monospace' }}>
      <header style={{ borderBottom: '3px solid #222', paddingBottom: '10px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ color: '#fa0', margin: 0, fontSize: '2.5rem' }}>PRAGAL</h1>
        <div style={{ color: status === 'online' ? '#0f0' : '#f00' }}>
          {status === 'online' ? "● LIVE" : "○ IP BLOCK"}
        </div>
      </header>

      <div style={{ display: 'grid', gap: '12px' }}>
        {trains.length > 0 ? trains.map((t, i) => (
          <div key={i} style={{ display: 'flex', padding: '18px', background: '#111', borderRadius: '6px', borderLeft: `6px solid ${t.severity}` }}>
            <div style={{ width: '90px', fontSize: '1.8rem', fontWeight: 'bold' }}>{t.Time}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{t.DestinyStationName}</div>
              <div style={{ color: '#444', fontSize: '0.9rem' }}>{t.ServiceType} {t.TrainId}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', color: '#00f2ff' }}>{t.Platform || "—"}</div>
              {t.finalDelay > 0 && <div style={{ color: t.severity }}>+{t.finalDelay} min</div>}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#333' }}>
            {status === 'offline' ? "Muda para o Hotspot do telemóvel para contornar o bloqueio de IP." : "A ligar aos servidores da IP..."}
          </div>
        )}
      </div>
    </div>
  );
}