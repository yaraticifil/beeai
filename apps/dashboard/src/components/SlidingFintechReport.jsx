import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

const SlidingFintechReport = ({ onClose, isTeaser = false }) => {
  const chartRefs = {
    risk: useRef(null),
    trend: useRef(null),
    ratio: useRef(null),
    sector: useRef(null),
    scenario: useRef(null),
    export: useRef(null),
    recommendation: useRef(null),
  };

  useEffect(() => {
    initCharts();
  }, []);

  const initCharts = () => {
    if (!Plotly) return;

    const PALETTE = {
      primary_blue: "#1e40af",
      success_green: "#059669",
      warning_orange: "#d97706",
      danger_red: "#dc2626",
      gray: "#cbd5e1"
    };

    const commonLayout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { family: 'Inter, sans-serif', color: '#ffffff' },
      margin: { t: 40, b: 40, l: 40, r: 40 }
    };

    // Risk Score Chart
    Plotly.newPlot(chartRefs.risk.current, [{
      type: 'indicator', mode: 'gauge+number', value: 93,
      gauge: { 
        axis: { range: [0, 100] }, 
        bar: { color: PALETTE.success_green },
        steps: [
          { range: [0, 50], color: PALETTE.danger_red },
          { range: [50, 90], color: PALETTE.warning_orange },
          { range: [90, 100], color: PALETTE.success_green }
        ] 
      }
    }], { ...commonLayout, title: 'Risk Skoru %93' });

    // Ratio Chart
    Plotly.newPlot(chartRefs.ratio.current, [
      { x: ['Likidite', 'Borç/Öz', 'Kâr', 'ROE'], y: [150, 256, 15, 18], type: 'bar', name: 'Şirket', marker: { color: PALETTE.primary_blue } },
      { x: ['Likidite', 'Borç/Öz', 'Kâr', 'ROE'], y: [120, 300, 12, 15], type: 'bar', name: 'Sektör', marker: { color: PALETTE.gray } }
    ], { ...commonLayout, barmode: 'group', title: 'Mali Oranlar' });

    // Export Chart
    Plotly.newPlot(chartRefs.export.current, [
      { labels: ['Almanya', 'ABD', 'Diğer'], values: [35, 28, 37], type: 'pie', hole: .4 }
    ], { ...commonLayout, title: 'İhracat Dağılımı' });

    // Trend Chart
    Plotly.newPlot(chartRefs.trend.current, [
      { x: ['Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Şub'], y: [7, 9, 6, 8, 10, 7], mode: 'lines+markers', line: { color: PALETTE.primary_blue } }
    ], { ...commonLayout, title: 'Çek Keşide Eğilimi' });
  };

  const teaserStyle = isTeaser ? {
    opacity: 0.3,
    filter: 'blur(4px)',
    pointerEvents: 'none'
  } : {};

  return (
    <div style={{...styles.overlay, ...teaserStyle}}>
      {!isTeaser && <button onClick={onClose} style={styles.closeBtn}>×</button>}
      <div style={styles.scrollContainer}>
        <div style={{...styles.reportContent, animationDuration: isTeaser ? '15s' : '40s'}}>
          <h1 style={styles.title}>BEEAI STRATEJİK ANALİZ</h1>
          <p style={styles.subtitle}>Nihai Mali Sağlık Raporu (2026-03-21)</p>

          <section style={styles.section}>
            <h2 style={styles.secTitle}>🏢 Yapısal ve Hukuki Profil</h2>
            <div style={styles.table}>
               <div style={styles.row}><span>Kuruluş</span><span style={styles.val}>10 Yıl / Aktif</span></div>
               <div style={styles.row}><span>Vergi/SSK Borcu</span><span style={styles.val}>0 TL / Temiz</span></div>
               <div style={styles.row}><span>İcra Takibi</span><span style={styles.val}>Yok</span></div>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.secTitle}>📈 Risk Skoru & Mali Oranlar</h2>
            <div ref={chartRefs.risk} style={styles.chart}></div>
            <div ref={chartRefs.ratio} style={styles.chart}></div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.secTitle}>🔍 SWOT Analizi</h2>
            <div style={styles.swotGrid}>
               <div style={{...styles.swotBox, borderColor: '#059669'}}><h3>Güçlü</h3><p>Düşük borç, Yüksek ihracat</p></div>
               <div style={{...styles.swotBox, borderColor: '#dc2626'}}><h3>Zayıf</h3><p>Vade riski, Düşük sermaye</p></div>
            </div>
          </section>

          <section style={styles.section}>
            <h2 style={styles.secTitle}>🌍 İhracat & Trend</h2>
            <div ref={chartRefs.export} style={styles.chart}></div>
            <div ref={chartRefs.trend} style={styles.chart}></div>
          </section>

          <section style={{...styles.section, backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: '#22c55e'}}>
            <h2 style={styles.secTitle}>💡 AI Nihai Karar</h2>
            <p style={{textAlign: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>DURUM: ONAY | LİMİT: 50M TL</p>
            <p style={{textAlign: 'center'}}>Şirket faktoring için ideal profil göstermektedir.</p>
          </section>

          <div style={{height: 100}}></div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0f172a', zIndex: 9999, overflow: 'hidden',
    fontFamily: 'Inter, sans-serif', color: 'white'
  },
  closeBtn: {
    position: 'fixed', top: 20, right: 20, zIndex: 10000,
    background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
    fontSize: 30, cursor: 'pointer', borderRadius: '50%', width: 50, height: 50
  },
  scrollContainer: { height: '100vh', overflow: 'hidden', position: 'relative' },
  reportContent: { 
    padding: '40px 20px', maxWidth: 800, margin: '0 auto',
    animation: 'scrollUp 40s linear infinite'
  },
  title: { fontSize: '2.5rem', textAlign: 'center', marginBottom: 10, color: '#fbbf24' },
  subtitle: { textAlign: 'center', fontStyle: 'italic', color: '#94a3b8', marginBottom: 40 },
  section: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16,
    padding: 24, marginBottom: 30, border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  },
  secTitle: { fontSize: '1.4rem', borderBottom: '1px solid rgba(255,255,255,0.2)', pb: 10, mb: 15 },
  chart: { height: 300, marginBottom: 20 },
  table: { gap: 10, display: 'flex', flexDirection: 'column' },
  row: { flexDirection: 'row', justifyContent: 'space-between', display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', py: 8 },
  val: { fontWeight: 'bold', color: '#fbbf24' },
  swotGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 },
  swotBox: { padding: 15, borderRadius: 10, borderLeftWidth: 4, backgroundColor: 'rgba(255,255,255,0.05)' },
};

// Global style for the scroll animation
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = `
    @keyframes scrollUp {
      0% { transform: translateY(100vh); }
      100% { transform: translateY(-100%); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default SlidingFintechReport;
