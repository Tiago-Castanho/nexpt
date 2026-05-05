"use client";

import { useState, useEffect } from 'react';

export default function Page() {
  const [comboios, setComboios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const fetchComboios = async () => {
    try {
      // Faz o pedido à tua API interna
      const response = await fetch('/api/comboios');
      const data = await response.json();

      if (data.success) {
        setComboios(data.comboios);
        setErro(null);
      } else {
        setErro(data.error || "Erro ao carregar dados");
      }
    } catch (err) {
      setErro("Não foi possível ligar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComboios();
    // Atualiza os dados a cada 60 segundos
    const interval = setInterval(fetchComboios, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>🚆 Pragal - Próximos Comboios</h1>
          <div style={styles.status}>
            {loading ? "A atualizar..." : `Última atualização: ${new Date().toLocaleTimeString()}`}
          </div>
        </header>

        <section style={styles.content}>
          {erro && (
            <div style={styles.errorBanner}>
              ⚠️ {erro}
            </div>
          )}

          {comboios.length === 0 && !loading && !erro ? (
            <div style={styles.noData}>
              Não existem comboios Fertagus previstos para as próximas horas.
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.theadRow}>
                  <th style={styles.th}>Hora</th>
                  <th style={styles.th}>Destino</th>
                  <th style={styles.th}>Atraso</th>
                  <th style={styles.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {comboios.map((c, index) => (
                  <tr key={index} style={styles.tr}>
                    <td style={styles.tdTime}>{c.hora}</td>
                    <td style={styles.tdDest}>{c.destino}</td>
                    <td style={{...styles.td, color: c.atraso.includes('min') ? '#ff5252' : '#4caf50'}}>
                      {c.atraso}
                    </td>
                    <td style={styles.tdStatus}>{c.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </main>
  );
}

// Estilos rápidos para não precisares de CSS externo
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#121212',
    color: '#ffffff',
    fontFamily: 'Segoe UI, Roboto, sans-serif',
    padding: '40px 20px',
  },
  card: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: '#1e1e1e',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#ffeb3b',
    padding: '20px',
    color: '#000',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
  },
  status: {
    fontSize: '0.8rem',
    opacity: 0.7,
  },
  content: {
    padding: '20px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  theadRow: {
    borderBottom: '2px solid #333',
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    color: '#888',
    textTransform: 'uppercase',
    fontSize: '0.75rem',
    letterSpacing: '1px',
  },
  tr: {
    borderBottom: '1px solid #2a2a2a',
  },
  tdTime: {
    padding: '15px 12px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#ffeb3b',
  },
  tdDest: {
    padding: '15px 12px',
    fontSize: '1.1rem',
  },
  td: {
    padding: '15px 12px',
  },
  tdStatus: {
    padding: '15px 12px',
    fontSize: '0.9rem',
    color: '#aaa',
  },
  errorBanner: {
    backgroundColor: '#3d0000',
    color: '#ff8a8a',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  noData: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  }
};