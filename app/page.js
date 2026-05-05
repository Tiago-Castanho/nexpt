"use client";

import { useEffect, useState } from "react";
import { processTrainData } from "@/utils/train-logic";

export default function Home() {
  const [trains, setTrains] = useState([]);
  const [status, setStatus] = useState("loading");

  const load = async () => {
    try {
      const res = await fetch("/api/comboios");

      if (!res.ok) throw new Error();

      const data = await res.json();

      const raw = data?.Nodes?.[0]?.Elements || [];
      const station = data?.Nodes?.[0]?.StationName || "Pragal";

      const processed = raw.map((t) =>
        processTrainData(t, station)
      );

      setTrains(processed);
      setStatus("online");
    } catch {
      setStatus("offline");
    }
  };

  useEffect(() => {
    load();
    const i = setInterval(load, 60000);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: 20 }}>
      <h1 style={{ color: "#fa0" }}>PRAGAL LIVE</h1>

      <div style={{ color: status === "online" ? "#0f0" : "#f00" }}>
        {status}
      </div>

      {trains.length === 0 ? (
        <p style={{ opacity: 0.4 }}>Sem dados disponíveis...</p>
      ) : (
        trains.map((t, i) => (
          <div key={i} style={{ padding: 10, borderBottom: "1px solid #222" }}>
            <div>{t.Time}</div>
            <div>{t.DestinyStationName}</div>
            <div>{t.finalDelay ? `+${t.finalDelay}` : "on time"}</div>
          </div>
        ))
      )}
    </div>
  );
}