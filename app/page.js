"use client";

import { useEffect, useState } from "react";
import { processTrainData } from "@/utils/train-logic";

export default function Home() {
  const [trains, setTrains] = useState([]);

  const load = async () => {
    const res = await fetch("/api/comboios");
    const data = await res.json();

    const raw = data.Nodes?.[0]?.Elements || [];
    const station = data.Nodes?.[0]?.StationName || "Pragal";

    const processed = raw.map((t) =>
      processTrainData(t, station)
    );

    setTrains(processed);
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "#fa0" }}>PRAGAL LIVE</h1>

      {trains.map((t, i) => (
        <div key={i} style={{ padding: 10, borderBottom: "1px solid #222" }}>
          <div>{t.Time}</div>
          <div>{t.DestinyStationName}</div>
          <div style={{ color: t.severity }}>
            {t.finalDelay > 0 ? `+${t.finalDelay}` : "on time"}
          </div>
        </div>
      ))}
    </div>
  );
}