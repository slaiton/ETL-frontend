import type { CSSProperties } from "react";

/**
 * Tokens de color de los módulos. Apuntan a variables CSS (index.css) para
 * que cambien entre tema claro y oscuro sin re-render: `:root[data-theme]`.
 * Colores de marca: blanco + azules del logo Analytics.
 *
 * Ojo: Chart.js dibuja en canvas y no entiende `var(...)`; las gráficas usan
 * su propia paleta por tema (ver Dashboard).
 */
export const C = {
  bg: "var(--c-bg)",
  surface: "var(--c-surface)",
  surfaceAlt: "var(--c-surface-alt)",
  border: "var(--c-border)",
  borderSoft: "var(--c-border-soft)",
  borderStrong: "var(--c-border-strong)",

  ink: "var(--c-ink)",
  text: "var(--c-text)",
  muted: "var(--c-muted)",
  faint: "var(--c-faint)",

  primary: "var(--c-primary)",
  primaryStrong: "var(--c-primary-strong)",
  primaryTint: "var(--c-primary-tint)",
  primaryTint2: "var(--c-primary-tint2)",

  cyan: "var(--c-cyan)",
  cyanTint: "var(--c-cyan-tint)",
  cyanBorder: "var(--c-cyan-border)",
  success: "var(--c-success)",
  successTint: "var(--c-success-tint)",
  successBorder: "var(--c-success-border)",
  danger: "var(--c-danger)",
  dangerTint: "var(--c-danger-tint)",
  dangerBorder: "var(--c-danger-border)",
  warning: "var(--c-warning)",
  warningTint: "var(--c-warning-tint)",
  warningBorder: "var(--c-warning-border)",
  violet: "var(--c-violet)",
  violetTint: "var(--c-violet-tint)",
  violetBorder: "var(--c-violet-border)",

  veil: "var(--c-veil)",

  /* Fijos en ambos temas */
  dangerSolid: "#DC2626",
  gradient: "linear-gradient(135deg, #00D4EE 0%, #0087F6 55%, #005FF9 100%)",
} as const;

export const FONT_BODY = "'Segoe UI', system-ui, -apple-system, Roboto, sans-serif";
export const FONT_DISPLAY = "Montserrat, 'Segoe UI', system-ui, sans-serif";

const btnBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: 10,
  padding: "9px 16px",
  minHeight: 40,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
  whiteSpace: "nowrap",
  transition: "background .15s, box-shadow .15s, transform .15s",
};

export const ui = {
  page: {
    padding: "24px",
    minHeight: "calc(100dvh - 120px)",
    boxSizing: "border-box",
    background: C.bg,
    color: C.text,
    fontFamily: FONT_BODY,
  },

  card: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    boxShadow: "var(--c-shadow)",
  },

  title: {
    fontFamily: FONT_DISPLAY,
    fontSize: 22,
    fontWeight: 800,
    color: C.ink,
    margin: 0,
    letterSpacing: "-0.01em",
  },
  subtitle: { fontSize: 13, color: C.muted, margin: "2px 0 0" },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: C.faint,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },
  label: { fontSize: 12, fontWeight: 600, color: C.muted },

  input: {
    background: C.surfaceAlt,
    border: `1px solid ${C.border}`,
    borderRadius: 10,
    color: C.ink,
    padding: "9px 12px",
    minHeight: 40,
    fontSize: 13,
    fontFamily: "inherit",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color .15s, box-shadow .15s, background .15s",
  },

  btnPrimary: {
    ...btnBase,
    background: C.gradient,
    color: "#fff",
    border: "none",
    fontWeight: 700,
    boxShadow: "0 10px 20px -12px rgba(0,135,246,0.9)",
  },
  btnSecondary: {
    ...btnBase,
    background: C.surface,
    color: C.text,
    border: `1px solid ${C.border}`,
  },
  btnSoft: {
    ...btnBase,
    background: C.primaryTint,
    color: C.primaryStrong,
    border: `1px solid ${C.primaryTint2}`,
  },
  btnSuccess: {
    ...btnBase,
    background: C.successTint,
    color: C.success,
    border: `1px solid ${C.successBorder}`,
  },
  btnDanger: {
    ...btnBase,
    background: C.dangerTint,
    color: C.danger,
    border: `1px solid ${C.dangerBorder}`,
  },
  btnIcon: {
    ...btnBase,
    padding: 0,
    width: 34,
    minHeight: 34,
    height: 34,
    borderRadius: 9,
  },

  tableWrap: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 16,
    overflowX: "auto",
    boxShadow: "var(--c-shadow)",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "12px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    background: C.surfaceAlt,
    borderBottom: `1px solid ${C.border}`,
    whiteSpace: "nowrap",
  },
  td: {
    padding: "12px 14px",
    fontSize: 13,
    color: C.text,
    borderBottom: `1px solid ${C.borderSoft}`,
    whiteSpace: "nowrap",
    verticalAlign: "middle",
  },
  noData: { textAlign: "center", padding: "40px", color: C.muted, fontSize: 14 },

  link: { color: C.primaryStrong, fontWeight: 600, textDecoration: "none" },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 200,
    background: "var(--c-overlay)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    background: C.surface,
    border: `1px solid ${C.border}`,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    boxShadow: "var(--c-shadow-lg)",
    color: C.text,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: C.primaryTint,
    color: C.primaryStrong,
    border: `1px solid ${C.primaryTint2}`,
  },
} satisfies Record<string, CSSProperties>;

/** Pastilla de estado */
export function pill(tone: "primary" | "success" | "danger" | "warning" | "neutral" | "violet"): CSSProperties {
  const map = {
    primary: [C.primaryTint, C.primaryStrong, C.primaryTint2],
    success: [C.successTint, C.success, C.successBorder],
    danger: [C.dangerTint, C.danger, C.dangerBorder],
    warning: [C.warningTint, C.warning, C.warningBorder],
    violet: [C.violetTint, C.violet, C.violetBorder],
    neutral: [C.surfaceAlt, C.muted, C.border],
  } as const;
  const [bg, color, border] = map[tone];
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    background: bg,
    color,
    border: `1px solid ${border}`,
    borderRadius: 999,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: "nowrap",
  };
}
