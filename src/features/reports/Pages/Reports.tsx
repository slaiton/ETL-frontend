import { useEffect, useState } from "react";
import { getPolicyOptions, type PolicyOption } from "../../../api/certificates";
import { downloadReport, cancelReportDownload, wasDownloadCancelled} from "../../../api/reports";
import { useReports } from "../hooks/useReports";

const PER_PAGE = 20;

const Reports = () => {
  const { data, loading, total, totalPages, fetchData } = useReports();

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [policyId, setPolicyId] = useState("");
const [page, setPage] = useState(1);
const [policies, setPolicies] = useState<PolicyOption[]>([]);
const [downloading, setDownloading] = useState(false);
const [remainingSeconds, setRemainingSeconds] = useState(0);
const REFERENCE_RECORDS = 54000;
const REFERENCE_SECONDS = 20 * 60; // 1200 segundos

  useEffect(() => {
    const loadPolicies = async () => {
      const data = await getPolicyOptions();
      setPolicies(data);
    };

    loadPolicies();
  }, []);

  const handleSearch = async () => {
    setPage(1);

    await fetchData({
      start_date: startDate,
      end_date: endDate,
      policy_id: policyId ? Number(policyId) : undefined,
      page: 1,
      per_page: PER_PAGE,
    });
  };

  const changePage = async (next: number) => {
    setPage(next);

    await fetchData({
      start_date: startDate,
      end_date: endDate,
      policy_id: policyId ? Number(policyId) : undefined,
      page: next,
      per_page: PER_PAGE,
    });
  };

  const handleDownload = async () => {

    setDownloading(true);

    const estimatedSeconds = Math.max(
      5,
      Math.round((total * REFERENCE_SECONDS) / REFERENCE_RECORDS)
    );

    setRemainingSeconds(estimatedSeconds);

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const data = await downloadReport({
        start_date: startDate,
        end_date: endDate,
        policy_id: policyId ? Number(policyId) : undefined,
    });
    clearInterval(timer);
    setDownloading(false);
    setRemainingSeconds(0);

    if (wasDownloadCancelled()) {
        return;
    }

    if (!data.length) {
        alert("Descarga cancelada.");
        return;
    }

      const headers = Object.keys(data[0]);

      const rows = data.map((item: any) =>
        headers.map(header => item[header])
      );

      const csv = [
        headers.join(","),
        ...rows.map(row =>
          row.map(value =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
          ).join(",")
        )
      ].join("\n");

      const blob = new Blob(
        ["\uFEFF" + csv],
        { type: "text/csv;charset=utf-8;" }
      );

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "ReportePolizas.csv";

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasFilters = startDate !== "" || endDate !== "" || policyId !== "";

  return (
    <div style={st.container}>

      <h1 style={st.title}>Reporte de Pólizas</h1>

      <div style={st.panel}>
        <div style={st.section}>
          <span style={st.sectionLabel}>Filtros</span>
          <div style={st.row}>
            <Field label="Fecha Inicial">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={{ ...st.input, colorScheme: "dark" as React.CSSProperties["colorScheme"] }}
              />
            </Field>

            <Field label="Fecha Final">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ ...st.input, colorScheme: "dark" as React.CSSProperties["colorScheme"] }}
              />
            </Field>

            <Field label="Empresa">
              <div style={st.selectWrap}>
                <select
                  value={policyId}
                  onChange={(e) => setPolicyId(e.target.value)}
                  style={st.select}
                >
                  <option value="">Todas las pólizas</option>
                  {policies.map((policy) => (
                    <option key={policy.policy_id} value={policy.policy_id}>
                      {policy.external_code} - {policy.beneficiary_name}
                    </option>
                  ))}
                </select>
                <span style={st.chevron}>▾</span>
              </div>
            </Field>
          </div>
        </div>

        <div style={st.actions}>
          <button onClick={handleSearch} style={st.btnSearch}>
            Consultar
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{ ...st.btnExcel, opacity: downloading ? 0.6 : 1, cursor: downloading ? "not-allowed" : "pointer" }}
          >
            {downloading
              ? remainingSeconds > 0
                ? `Descargando... ${formatTime(remainingSeconds)}`
                : "Casi listo..."
              : "Descargar CSV"}
          </button>

          {downloading && (
            <button
              onClick={() => {
                cancelReportDownload();
                setDownloading(false);
                setRemainingSeconds(0);
              }}
              style={st.btnCancel}
            >
              ✕ Cancelar
            </button>
          )}
        </div>
      </div>

      {loading && <p style={st.badge}>Cargando reporte...</p>}

      {!loading && (
        <>
          <p style={st.badge}>
            {hasFilters
              ? `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
              : `Total registros: ${total}`}
          </p>

          <div style={st.tableWrap}>
            <table style={st.table}>
              <thead>
                <tr style={st.thead}>
                  {data.length > 0 &&
                    Object.keys(data[0]).map((key) => (
                      <th key={key} style={st.th}>
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td
                      colSpan={Object.keys(data[0] ?? {}).length || 1}
                      style={st.noData}
                    >
                      No hay información
                    </td>
                  </tr>
                ) : (
                  data.map((item: any, index: number) => (
                    <tr key={index} style={st.tableRow}>
                      {Object.keys(item).map((key) => (
                        <td key={key} style={st.td}>
                          {item[key] !== null ? String(item[key]) : ""}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div style={st.pagination}>
              <button
                onClick={() => changePage(page - 1)}
                disabled={page === 1}
                style={st.pageBtn}
              >
                ← Anterior
              </button>

              <span style={st.pageInfo}>
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                style={st.pageBtn}
              >
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={st.field}>
      <label style={st.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  container: { padding: "20px", fontFamily: "Inter, Arial, sans-serif", color: "#e4e4e7" },

  title: { fontSize: 24, fontWeight: 700, marginBottom: 20 },

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

  field: { display: "flex", flexDirection: "column", gap: "4px", minWidth: 200, flex: 1 },
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
  btnExcel: {
    background: "rgba(16,185,129,0.15)", color: "#34D399",
    border: "1px solid rgba(16,185,129,0.35)", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13,
  },
  btnCancel: {
    background: "rgba(239,68,68,0.15)", color: "#F87171",
    border: "1px solid rgba(239,68,68,0.35)", borderRadius: "8px",
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

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", marginTop: "20px" },
  pageBtn: {
    background: "rgba(30,41,59,0.9)", color: "#9CA3AF",
    border: "1px solid #374151", borderRadius: "8px",
    padding: "8px 16px", cursor: "pointer", fontWeight: 500, fontSize: 13,
  },
  pageInfo: { fontWeight: 500, color: "#9CA3AF", fontSize: 13 },
};

export default Reports;