import { useEffect, useRef, useState } from "react";
import type { Certificate } from "../../../models/certificates.model";
import { useSearchParams } from "react-router-dom";
import { reportInvoice } from "../../../api/invoices";
import { useCertificates } from "../hooks/useCertificates";

const formatDate = (d: Date) => d.toISOString().split("T")[0];

/* ── Excel (CSV UTF-8 with BOM — opens natively in Excel) ── */
function exportToExcel(data: Certificate[]) {
  const headers = [
    "ID", "Certificado", "Factura", "Waybill", "Póliza",
    "Inicio", "Fin", "Cliente", "URL Factura", "Valor",
  ];
  const rows = data.map((r) => [
    r.id,
    r.consecutive,
    r.factus_bill_consecutive ?? "",
    r.waybill ?? "",
    r.policy_id ?? "",
    r.start_at ? r.start_at.split("T")[0] : "",
    r.end_at ? r.end_at.split("T")[0] : "",
    r.customer_id ?? "",
    r.bill_url ?? "",
    r.billing_price ?? "",
  ]);

  const escape = (v: unknown) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return `"${s}"`;
  };
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");
  const bom = "﻿";
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `certificados_${formatDate(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Component ──────────────────────────────────────────── */
export default function Certificates() {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

  const [startDate, setStartDate] = useState(
    searchParams.get("startDate") || formatDate(firstDay)
  );
  const [endDate, setEndDate] = useState(
    searchParams.get("endDate") || formatDate(today)
  );
  const invoice = searchParams.get("invoice") || "true";
  const limit = Number(searchParams.get("limit")) || 20;

  const [searchField, setSearchField] = useState("consecutive");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchDraft, setSearchDraft] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data, loading, fetchData } = useCertificates();

  /* pending search (Enter / button) antes de llamar a API */
  const triggerSearch = (newSearch: string, newPage = 1) => {
    setSearch(newSearch);
    setPage(newPage);
    setSearchParams({
      page: String(newPage),
      search: newSearch,
      limit: String(limit),
      startDate,
      endDate,
      invoice,
    });
  };

  /* Fetch cuando cambian fecha/factura/búsqueda/paginación */
  const prevRef = useRef({ startDate: "", endDate: "", invoice: "", search: "", page: 0 });
  useEffect(() => {
    const prev = prevRef.current;
    const changed =
      prev.startDate !== startDate || prev.endDate !== endDate ||
      prev.invoice !== invoice || prev.search !== search || prev.page !== page;
    if (!changed) return;
    prevRef.current = { startDate, endDate, invoice, search, page };
    fetchData(startDate, endDate, invoice, search || undefined, search ? searchField : undefined, page, limit);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, invoice, search, page]);

  /* Paginación del lado del cliente sobre los datos retornados */
  const totalPages = Math.ceil(data.length / limit);
  const paginated = data.length <= limit ? data : data.slice((page - 1) * limit, page * limit);

  const changePage = (newPage: number) => {
    setPage(newPage);
    setSearchParams({ page: String(newPage), search, limit: String(limit), startDate, endDate, invoice });
  };

  return (
    <div style={st.container}>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div style={st.toolbar}>

        {/* Búsqueda */}
        <div style={st.searchGroup}>
          {/* Select tipo campo — pill con indicador de color */}
          <div style={st.selectWrapper}>
            <span style={{
              ...st.selectDot,
              background: searchField === "id" ? "#818CF8"
                : searchField === "consecutive" ? "#34D399"
                : "#F59E0B",
            }} />
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              style={st.select}
            >
              <option value="id">Código</option>
              <option value="consecutive">Certificado</option>
              <option value="factus_bill_consecutive">Factura</option>
            </select>
            <span style={st.selectChevron}>▾</span>
          </div>

          <span style={st.searchDivider} />

          <input
            type="text"
            placeholder="Buscar..."
            value={searchDraft}
            onChange={(e) => setSearchDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && triggerSearch(searchDraft)}
            style={st.input}
          />
          <button onClick={() => triggerSearch(searchDraft)} style={st.btnSearch}>
            Buscar
          </button>
          {search && (
            <button onClick={() => { setSearchDraft(""); triggerSearch(""); }} style={st.btnClear}>
              ✕
            </button>
          )}
        </div>

        {/* Fechas */}
        <div style={st.dateGroup}>
          <input
            type="date" value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
            style={st.dateInput}
          />
          <span style={st.sep}>→</span>
          <input
            type="date" value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
            style={st.dateInput}
          />
        </div>

        {/* Excel export */}
        <button
          onClick={() => exportToExcel(data)}
          disabled={data.length === 0 || loading}
          style={st.btnExcel}
        >
          ↓ Exportar Excel
        </button>

      </div>

      {/* ── Resultado badge ────────────────────────────────── */}
      {!loading && data.length > 0 && (
        <p style={st.resultBadge}>
          {data.length} registro{data.length !== 1 ? "s" : ""} encontrado{data.length !== 1 ? "s" : ""}
          {search ? ` — búsqueda: "${search}"` : ""}
        </p>
      )}

      {/* ── Tabla ──────────────────────────────────────────── */}
      <div style={st.tableWrapper}>
        <table style={st.table}>
          <thead>
            <tr style={st.thead}>
              <th style={st.th}>ID</th>
              <th style={st.th}>Certificado</th>
              <th style={st.th}>Factura</th>
              <th style={st.th}>Waybill</th>
              <th style={st.th}>Póliza</th>
              <th style={st.th}>Inicio</th>
              <th style={st.th}>Fin</th>
              <th style={st.th}>Cliente</th>
              <th style={st.th}>URL Factura</th>
              <th style={st.th}>Valor</th>
              <th style={st.th}>Certificado</th>
              <th style={st.th}>Enviar factura</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={12} style={st.noData}>Cargando...</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={12} style={st.noData}>Sin resultados</td></tr>
            ) : (
              paginated.map((item) => (
                <tr key={item.id} style={st.tableRow}>
                  <td style={st.td}>{item.id}</td>
                  <td style={st.td}>{item.consecutive}</td>
                  <td style={st.td}>{item.factus_bill_consecutive ?? "—"}</td>
                  <td style={st.td}>{item.waybill ?? "—"}</td>
                  <td style={st.td}>{item.policy_id ?? "—"}</td>
                  <td style={st.td}>{item.start_at ? item.start_at.split("T")[0] : "—"}</td>
                  <td style={st.td}>{item.end_at ? item.end_at.split("T")[0] : "—"}</td>
                  <td style={st.td}>{item.customer_id ?? "—"}</td>
                  <td style={st.td}>
                    {item.bill_url ? (
                      <a href={item.bill_url} target="_blank" rel="noopener noreferrer" style={{ color: "#60A5FA" }}>
                        Ver factura
                      </a>
                    ) : "—"}
                  </td>
                  <td style={st.td}>{item.billing_price ?? "—"}</td>
                  <td style={st.td}>
                    <button
                      onClick={() => {
                        const encodedId = btoa(String(item.id));
                        const url = `${import.meta.env.VITE_API_BASE_URL}/new_certificates/${encodedId}/download_view`;
                        window.open(url, "_blank");
                      }}
                      style={st.btnPrimary}
                    >
                      Descargar
                    </button>
                  </td>
                  <td style={st.td}>
                    {!item.bill_url ? (
                      <button
                        style={st.btnPrimary}
                        disabled={loadingId === item.id}
                        onClick={async () => {
                          try {
                            setLoadingId(item.id);
                            const response = await reportInvoice(item.id);
                            if (!response) {
                              alert("❌ No se pudo reportar la factura");
                              return;
                            }
                            alert("✅ Factura reportada correctamente");
                            window.location.reload();
                          } catch (error) {
                            console.error(error);
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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ─────────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={st.pagination}>
          <button disabled={page === 1} onClick={() => changePage(page - 1)} style={st.pageBtn}>
            ← Anterior
          </button>
          <span style={st.pageInfo}>Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => changePage(page + 1)} style={st.pageBtn}>
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Styles ───────────────────────────────────────────── */
const st: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px", fontFamily: "Inter, Arial, sans-serif", color: "#e4e4e7",
  },
  toolbar: {
    display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
    justifyContent: "space-between", marginBottom: "16px",
    background: "rgba(24,24,27,0.95)", padding: "14px 16px",
    borderRadius: "14px", border: "1px solid #2a2a33",
  },
  searchGroup: {
    display: "flex", alignItems: "center",
    background: "#1e1e24", borderRadius: "10px", border: "1px solid #2d2d35", overflow: "hidden",
  },
  selectWrapper: {
    position: "relative" as React.CSSProperties["position"],
    display: "flex", alignItems: "center", gap: 6,
    padding: "0 10px 0 12px",
    borderRight: "1px solid #2d2d35",
    background: "rgba(255,255,255,0.03)",
    minWidth: 140,
  },
  selectDot: {
    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, display: "block",
  },
  select: {
    appearance: "none" as React.CSSProperties["appearance"],
    background: "transparent", border: "none", color: "#D1D5DB",
    padding: "10px 20px 10px 0", outline: "none",
    cursor: "pointer", fontSize: 13, fontWeight: 500,
    width: "100%",
  },
  selectChevron: {
    fontSize: 10, color: "#6B7280", pointerEvents: "none" as React.CSSProperties["pointerEvents"],
    flexShrink: 0, marginLeft: -16,
  },
  searchDivider: {
    display: "block", width: 1, height: 18,
    background: "rgba(255,255,255,0.07)", flexShrink: 0,
  },
  input: {
    background: "transparent", border: "none", padding: "10px 12px",
    color: "#e4e4e7", outline: "none", minWidth: "180px", fontSize: 13,
  },
  btnSearch: {
    background: "rgba(37,99,235,0.2)", color: "#60A5FA", border: "none",
    borderLeft: "1px solid #2d2d35",
    padding: "10px 16px", cursor: "pointer", fontWeight: 600,
    fontSize: 13, transition: "background .2s", whiteSpace: "nowrap" as React.CSSProperties["whiteSpace"],
  },
  btnClear: {
    background: "transparent", color: "#6B7280", border: "none",
    padding: "10px 10px", cursor: "pointer", fontSize: 13,
  },
  dateGroup: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#1e1e24", padding: "6px 12px", borderRadius: "10px", border: "1px solid #3f3f46",
  },
  dateInput: {
    background: "transparent", border: "none", color: "#e4e4e7",
    outline: "none", fontSize: 13, colorScheme: "dark" as React.CSSProperties["colorScheme"],
  },
  sep: { color: "#71717a", fontSize: "14px" },
  btnExcel: {
    background: "rgba(16,185,129,0.15)", color: "#34D399",
    border: "1px solid rgba(16,185,129,0.35)", borderRadius: "10px",
    padding: "10px 18px", cursor: "pointer", fontWeight: 600,
    fontSize: 13, whiteSpace: "nowrap", transition: "all .2s",
  },
  resultBadge: {
    color: "#6B7280", fontSize: 13, marginBottom: 12,
  },
  tableWrapper: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #2a2a33",
  },
  table: {
    width: "100%", borderCollapse: "collapse", minWidth: 900,
  },
  thead: {
    background: "rgba(15,23,42,0.9)",
  },
  th: {
    padding: "12px 14px", textAlign: "center" as React.CSSProperties["textAlign"],
    fontSize: 12, fontWeight: 700, color: "#6B7280",
    textTransform: "uppercase" as React.CSSProperties["textTransform"],
    letterSpacing: "0.05em", borderBottom: "1px solid #2a2a33",
    whiteSpace: "nowrap",
  },
  tableRow: {
    backgroundColor: "#1e1e24", transition: "background 0.15s",
  },
  td: {
    textAlign: "center" as React.CSSProperties["textAlign"],
    padding: "12px 14px", borderBottom: "1px solid #23232a",
    fontSize: 13, whiteSpace: "nowrap",
  },
  noData: {
    textAlign: "center" as React.CSSProperties["textAlign"],
    padding: "32px", color: "#6B7280",
  },
  btnPrimary: {
    background: "rgba(37,99,235,0.15)", color: "#60A5FA",
    border: "1px solid rgba(37,99,235,0.3)", borderRadius: "8px",
    padding: "6px 12px", cursor: "pointer", fontWeight: 600,
    fontSize: 12, transition: "all .2s",
  },
  pagination: {
    display: "flex", justifyContent: "center", alignItems: "center",
    gap: "12px", marginTop: "20px",
  },
  pageBtn: {
    background: "rgba(30,41,59,0.9)", color: "#9CA3AF",
    border: "1px solid #374151", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontWeight: 500,
    fontSize: 13, transition: "all .2s",
  },
  pageInfo: {
    fontWeight: 500, color: "#9CA3AF", fontSize: 13, padding: "0 4px",
  },
};
