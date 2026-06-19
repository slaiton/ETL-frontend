import { useEffect, useState } from "react";
import type { Certificate } from "../../../models/certificates.model";
import { reportInvoice } from "../../../api/invoices";
import { useCertificates } from "../hooks/useCertificates";
import type { CertificateFilters } from "../../../api/certificates";

const PER_PAGE = 20;
const formatDate = (d: Date) => d.toISOString().split("T")[0];

/* ── Excel ────────────────────────────────────────────── */
function exportToExcel(data: Certificate[]) {
  const headers = ["ID", "Certificado", "Factura", "Waybill", "Placa", "Póliza", "Inicio", "Fin", "Cliente", "URL Factura", "Valor"];
  const rows = data.map((r) => [
    r.id, r.consecutive, r.factus_bill_consecutive ?? "", r.waybill ?? "",
    r.plaque ?? "", r.policy_id ?? "", r.start_at ? r.start_at.split("T")[0] : "",
    r.end_at ? r.end_at.split("T")[0] : "", r.customer_id ?? "",
    r.bill_url ?? "", r.billing_price ?? "",
  ]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(esc).join(",")).join("\r\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificados_${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Types ───────────────────────────────────────────── */
interface FilterDraft {
  id: string;
  certificate: string;
  waybill: string;
  factus_bill_consecutive: string;
  policy_id: string;
  plaque: string;
  start_date: string;
  end_date: string;
  is_invoiced: string;
}

const EMPTY: FilterDraft = {
  id: "", certificate: "", waybill: "", factus_bill_consecutive: "",
  policy_id: "", plaque: "", start_date: "", end_date: "", is_invoiced: "",
};

function draftToFilters(draft: FilterDraft, page: number): CertificateFilters {
  const f: CertificateFilters = { page, per_page: PER_PAGE };
  if (draft.id)                       f.id = Number(draft.id);
  if (draft.certificate)              f.certificate = draft.certificate;
  if (draft.waybill)                  f.waybill = draft.waybill;
  if (draft.factus_bill_consecutive)  f.factus_bill_consecutive = draft.factus_bill_consecutive;
  if (draft.policy_id)                f.policy_id = Number(draft.policy_id);
  if (draft.plaque)                   f.plaque = draft.plaque;
  if (draft.start_date)               f.start_date = draft.start_date;
  if (draft.end_date)                 f.end_date = draft.end_date;
  if (draft.is_invoiced !== "")       f.is_invoiced = draft.is_invoiced === "true";
  return f;
}

/* ── Component ───────────────────────────────────────── */
export default function Certificates() {
  const [draft, setDraft] = useState<FilterDraft>(EMPTY);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY);
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data, total, totalPages, loading, fetchData } = useCertificates();

  const hasFilters = Object.values(applied).some((v) => v !== "");

  /* Carga inicial — últimos 20 */
  useEffect(() => {
    fetchData({ page: 1, per_page: PER_PAGE });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySearch = () => {
    setApplied(draft);
    setPage(1);
    fetchData(draftToFilters(draft, 1));
  };

  const clearAll = () => {
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
    fetchData({ page: 1, per_page: PER_PAGE });
  };

  const changePage = (next: number) => {
    setPage(next);
    fetchData(draftToFilters(applied, next));
  };

  const set = (field: keyof FilterDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((p) => ({ ...p, [field]: e.target.value }));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applySearch();
  };

  return (
    <div style={st.container}>

      {/* ── Panel de filtros ───────────────────────────── */}
      <div style={st.panel}>

        {/* Sección Búsqueda */}
        <div style={st.section}>
          <span style={st.sectionLabel}>Búsqueda</span>
          <div style={st.row}>
            <Field label="ID">
              <input
                type="number" placeholder="Ej: 12345"
                value={draft.id} onChange={set("id")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Certificado">
              <input
                type="text" placeholder="Consecutivo..."
                value={draft.certificate} onChange={set("certificate")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Waybill">
              <input
                type="text" placeholder="Nro. guía..."
                value={draft.waybill} onChange={set("waybill")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Placa">
              <input
                type="text" placeholder="Ej: ABC123..."
                value={draft.plaque} onChange={set("plaque")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Póliza">
              <input
                type="number" placeholder="ID póliza..."
                value={draft.policy_id} onChange={set("policy_id")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Factura Factus">
              <input
                type="text" placeholder="Consecutivo factura..."
                value={draft.factus_bill_consecutive} onChange={set("factus_bill_consecutive")} onKeyDown={onKey}
                style={st.input}
              />
            </Field>
          </div>
        </div>

        <div style={st.divider} />

        {/* Sección Filtros */}
        <div style={st.section}>
          <span style={st.sectionLabel}>Filtros</span>
          <div style={st.row}>
            <Field label="Desde">
              <input
                type="date" value={draft.start_date} onChange={set("start_date")}
                style={{ ...st.input, colorScheme: "dark" as React.CSSProperties["colorScheme"] }}
              />
            </Field>
            <Field label="Hasta">
              <input
                type="date" value={draft.end_date} onChange={set("end_date")}
                style={{ ...st.input, colorScheme: "dark" as React.CSSProperties["colorScheme"] }}
              />
            </Field>
            <Field label="Facturación">
              <div style={st.selectWrap}>
                <select value={draft.is_invoiced} onChange={set("is_invoiced")} style={st.select}>
                  <option value="">Todos</option>
                  <option value="true">Facturado</option>
                  <option value="false">Sin factura</option>
                </select>
                <span style={st.chevron}>▾</span>
              </div>
            </Field>
          </div>
        </div>

        {/* Acciones */}
        <div style={st.actions}>
          <button onClick={applySearch} disabled={loading} style={st.btnSearch}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
          {hasFilters && (
            <button onClick={clearAll} style={st.btnClear}>✕ Limpiar</button>
          )}
          <button
            onClick={() => exportToExcel(data)}
            disabled={data.length === 0 || loading}
            style={st.btnExcel}
          >
            ↓ Excel
          </button>
        </div>
      </div>

      {/* ── Badge resultado ────────────────────────────── */}
      {!loading && (
        <p style={st.badge}>
          {hasFilters
            ? `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
            : "Últimos 20 registros"}
        </p>
      )}

      {/* ── Tabla ──────────────────────────────────────── */}
      <div style={st.tableWrap}>
        <table style={st.table}>
          <thead>
            <tr style={st.thead}>
              {["ID","Certificado","Factura","Waybill","Placa","Póliza","Inicio","Fin","Cliente","URL Factura","Valor","Descargar","Enviar factura"]
                .map((h) => <th key={h} style={st.th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={13} style={st.noData}>Cargando...</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={13} style={st.noData}>Sin resultados</td></tr>
            ) : data.map((item) => (
              <tr key={item.id} style={st.tableRow}>
                <td style={st.td}>{item.id}</td>
                <td style={st.td}>{item.consecutive}</td>
                <td style={st.td}>{item.factus_bill_consecutive ?? "—"}</td>
                <td style={st.td}>{item.waybill ?? "—"}</td>
                <td style={st.td}>{item.plaque ?? "—"}</td>
                <td style={st.td}>{item.policy_id ?? "—"}</td>
                <td style={st.td}>{item.start_at ? item.start_at.split("T")[0] : "—"}</td>
                <td style={st.td}>{item.end_at ? item.end_at.split("T")[0] : "—"}</td>
                <td style={st.td}>{item.customer_id ?? "—"}</td>
                <td style={st.td}>
                  {item.bill_url
                    ? <a href={item.bill_url} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA" }}>Ver factura</a>
                    : "—"}
                </td>
                <td style={st.td}>{item.billing_price ?? "—"}</td>
                <td style={st.td}>
                  <button
                    style={st.btnAction}
                    onClick={() => {
                      const url = `${import.meta.env.VITE_API_BASE_URL}/new_certificates/${btoa(String(item.id))}/download_view`;
                      window.open(url, "_blank");
                    }}
                  >
                    Descargar
                  </button>
                </td>
                <td style={st.td}>
                  {!item.bill_url ? (
                    <button
                      style={st.btnAction}
                      disabled={loadingId === item.id}
                      onClick={async () => {
                        try {
                          setLoadingId(item.id);
                          const res = await reportInvoice(item.id);
                          if (!res) { alert("❌ No se pudo reportar la factura"); return; }
                          alert("✅ Factura reportada correctamente");
                          window.location.reload();
                        } catch (err) {
                          console.error(err);
                          alert("❌ Error al reportar la factura");
                        } finally {
                          setLoadingId(null);
                        }
                      }}
                    >
                      {loadingId === item.id ? "Enviando..." : "Enviar"}
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ─────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={st.pagination}>
          <button disabled={page <= 1} onClick={() => changePage(page - 1)} style={st.pageBtn}>← Anterior</button>
          <span style={st.pageInfo}>Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => changePage(page + 1)} style={st.pageBtn}>Siguiente →</button>
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={st.field}>
      <label style={st.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  container: { padding: "20px", fontFamily: "Inter, Arial, sans-serif", color: "#e4e4e7" },

  panel: {
    background: "rgba(24,24,27,0.95)", border: "1px solid #2a2a33",
    borderRadius: "14px", padding: "16px 20px", marginBottom: "16px",
    display: "flex", flexDirection: "column", gap: "14px",
  },
  section: { display: "flex", flexDirection: "column", gap: "8px" },
  sectionLabel: {
    fontSize: 11, fontWeight: 700, color: "#4B5563",
    textTransform: "uppercase", letterSpacing: "0.08em",
  },
  row: { display: "flex", flexWrap: "wrap", gap: "10px" },
  divider: { height: 1, background: "#2a2a33" },

  field: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 140, flex: 1 },
  fieldLabel: { fontSize: 11, color: "#9CA3AF", fontWeight: 500 },
  input: {
    background: "#1e1e24", border: "1px solid #3f3f46", borderRadius: "8px",
    color: "#e4e4e7", padding: "8px 10px", fontSize: 13, outline: "none",
    width: "100%", boxSizing: "border-box",
  },

  selectWrap: {
    position: "relative", display: "flex", alignItems: "center",
    background: "#1e1e24", border: "1px solid #3f3f46", borderRadius: "8px",
  },
  select: {
    appearance: "none", background: "transparent", border: "none",
    color: "#e4e4e7", padding: "8px 28px 8px 10px", fontSize: 13,
    outline: "none", cursor: "pointer", width: "100%",
  },
  chevron: {
    position: "absolute", right: 8, fontSize: 10, color: "#6B7280", pointerEvents: "none",
  },

  actions: { display: "flex", gap: "8px", alignItems: "center", justifyContent: "flex-end" },
  btnSearch: {
    background: "rgba(37,99,235,0.2)", color: "#60A5FA",
    border: "1px solid rgba(37,99,235,0.35)", borderRadius: "8px",
    padding: "8px 20px", cursor: "pointer", fontWeight: 600, fontSize: 13,
  },
  btnClear: {
    background: "transparent", color: "#6B7280",
    border: "1px solid #3f3f46", borderRadius: "8px",
    padding: "8px 14px", cursor: "pointer", fontSize: 13,
  },
  btnExcel: {
    background: "rgba(16,185,129,0.15)", color: "#34D399",
    border: "1px solid rgba(16,185,129,0.35)", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13,
  },

  badge: { color: "#6B7280", fontSize: 13, marginBottom: 10 },

  tableWrap: { overflowX: "auto", borderRadius: "12px", border: "1px solid #2a2a33" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  thead: { background: "rgba(15,23,42,0.9)" },
  th: {
    padding: "12px 14px", textAlign: "center", fontSize: 12, fontWeight: 700,
    color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em",
    borderBottom: "1px solid #2a2a33", whiteSpace: "nowrap",
  },
  tableRow: { backgroundColor: "#1e1e24" },
  td: {
    textAlign: "center", padding: "12px 14px", borderBottom: "1px solid #23232a",
    fontSize: 13, whiteSpace: "nowrap",
  },
  noData: { textAlign: "center", padding: "32px", color: "#6B7280" },
  btnAction: {
    background: "rgba(37,99,235,0.15)", color: "#60A5FA",
    border: "1px solid rgba(37,99,235,0.3)", borderRadius: "8px",
    padding: "6px 12px", cursor: "pointer", fontWeight: 600, fontSize: 12,
  },

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" },
  pageBtn: {
    background: "rgba(30,41,59,0.9)", color: "#9CA3AF",
    border: "1px solid #374151", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontWeight: 500, fontSize: 13,
  },
  pageInfo: { fontWeight: 500, color: "#9CA3AF", fontSize: 13 },
};
