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
import { useAutoRefresh } from "../../../hooks/useAutoRefresh";

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Filler
);

const REFRESH_INTERVAL = 60;

/* ── Spinner inline ──────────────────────────────── */
function Spinner() {
  return (
    <div style={{
      width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
      border: "2px solid rgba(255,255,255,0.1)",
      borderTopColor: "#3B82F6",
      animation: "spin 0.8s linear infinite",
    }} />
  );
}

/* ── Formato hora ─────────────────────────────────── */
function fmtTime(d: Date) {
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/* ── Dashboard ───────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const {
    data, startDate, setStartDate, endDate, setEndDate,
    period, setPeriod, policy_id, setPolicy, loading, fetchData,
  } = useDashboard();

  const { lastUpdated, isRefreshing, manualRefresh } =
    useAutoRefresh(fetchData, REFRESH_INTERVAL);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    manualRefresh();
  };

  /* Sólo primer render muestra el skeleton completo */
  const isFirstLoad = loading && !lastUpdated;
  if (isFirstLoad) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
        <div style={{ textAlign: "center", color: "#9CA3AF" }}>
          <Spinner />
          <p style={{ marginTop: 12, fontSize: 14 }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  /* ── Chart data ─────────────────────────────────── */
  const labels        = data?.period?.map((p) => p.period);
  const issuedArray   = data?.period?.map((p) => p.issued);
  const cancelledArray= data?.period?.map((p) => p.cancelled);
  const entLabels     = data?.entities_period_created?.map((e) => e.date) ?? [];
  const entCreated    = data?.entities_period_created?.map((e) => e.total) ?? [];
  const entSigned     = entLabels.map((d) => data?.entities_period_signed?.find((s) => s.date === d)?.total ?? 0);

  const pieData = {
    labels: ["Emitidos", "Cancelados"],
    datasets: [{ label: "Certificados", data: [data.general.issued, data.general.cancelled], backgroundColor: ["#36A2EB", "#FF6384"] }],
  };
  const pieOptions: ChartOptions<"pie"> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { font: { size: 13 }, color: "#D1D5DB" } }, tooltip: { enabled: true } },
  };
  const doughnutOptions = pieOptions as ChartOptions<"doughnut">;
  const barData = {
    labels,
    datasets: [
      { label: "Emitidos",   data: issuedArray,    backgroundColor: "#3B82F6" },
      { label: "Cancelados", data: cancelledArray,  backgroundColor: "#EF4444" },
    ],
  };
  const barOptions: ChartOptions<"bar"> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#D1D5DB" } } },
    scales: {
      x: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };
  const lineData = {
    labels: entLabels,
    datasets: [
      { label: "Terceros Creados", data: entCreated, borderColor: "#3B82F6", backgroundColor: "rgba(59,130,246,0.12)", tension: 0.4, fill: true },
      { label: "Terceros Firmados", data: entSigned, borderColor: "#10B981", backgroundColor: "rgba(16,185,129,0.12)", tension: 0.4, fill: true },
    ],
  };
  const lineOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#D1D5DB" } } },
    scales: {
      x: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: "#9CA3AF" }, grid: { color: "rgba(255,255,255,0.05)" } },
    },
  };
  const donutData = {
    labels: ["Firmadas", "Pendientes"],
    datasets: [{
      data: [data.entities_general.total_signed, Math.max(0, data.entities_general.total_created - data.entities_general.total_signed)],
      backgroundColor: ["#10B981", "#374151"], borderWidth: 0,
    }],
  };

  /* ── Responsive helpers ─────────────────────────── */
  const st = getStyles(isMobile);
  const grid: React.CSSProperties = {
    display: "grid", width: "100%",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(12, 1fr)",
    gap: "20px", marginTop: "20px", boxSizing: "border-box",
  };
  const gi = (cols: number): React.CSSProperties => ({
    gridColumn: isMobile ? "span 1" : `span ${cols}`,
  });
  const chartCard: React.CSSProperties = {
    background: "rgba(15,23,42,0.92)", borderRadius: "22px", padding: "24px",
    border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  };

  /* ── Render ──────────────────────────────────────── */
  return (
    <div style={st.container}>

      {/* ── Toolbar + status integrado ─────────────── */}
      <form onSubmit={handleFilter} style={st.toolbar}>
        <div style={st.formRow}>
          <label style={st.label}>
            Fecha inicio
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={st.dateInput} />
          </label>
          <label style={st.label}>
            Fecha fin
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={st.dateInput} />
          </label>
          <label style={st.label}>
            Periodo
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={st.select}>
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>
          <label style={st.label}>
            Cliente
            <select value={policy_id} onChange={(e) => setPolicy(e.target.value)} style={st.select}>
              <option value="">Todos</option>
              <option value="5">Vigía2</option>
              <option value="2">Vigía</option>
              <option value="3">TDH</option>
              <option value="6">Coltanques</option>
            </select>
          </label>
          <button type="submit" style={st.button} disabled={isRefreshing}>
            Aplicar filtros
          </button>

          {/* Status embebido — separador + live + hora + refresh */}
          <div style={st.statusInline}>
            <span style={st.statusDivider} />
            <span style={st.liveDot} className="pulse-dot" />
            <span style={st.liveLabel}>EN VIVO</span>
            {lastUpdated && (
              <span style={st.lastUpdatedText}>
                {fmtTime(lastUpdated)}
              </span>
            )}
            <button
              type="button"
              onClick={manualRefresh}
              disabled={isRefreshing}
              style={st.refreshBtn}
              title="Actualizar ahora"
            >
              {isRefreshing ? <Spinner /> : "↻"}
            </button>
          </div>
        </div>
      </form>

      {/* Overlay sutil durante refresh post-primer-carga */}
      <div style={{ position: "relative" }}>
        {isRefreshing && lastUpdated && (
          <div style={st.refreshOverlay} />
        )}

        <div style={st.dashboardContent}>
          <div style={grid} className="grid-responsive">

            {/* ── KPI Cards ────────────────────────── */}
            {[
              { label: "Certificados",       val: data.general.issued + data.general.cancelled, color: "#34D399", onClick: undefined },
              { label: "Emitidos",           val: data.general.issued,                          color: "#60A5FA", onClick: undefined },
              { label: "Cancelados",         val: data.general.cancelled,                       color: "#F87171", onClick: undefined },
              { label: "Sin Factura",        val: data.general.no_invoice,                      color: "#FBBF24", onClick: () => navigate("/certificates?invoice=false") },
              { label: "Nuevos Terceros",     val: data.entities_general.total_created,         color: "#818CF8" },
            ].map(({ label, val, color, onClick }) => (
              <div key={label} style={{ ...gi(2), ...baseCard, borderLeft: `4px solid ${color}`, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
                <div style={st.cardLabel}>{label}</div>
                <div style={{ ...st.cardValue, color }}>{val}</div>
              </div>
            ))}

            {[
              { label: "Total Certificados",  val: fmtCurrency(data.general.total_billing),    color: "#4ADE80" },
              { label: "Terceros Firmados",   val: data.entities_general.total_signed,          color: "#34D399" },
              { label: "Terceros Notificados",val: data.entities_general.total_sent,            color: "#A78BFA" },
              { label: "Total Facturas",      val: fmtCurrency(data.invoices.total_billing),    color: "#38BDF8" },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ ...gi(label === "Total Certificados" || label === "Total Facturas" ? 3 : 3), ...baseCard, borderLeft: `4px solid ${color}` }}>
                <div style={st.cardLabel}>{label}</div>
                <div style={{ ...st.cardValue, color }}>{val}</div>
              </div>
            ))}

            {/* ── Charts ───────────────────────────── */}
            <div style={{ ...gi(4), ...chartCard }}>
              <p style={st.chartTitle}>Distribución Certificados</p>
              <div style={st.chartBox}><Pie data={pieData} options={pieOptions} /></div>
            </div>

            <div style={{ ...gi(8), ...chartCard }}>
              <p style={st.chartTitle}>Certificados por período</p>
              <div style={st.chartBox}><Bar data={barData} options={barOptions} /></div>
            </div>

            <div style={{ ...gi(8), ...chartCard }}>
              <p style={st.chartTitle}>Tendencia de Firmas</p>
              <div style={st.chartBox}><Line data={lineData} options={lineOptions} /></div>
            </div>

            <div style={{ ...gi(4), ...chartCard }}>
              <p style={st.chartTitle}>Estado de Firma</p>
              <div style={st.chartBox}><Doughnut data={donutData} options={doughnutOptions} /></div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}

