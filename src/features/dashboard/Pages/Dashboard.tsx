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
import {
  LayoutDashboard, FileText, CheckCircle2, XCircle, FileWarning, Wallet, Receipt,
  UserPlus, Send, PenLine, RefreshCw, ArrowRight,
} from "lucide-react";
import { useDashboard } from "../hooks/useDashboard";
import { useWindowSize } from "../../../hooks/useWindowSize";
import { useAutoRefresh } from "../../../hooks/useAutoRefresh";
import PageHeader from "../../../components/ui/PageHeader";
import PolicyMultiSelect from "../../../components/ui/PolicyMultiSelect";
import { C, FONT_DISPLAY, ui } from "../../../shared/styles/ui";
import { useTheme, type Theme } from "../../../shared/theme/theme";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler,
);

ChartJS.defaults.font.family = "'Segoe UI', system-ui, sans-serif";

const REFRESH_INTERVAL = 60;

/* Chart.js dibuja en canvas y no entiende var(--...): paleta propia por tema */
const CHART: Record<Theme, {
  tick: string; grid: string; legend: string; surface: string;
  issued: string; issuedHover: string; cancelled: string; signed: string; pending: string;
  createdFill: string; signedFill: string;
}> = {
  light: {
    tick: "#64748B", grid: "#EEF2F7", legend: "#334155", surface: "#FFFFFF",
    issued: "#0087F6", issuedHover: "#005FF9", cancelled: "#F43F5E", signed: "#10B981", pending: "#E2E8F0",
    createdFill: "rgba(0,135,246,0.10)", signedFill: "rgba(16,185,129,0.10)",
  },
  dark: {
    tick: "#94A3B8", grid: "#1C2740", legend: "#CBD5E1", surface: "#111A2E",
    issued: "#2E9BFF", issuedHover: "#66B5FF", cancelled: "#FB7185", signed: "#34D399", pending: "#26334F",
    createdFill: "rgba(46,155,255,0.16)", signedFill: "rgba(52,211,153,0.16)",
  },
};

