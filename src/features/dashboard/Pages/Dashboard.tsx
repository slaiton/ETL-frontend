import { useEffect } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  type ChartOptions,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { useDashboard } from "../hooks/useDashboard";
import { useWindowSize } from "../../../hooks/useWindowSize";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const {
    data, startDate, setStartDate, endDate, setEndDate,
    period, setPeriod, policy_id, setPolicy, loading, fetchData,
  } = useDashboard();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchData(); }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading) return <p style={{ textAlign: "center", padding: "40px", color: "#fff" }}>Cargando...</p>;

  /* ── Chart data ─────────────────────────────────── */
  const labels = data?.period?.map((p) => p.period);
  const issuedArray = data?.period?.map((p) => p.issued);
  const cancelledArray = data?.period?.map((p) => p.cancelled);

  const entitiesCreatedLabels = data?.entities_period_created?.map((e) => e.date) || [];
  const entitiesCreatedData = data?.entities_period_created?.map((e) => e.total) || [];
  const entitiesSignedData = entitiesCreatedLabels.map((date) => {
    const found = data?.entities_period_signed?.find((s) => s.date === date);
    return found ? found.total : 0;
  });

  const pieData = {
    labels: ["Emitidos", "Cancelados"],
    datasets: [{ label: "Certificados", data: [data.general.issued, data.general.cancelled], backgroundColor: ["#36A2EB", "#FF6384"] }],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { font: { size: 14 } } }, tooltip: { enabled: true } },
  };

  const doughnutOptions: ChartOptions<"doughnut"> = pieOptions as ChartOptions<"doughnut">;

  const barData = {
    labels,
    datasets: [
      { label: "Emitidos", data: issuedArray, backgroundColor: "#36A2EB" },
      { label: "Cancelados", data: cancelledArray, backgroundColor: "#FF6384" },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { grid: { color: "rgba(255,255,255,0.2)" } },
      y: { grid: { color: "rgba(255,255,255,0.2)" } },
    },
  };

  const entitiesLineData = {
    labels: entitiesCreatedLabels,
    datasets: [
      { label: "Teceros Creados", data: entitiesCreatedData, borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.15)", tension: 0.4, fill: true },
      { label: "Terceros Firmados", data: entitiesSignedData, borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.15)", tension: 0.4, fill: true },
    ],
  };

  const entitiesPieData = {
    labels: ["Firmadas", "Pendientes"],
    datasets: [{
      data: [data.entities_general.total_signed, data.entities_general.total_created - data.entities_general.total_signed],
      backgroundColor: ["#10B981", "#374151"],
      borderWidth: 0,
    }],
  };

  const modernChartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#fff" } } },
    scales: {
      x: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };

  /* ── Responsive styles (reactivos al tamaño real) ── */
  const styles = getStyles(isMobile);

  const gridLayout: React.CSSProperties = {
    display: "grid",
    width: "100%",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)",
    gap: "20px",
    marginTop: "20px",
    boxSizing: "border-box",
  };

  const gridItem = (cols: number): React.CSSProperties => ({
    gridColumn: isMobile ? "span 1" : `span ${cols}`,
  });

  const chartCard: React.CSSProperties = {
    background: "rgba(15,23,42,0.92)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div style={styles.container}>

      {/* Filtros */}
      <form onSubmit={handleFilter} style={styles.toolbar}>
        <div style={styles.formRow}>

          <label style={styles.label}>
            Fecha inicio
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={styles.dateInput} />
          </label>

          <label style={styles.label}>
            Fecha fin
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={styles.dateInput} />
          </label>

          <label style={styles.label}>
            Periodo
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={styles.select}>
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>

          <label style={styles.label}>
            Cliente
            <select value={policy_id} onChange={(e) => setPolicy(e.target.value)} style={styles.select}>
              <option value="">Todos</option>
              <option value="5">Vigía2</option>
              <option value="2">Vigía</option>
              <option value="3">TDH</option>
              <option value="6">Coltanques</option>
            </select>
          </label>

          <button type="submit" style={styles.button}>Aplicar filtros</button>
        </div>
      </form>

      <div style={styles.dashboardContent}>
        <div style={gridLayout} className="grid-responsive">

          {/* KPI Cards */}
          <div style={{ ...gridItem(2), ...baseCardStyle, ...getCardAccent("#36eb6cff") }}>
            <div style={styles.cardTitle}>Certificados</div>
            <div style={{ ...styles.cardNumber, color: "#36eb6cff" }}>{data.general.issued + data.general.cancelled}</div>
          </div>

          <div style={{ ...gridItem(2), ...baseCardStyle, ...getCardAccent("#36A2EB") }}>
            <div style={styles.cardTitle}>Emitidos</div>
            <div style={{ ...styles.cardNumber, color: "#36A2EB" }}>{data.general.issued}</div>
          </div>

          <div style={{ ...gridItem(2), ...baseCardStyle, ...getCardAccent("#FF6384") }}>
            <div style={styles.cardTitle}>Cancelados</div>
            <div style={{ ...styles.cardNumber, color: "#FF6384" }}>{data.general.cancelled}</div>
          </div>

          <div style={{ ...gridItem(2), ...baseCardStyle, ...getCardAccent("#cab70dff"), cursor: "pointer" }}
            onClick={() => navigate("/certificates?invoice=false")}>
            <div style={styles.cardTitle}>Sin Factura</div>
            <div style={{ ...styles.cardNumber, color: "#cab70dff" }}>{data.general.no_invoice}</div>
          </div>

          <div style={{ ...gridItem(3), ...baseCardStyle, ...getCardAccent("#4ada12ff") }}>
            <div style={styles.cardTitle}>Total Certificados</div>
            <div style={{ ...styles.cardNumber, color: "#4ada12ff" }}>
              {Number(data?.general?.total_billing ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ ...gridItem(3), ...baseCardStyle, ...getCardAccent("#1d4ed8") }}>
            <div style={styles.cardTitle}>Nuevos Terceros</div>
            <div style={{ ...styles.cardNumber, color: "#1d4ed8" }}>{data.entities_general.total_created}</div>
          </div>

          <div style={{ ...gridItem(3), ...baseCardStyle, ...getCardAccent("#10B981") }}>
            <div style={styles.cardTitle}>Terceros Firmados</div>
            <div style={{ ...styles.cardNumber, color: "#10B981" }}>{data.entities_general.total_signed}</div>
          </div>

          <div style={{ ...gridItem(3), ...baseCardStyle, ...getCardAccent("#7c3aed") }}>
            <div style={styles.cardTitle}>Terceros Notificados</div>
            <div style={{ ...styles.cardNumber, color: "#7c3aed" }}>{data.entities_general.total_sent}</div>
          </div>

          <div style={{ ...gridItem(3), ...baseCardStyle, ...getCardAccent("#1247daff") }}>
            <div style={styles.cardTitle}>Total Facturas</div>
            <div style={{ ...styles.cardNumber, color: "#1247daff" }}>
              {Number(data?.invoices?.total_billing ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </div>
          </div>

          {/* Charts */}
          <div style={{ ...gridItem(4), ...chartCard }}>
            <div style={styles.chartWrapper}><Pie data={pieData} options={pieOptions} /></div>
          </div>

          <div style={{ ...gridItem(8), ...chartCard }}>
            <div style={styles.chartWrapper}><Bar data={barData} options={barOptions} /></div>
          </div>

          <div style={{ ...gridItem(8), ...chartCard }}>
            <h3 style={styles.chartTitle}>Tendencia de Firmas</h3>
            <div style={styles.chartWrapper}><Line data={entitiesLineData} options={modernChartOptions} /></div>
          </div>

          <div style={{ ...gridItem(4), ...chartCard }}>
            <h3 style={styles.chartTitle}>Estado de Firma</h3>
            <div style={styles.chartWrapper}><Doughnut data={entitiesPieData} options={doughnutOptions} /></div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ── Static styles ────────────────────────────────── */
const baseCardStyle: React.CSSProperties = {
  background: "rgba(30,41,59,0.92)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "20px",
  padding: "22px",
  color: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
  transition: "all .25s ease",
  position: "relative",
  overflow: "hidden",
};

const getCardAccent = (color: string): React.CSSProperties => ({
  borderLeft: `4px solid ${color}`,
});

/* ── Responsive styles factory ────────────────────── */
function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    container: {
      textAlign: "center",
      maxWidth: "100%",
      margin: "0 auto",
      minHeight: "100dvh",
      overflowY: "auto",
      boxSizing: "border-box",
      padding: "24px",
      background: "linear-gradient(180deg,#0f172a 0%, #111827 100%)",
    },
    dashboardContent: {
      width: "100%",
      maxWidth: "1600px",
      margin: "0 auto",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxSizing: "border-box",
    },
    toolbar: {
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      gap: "20px",
      background: "#1f2937",
      padding: "12px 20px",
      borderRadius: "10px",
      marginBottom: "20px",
      color: "white",
    },
    formRow: {
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: "16px",
      alignItems: isMobile ? "stretch" : "flex-end",
      justifyContent: "flex-start",
      width: "100%",
    },
    label: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "8px",
      color: "#E5E7EB",
      fontSize: "14px",
      fontWeight: 500,
      width: isMobile ? "100%" : "auto",
    },
    dateInput: {
      width: "100%",
      minWidth: isMobile ? "100%" : "180px",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(15,23,42,0.95)",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      appearance: "none",
      WebkitAppearance: "none",
      backdropFilter: "blur(8px)",
      transition: "all .2s ease",
      colorScheme: "dark",
      minHeight: "46px",
      cursor: "pointer",
    },
    select: {
      width: "100%",
      minWidth: isMobile ? "100%" : "180px",
      padding: "12px 14px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(15,23,42,0.95)",
      color: "#ffffff",
      fontSize: "14px",
      outline: "none",
      boxSizing: "border-box",
      appearance: "none",
      WebkitAppearance: "none",
      backdropFilter: "blur(8px)",
      transition: "all .2s ease",
      colorScheme: "dark",
      minHeight: "46px",
      cursor: "pointer",
      paddingRight: "40px",
    },
    button: {
      background: "#2563EB",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      padding: "12px 18px",
      cursor: "pointer",
      fontWeight: 600,
      minHeight: "46px",
      minWidth: isMobile ? "100%" : "160px",
      appearance: "none",
      WebkitAppearance: "none",
      transition: "all .2s ease",
      boxShadow: "0 6px 18px rgba(37,99,235,.25)",
    },
    cardTitle: {
      fontSize: "1rem",
      fontWeight: 600,
      textAlign: "center",
      opacity: 0.8,
      marginBottom: "8px",
    },
    cardNumber: {
      fontSize: "2.6rem",
      fontWeight: 800,
      textAlign: "center",
      lineHeight: "1",
      marginTop: "4px",
    },
    chartWrapper: {
      width: "100%",
      height: isMobile ? "280px" : "420px",
      padding: isMobile ? "0px" : "10px",
      boxSizing: "border-box",
    },
    chartTitle: {
      color: "#fff",
      textAlign: "left",
      marginBottom: "20px",
      fontSize: "1.1rem",
      fontWeight: 700,
    },
  };
}