/* ── Helpers ─────────────────────────────────────── */
function fmtCurrency(val: number) {
  return Number(val ?? 0).toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

const baseCard: React.CSSProperties = {
  background: "rgba(30,41,59,0.92)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "20px", padding: "20px", color: "white",
  boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
  backdropFilter: "blur(10px)", transition: "transform .2s ease",
};

/* ── Responsive styles ───────────────────────────── */
function getStyles(isMobile: boolean): Record<string, React.CSSProperties> {
  return {
    container: {
      maxWidth: "100%", margin: "0 auto", minHeight: "100dvh",
      boxSizing: "border-box", padding: "20px",
      background: "linear-gradient(160deg,#0d1424 0%,#0f172a 50%,#111827 100%)",
    },
    statusInline: {
      display: "flex", alignItems: "center", gap: 8, marginLeft: "auto",
    },
    statusDivider: {
      display: "block", width: 1, height: 20,
      background: "rgba(255,255,255,0.1)", marginRight: 4,
    },
    liveDot: {
      width: 7, height: 7, borderRadius: "50%",
      background: "#34D399", display: "block", flexShrink: 0,
    },
    liveLabel: {
      fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#34D399",
    },
    lastUpdatedText: {
      fontSize: 12, color: "#6B7280", fontVariantNumeric: "tabular-nums",
    },
    refreshBtn: {
      background: "none", border: "none",
      color: "#4B5563", cursor: "pointer",
      fontSize: 16, padding: "2px 6px",
      display: "flex", alignItems: "center",
      borderRadius: 6, transition: "color .2s",
      lineHeight: 1,
    },
    refreshOverlay: {
      position: "absolute", inset: 0, borderRadius: 12,
      background: "rgba(13,20,36,0.45)",
      backdropFilter: "blur(2px)",
      zIndex: 10, pointerEvents: "none",
    },
    toolbar: {
      display: "flex", justifyContent: "flex-end", alignItems: "center",
      background: "rgba(31,41,55,0.7)",
      border: "1px solid rgba(255,255,255,0.06)",
      padding: "12px 20px", borderRadius: 12, marginBottom: 20,
      backdropFilter: "blur(8px)",
    },
    formRow: {
      display: "flex", flexDirection: isMobile ? "column" : "row",
      gap: 12, alignItems: isMobile ? "stretch" : "flex-end",
      justifyContent: "flex-start", width: "100%",
    },
    label: {
      display: "flex", flexDirection: "column", gap: 6,
      color: "#9CA3AF", fontSize: 12, fontWeight: 500,
      width: isMobile ? "100%" : "auto",
    },
    dateInput: {
      minWidth: isMobile ? "100%" : "160px",
      padding: "10px 12px", borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      background: "rgba(15,23,42,0.95)", color: "#fff",
      fontSize: 13, outline: "none", boxSizing: "border-box",
      colorScheme: "dark", minHeight: 42, cursor: "pointer",
    },
    select: {
      minWidth: isMobile ? "100%" : "150px",
      padding: "10px 32px 10px 12px", borderRadius: 10,
      border: "1px solid rgba(255,255,255,0.08)",
      backgroundColor: "rgba(15,23,42,0.95)", color: "#fff",
      fontSize: 13, outline: "none", boxSizing: "border-box",
      minHeight: 42, cursor: "pointer",
    },
    button: {
      background: "#2563EB", color: "#fff", border: "none",
      borderRadius: 10, padding: "10px 20px", cursor: "pointer",
      fontWeight: 600, minHeight: 42, fontSize: 13,
      minWidth: isMobile ? "100%" : 150,
      boxShadow: "0 4px 14px rgba(37,99,235,.3)",
      transition: "all .2s ease",
    },
    dashboardContent: {
      width: "100%", maxWidth: 1600, margin: "0 auto",
    },
    cardLabel: {
      fontSize: 13, fontWeight: 600, opacity: 0.7,
      marginBottom: 8, textAlign: "center",
    },
    cardValue: {
      fontSize: "2.2rem", fontWeight: 800,
      textAlign: "center", lineHeight: 1, marginTop: 4,
    },
    chartBox: {
      width: "100%", height: isMobile ? "260px" : "380px",
      boxSizing: "border-box",
    },
    chartTitle: {
      color: "#9CA3AF", textAlign: "left",
      marginBottom: 16, fontSize: 13, fontWeight: 600,
      textTransform: "uppercase", letterSpacing: 1,
    },
  };
}