/* ── Helpers ─────────────────────────────────────── */
function fmtTime(d: Date) {
  return d.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtNumber(val: number) {
  return Number(val ?? 0).toLocaleString("es-CO");
}

function fmtCurrency(val: number) {
  return `$ ${Number(val ?? 0).toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function Spinner({ size = 14 }: { size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        display: "inline-block",
        border: `2px solid ${C.primaryTint2}`,
        borderTopColor: C.primary,
        animation: "spin 0.8s linear infinite",
      }}
    />
  );
}


/* ── Dashboard ───────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const { isMobile } = useWindowSize();
  const {
    data,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    period,
    setPeriod,
    policyIds,
    setPolicyIds,
    loading,
    fetchData,
    policies,
    policiesByCompany,
  } = useDashboard();

  const { lastUpdated, isRefreshing, manualRefresh } = useAutoRefresh(fetchData, REFRESH_INTERVAL);
  const { theme } = useTheme();
  const P = CHART[theme];
  const SERIES = { issued: P.issued, cancelled: P.cancelled, created: P.issued, signed: P.signed, pending: P.pending };

  /* Opciones base de las gráficas (según el tema) */
  const axisStyle = {
    ticks: { color: P.tick },
    grid: { color: P.grid },
    border: { display: false },
  };
  const legendStyle = {
    position: "bottom" as const,
    labels: { color: P.legend, usePointStyle: true, pointStyle: "circle" as const, boxWidth: 8, padding: 16 },
  };

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    manualRefresh();
  };

  /* Sólo el primer render muestra la carga completa */
  if (loading && !lastUpdated) {
    return (
      <div className="app-page" style={{ ...ui.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center", color: C.muted }}>
          <Spinner size={22} />
          <p style={{ marginTop: 12, fontSize: 14 }}>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  /* ── Datos de las gráficas ────────────────────────── */
  const periodLabels = data?.period?.map((p) => p.period);
  /* Tendencia de firmas: fechas de terceros creados Y de firmas, para que la
     tendencia se vea aunque en el periodo no se haya creado ningún tercero */
  const createdByDate = new Map((data?.entities_period_created ?? []).map((e) => [e.date, e.total]));
  const signedByDate = new Map((data?.entities_period_signed ?? []).map((e) => [e.date, e.total]));
  const entLabels = [...new Set([...createdByDate.keys(), ...signedByDate.keys()])].sort();
  const entCreated = entLabels.map((d) => createdByDate.get(d) ?? 0);
  const entSigned = entLabels.map((d) => signedByDate.get(d) ?? 0);

  const periodData = {
    labels: periodLabels,
    datasets: [
      { label: "Emitidos", data: data?.period?.map((p) => p.issued), backgroundColor: SERIES.issued, borderRadius: 6, maxBarThickness: 28 },
      { label: "Cancelados", data: data?.period?.map((p) => p.cancelled), backgroundColor: SERIES.cancelled, borderRadius: 6, maxBarThickness: 28 },
    ],
  };
  const periodOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legendStyle },
    scales: { x: axisStyle, y: { ...axisStyle, beginAtZero: true } },
  };

  const distributionData = {
    labels: ["Emitidos", "Cancelados"],
    datasets: [
      {
        data: [data.general.issued, data.general.cancelled],
        backgroundColor: [SERIES.issued, SERIES.cancelled],
        borderColor: P.surface,
        borderWidth: 3,
      },
    ],
  };
  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legendStyle },
  };

  /* Horizontal: los nombres de cliente son largos */
  const byPolicyData = {
    labels: policiesByCompany.map((item) =>
      item.beneficiary_name
        ? [item.beneficiary_name, item.external_code ?? ""]
        : (item.external_code ?? `Póliza ${item.policy_id}`),
    ),
    datasets: [
      {
        label: "Certificados emitidos",
        data: policiesByCompany.map((item) => item.issued),
        backgroundColor: P.issued,
        hoverBackgroundColor: P.issuedHover,
        borderRadius: 6,
        maxBarThickness: 22,
      },
    ],
  };
  const byPolicyOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ...axisStyle, beginAtZero: true },
      y: { ...axisStyle, grid: { display: false }, ticks: { color: P.legend, font: { size: 12 } } },
    },
  };
  const byPolicyHeight = Math.max(240, policiesByCompany.length * 46);

  const signaturesByClient = data.signatures_by_client ?? [];
  const signaturesByClientData = {
    labels: signaturesByClient.map((c) =>
      c.policies.length ? [c.name, c.policies.join(" · ")] : c.name,
    ),
    datasets: [
      {
        label: "Terceros que firmaron",
        data: signaturesByClient.map((c) => c.signed),
        backgroundColor: SERIES.signed,
        borderRadius: 6,
        maxBarThickness: 22,
      },
    ],
  };
  const signaturesByClientHeight = Math.max(200, signaturesByClient.length * 46);
  const hasSignatures = signaturesByClient.some((c) => c.signed > 0);

  const signaturesData = {
    labels: entLabels,
    datasets: [
      {
        label: "Terceros creados",
        data: entCreated,
        borderColor: SERIES.created,
        backgroundColor: P.createdFill,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
      {
        label: "Firmas (por fecha de firma)",
        data: entSigned,
        borderColor: SERIES.signed,
        backgroundColor: P.signedFill,
        tension: 0.4,
        fill: true,
        pointRadius: 2,
      },
    ],
  };
  const lineOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: legendStyle },
    scales: { x: axisStyle, y: { ...axisStyle, beginAtZero: true } },
  };

  const signatureStatusData = {
    labels: ["Firmadas", "Pendientes"],
    datasets: [
      {
        data: [
          data.entities_general.total_signed,
          Math.max(0, data.entities_general.total_created - data.entities_general.total_signed),
        ],
        backgroundColor: [SERIES.signed, SERIES.pending],
        borderColor: P.surface,
        borderWidth: 3,
      },
    ],
  };
  const doughnutOptions: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "68%",
    plugins: { legend: legendStyle },
  };

  /* ── Layout helpers ──────────────────────────────── */
  const span = (cols: number): React.CSSProperties => ({ gridColumn: isMobile ? "span 1" : `span ${cols}` });
  const grid: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(12, minmax(0, 1fr))",
    gap: 16,
  };
  const chartHeight = isMobile ? 260 : 320;

  const totalCertificates = data.general.issued + data.general.cancelled;

  return (
    <div className="app-page" style={ui.page}>
      <div style={{ maxWidth: 1600, margin: "0 auto" }}>
        <PageHeader
          icon={<LayoutDashboard size={20} />}
          title="Dashboard"
          subtitle="Certificados, facturación y terceros del periodo seleccionado"
          actions={
            <div style={st.live}>
              <span style={st.liveDot} className="pulse-dot" />
              <span style={st.liveLabel}>EN VIVO</span>
              {lastUpdated && <span style={st.liveTime}>{fmtTime(lastUpdated)}</span>}
              <button
                type="button"
                onClick={manualRefresh}
                disabled={isRefreshing}
                style={st.refreshBtn}
                title="Actualizar ahora"
                aria-label="Actualizar ahora"
              >
                {isRefreshing ? <Spinner /> : <RefreshCw size={15} />}
              </button>
            </div>
          }
        />

        {/* ── Filtros ─────────────────────────────── */}
        <form onSubmit={handleFilter} style={{ ...ui.card, ...st.toolbar }}>
          <label style={st.field}>
            <span style={ui.label}>Fecha inicio</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={ui.input} />
          </label>
          <label style={st.field}>
            <span style={ui.label}>Fecha fin</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={ui.input} />
          </label>
          <label style={st.field}>
            <span style={ui.label}>Periodo</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} style={ui.input}>
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>
          <div style={{ ...st.field, flex: 2, minWidth: 240 }}>
            <span style={ui.label}>Pólizas / clientes</span>
            <PolicyMultiSelect options={policies} value={policyIds} onChange={setPolicyIds} />
          </div>
          <button type="submit" style={{ ...ui.btnPrimary, alignSelf: "flex-end", minWidth: isMobile ? "100%" : 150 }} disabled={isRefreshing}>
            Aplicar filtros
          </button>
        </form>

        <div style={{ position: "relative" }}>
          {isRefreshing && lastUpdated && <div style={st.refreshOverlay} />}

          {/* ── Certificados ──────────────────────── */}
          <SectionTitle title="Certificados" />
          <div style={grid} className="grid-responsive">
            <Kpi style={span(3)} label="Total certificados" value={fmtNumber(totalCertificates)} icon={<FileText size={18} />} color={C.cyan} tint={C.cyanTint} />
            <Kpi style={span(3)} label="Emitidos" value={fmtNumber(data.general.issued)} icon={<CheckCircle2 size={18} />} color={C.primaryStrong} tint={C.primaryTint} />
            <Kpi style={span(3)} label="Cancelados" value={fmtNumber(data.general.cancelled)} icon={<XCircle size={18} />} color={C.danger} tint={C.dangerTint} />
            <Kpi
              style={span(3)}
              label="Sin factura"
              value={fmtNumber(data.general.no_invoice)}
              icon={<FileWarning size={18} />}
              color={C.warning}
              tint={C.warningTint}
              action="Ver certificados"
              onClick={() => navigate("/certificates?invoice=false")}
            />

            <ChartCard style={span(8)} title="Certificados por periodo" height={chartHeight}>
              <Bar data={periodData} options={periodOptions} />
            </ChartCard>
            <ChartCard style={span(4)} title="Distribución" height={chartHeight}>
              <Pie data={distributionData} options={pieOptions} />
            </ChartCard>

            <ChartCard
              style={span(12)}
              title="Certificados emitidos por póliza"
              subtitle={
                policyIds.length > 0
                  ? `${policyIds.length} póliza${policyIds.length !== 1 ? "s" : ""} seleccionada${policyIds.length !== 1 ? "s" : ""}`
                  : "Pólizas vigentes con facturación"
              }
              height={byPolicyHeight}
            >
              {policiesByCompany.length > 0 ? (
                <Bar data={byPolicyData} options={byPolicyOptions} />
              ) : (
                <EmptyChart text="No hay pólizas vigentes con facturación" />
              )}
            </ChartCard>
          </div>

          {/* ── Facturación ───────────────────────── */}
          <SectionTitle title="Facturación" />
          <div style={grid} className="grid-responsive">
            <Kpi style={span(6)} size="lg" label="Valor certificados" value={fmtCurrency(data.general.total_billing)} icon={<Wallet size={18} />} color={C.success} tint={C.successTint} />
            <Kpi style={span(6)} size="lg" label="Valor facturas" value={fmtCurrency(data.invoices.total_billing)} icon={<Receipt size={18} />} color={C.primaryStrong} tint={C.primaryTint} />
          </div>

          {/* ── Terceros ──────────────────────────── */}
          <SectionTitle
            title="Terceros"
            hint={
              policyIds.length > 0
                ? "Nuevos y notificados incluyen todos los clientes; las firmas usan los clientes de las pólizas seleccionadas."
                : undefined
            }
          />
          <div style={grid} className="grid-responsive">
            <Kpi style={span(4)} label="Nuevos terceros" value={fmtNumber(data.entities_general.total_created)} icon={<UserPlus size={18} />} color={C.violet} tint={C.violetTint} />
            <Kpi style={span(4)} label="Notificados" value={fmtNumber(data.entities_general.total_sent)} icon={<Send size={18} />} color={C.primaryStrong} tint={C.primaryTint} />
            <Kpi
              style={span(4)}
              label="Firmados"
              value={fmtNumber(data.signatures_total ?? data.entities_general.total_signed)}
              hint={data.signatures_total != null ? "Terceros que firmaron en el periodo, sin importar cuándo se crearon" : undefined}
              icon={<PenLine size={18} />}
              color={C.success}
              tint={C.successTint}
            />

            <ChartCard
              style={span(8)}
              title="Tendencia de firmas"
              subtitle="Firmas por fecha de firma; no depende de la fecha de creación del tercero"
              height={chartHeight}
            >
              {entLabels.length > 0 ? (
                <Line data={signaturesData} options={lineOptions} />
              ) : (
                <EmptyChart text="Sin terceros creados ni firmas en el periodo" />
              )}
            </ChartCard>
            <ChartCard style={span(4)} title="Estado de firma" subtitle="Terceros creados en el periodo" height={chartHeight}>
              {data.entities_general.total_created > 0 ? (
                <Doughnut data={signatureStatusData} options={doughnutOptions} />
              ) : (
                <EmptyChart text="Sin terceros creados en el periodo" />
              )}
            </ChartCard>

            <ChartCard
              style={span(12)}
              title="Firmas por cliente"
              subtitle="Terceros que autorizaron firma para cada cliente en el periodo"
              height={signaturesByClientHeight}
            >
              {hasSignatures ? (
                <Bar data={signaturesByClientData} options={byPolicyOptions} />
              ) : (
                <EmptyChart text="Sin firmas registradas para estos clientes en el periodo" />
              )}
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-componentes ──────────────────────────────── */

function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div style={{ margin: "28px 0 12px" }}>
      <h2 style={{ ...st.sectionTitle, margin: 0 }}>
        <span style={st.sectionBar} />
        {title}
      </h2>
      {hint && <p style={st.sectionHint}>{hint}</p>}
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  tint: string;
  size?: "md" | "lg";
  action?: string;
  hint?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

function Kpi({ label, value, icon, color, tint, size = "md", action, hint, onClick, style }: KpiProps) {
  const content = (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={st.kpiLabel}>{label}</span>
        <span style={{ ...st.kpiIcon, color, background: tint }}>{icon}</span>
      </div>
      <div style={{ ...st.kpiValue, fontSize: size === "lg" ? 30 : 28 }}>{value}</div>
      {hint && <span style={st.kpiHint}>{hint}</span>}
      {action && (
        <span style={{ ...st.kpiAction, color }}>
          {action} <ArrowRight size={13} />
        </span>
      )}
    </>
  );

  const base: React.CSSProperties = {
    ...ui.card,
    ...st.kpi,
    borderTop: `3px solid ${color}`,
    ...style,
  };

  return onClick ? (
    <button type="button" onClick={onClick} style={{ ...base, ...st.kpiButton }}>
      {content}
    </button>
  ) : (
    <div style={base}>{content}</div>
  );
}

function ChartCard({
  title, subtitle, height, style, children,
}: {
  title: string;
  subtitle?: string;
  height: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div style={{ ...ui.card, padding: 20, minWidth: 0, ...style }}>
      <div style={{ marginBottom: 14 }}>
        <p style={st.chartTitle}>{title}</p>
        {subtitle && <p style={st.chartSubtitle}>{subtitle}</p>}
      </div>
      <div style={{ width: "100%", height, position: "relative" }}>{children}</div>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: C.faint, fontSize: 13 }}>
      {text}
    </div>
  );
}

/* ── Estilos ─────────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  live: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "6px 8px 6px 12px",
    borderRadius: 999,
    background: C.surface,
    border: `1px solid ${C.border}`,
  },
  liveDot: { width: 7, height: 7, borderRadius: "50%", background: C.success, display: "block", flexShrink: 0 },
  liveLabel: { fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.success },
  liveTime: { fontSize: 12, color: C.muted, fontVariantNumeric: "tabular-nums" },
  refreshBtn: {
    ...ui.btnIcon,
    width: 30,
    height: 30,
    minHeight: 30,
    borderRadius: 999,
    background: C.primaryTint,
    color: C.primaryStrong,
    border: "none",
  },

  toolbar: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "flex-end",
    padding: 16,
    marginBottom: 8,
  },
  field: { display: "flex", flexDirection: "column", gap: 6, flex: 1, minWidth: 150 },

  refreshOverlay: {
    position: "absolute",
    inset: 0,
    borderRadius: 16,
    background: C.veil,
    backdropFilter: "blur(1px)",
    zIndex: 10,
    pointerEvents: "none",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    margin: "28px 0 12px",
    fontFamily: FONT_DISPLAY,
    fontSize: 15,
    fontWeight: 700,
    color: C.ink,
  },
  sectionBar: { width: 4, height: 18, borderRadius: 4, background: C.gradient, display: "inline-block" },
  sectionHint: { margin: "4px 0 0 14px", fontSize: 12, color: C.muted },

  kpi: {
    padding: "16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 10,
    minWidth: 0,
    textAlign: "left",
    boxSizing: "border-box",
  },
  kpiButton: {
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
    width: "100%",
  },
  kpiLabel: { fontSize: 13, fontWeight: 600, color: C.muted },
  kpiIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  kpiValue: {
    fontFamily: FONT_DISPLAY,
    fontWeight: 800,
    color: C.ink,
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
    fontVariantNumeric: "tabular-nums",
    overflowWrap: "anywhere",
  },
  kpiAction: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700 },
  kpiHint: { fontSize: 12, color: C.muted, lineHeight: 1.4 },

  chartTitle: { margin: 0, fontFamily: FONT_DISPLAY, fontSize: 14, fontWeight: 700, color: C.ink },
  chartSubtitle: { margin: "2px 0 0", fontSize: 12, color: C.muted },
};
