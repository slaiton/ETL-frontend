import { useState } from "react";
import { useCertificateCancellation } from "../hooks/useCertificateCancellation";

export default function CertificateCancellation() {
  const [waybillsText, setWaybillsText] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [processResults, setProcessResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingProcess, setLoadingProcess] = useState(false);

  const { search, process } = useCertificateCancellation();

  /* ── Buscar certificados ───────────────────────────── */
  const handleSearch = async () => {
    try {
      setLoadingSearch(true);

      const waybills = waybillsText
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean);

      if (waybills.length === 0) {
        alert("Ingrese al menos un waybill");
        return;
      }

      const response = await search(waybills);

      setResults(response.data ?? []);
      setProcessResults([]);
    } catch (error) {
      console.error(error);
      alert("Error consultando certificados");
    } finally {
      setLoadingSearch(false);
    }
  };

  /* ── Procesar anulación ────────────────────────────── */
  const handleProcess = async () => {
    try {
      setLoadingProcess(true);

      const readyWaybills = results
        .filter((x) => x.status === "READY")
        .map((x) => x.waybill);

      if (readyWaybills.length === 0) {
        alert("No hay certificados disponibles para anular");
        return;
      }

      const response = await process(readyWaybills);

      setProcessResults(response.data ?? []);
    } catch (error) {
      console.error(error);
      alert("Error procesando anulación");
    } finally {
      setLoadingProcess(false);
    }
  };

  /* ── Estado de validación ──────────────────────────── */
  const renderStatus = (status: string) => {
    const styles: Record<string, React.CSSProperties> = {
      READY: {
        background: "rgba(16,185,129,0.15)",
        color: "#34D399",
        border: "1px solid rgba(16,185,129,0.35)",
      },

      ALREADY_DECLINED: {
        background: "rgba(239,68,68,0.15)",
        color: "#F87171",
        border: "1px solid rgba(239,68,68,0.35)",
      },

      NOT_FOUND: {
        background: "rgba(249,115,22,0.15)",
        color: "#FB923C",
        border: "1px solid rgba(249,115,22,0.35)",
      },
    };

    return (
      <span
        style={{
          display: "inline-block",
          padding: "5px 10px",
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.03em",
          ...(styles[status] || {
            background: "rgba(107,114,128,0.15)",
            color: "#9CA3AF",
            border: "1px solid rgba(107,114,128,0.3)",
          }),
        }}
      >
        {status}
      </span>
    );
  };

  /* ── Resultado del proceso ─────────────────────────── */
  const renderProcessResult = (row: any) => {
    const value = row.response ?? row.error;

    if (!value) {
      return "—";
    }

    if (typeof value === "string") {
      return value;
    }

    return (
      <pre style={st.pre}>
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  };

  const readyCount = results.filter(
    (x) => x.status === "READY"
  ).length;

  return (
    <div style={st.container}>

      {/* ── Panel principal ───────────────────────────── */}
      <div style={st.panel}>

        {/* Sección búsqueda */}
        <div style={st.section}>
          <span style={st.sectionLabel}>
            Anulación de certificados
          </span>

          <div style={st.description}>
            Ingrese uno o varios waybills, uno por línea, para
            consultar el estado de sus certificados.
          </div>

          <div style={st.field}>
            <label style={st.fieldLabel}>
              Waybills
            </label>

            <textarea
              rows={8}
              value={waybillsText}
              onChange={(e) => setWaybillsText(e.target.value)}
              placeholder={"Ej:\n123456789\n987654321\n456789123"}
              style={st.textarea}
            />
          </div>
        </div>

        <div style={st.divider} />

        {/* Acciones */}
        <div style={st.actions}>

          <button
            onClick={handleSearch}
            disabled={loadingSearch}
            style={{
              ...st.btnSearch,
              ...(loadingSearch ? st.btnDisabled : {}),
            }}
          >
            {loadingSearch
              ? "Consultando..."
              : "Buscar certificados"}
          </button>

          <button
            onClick={handleProcess}
            disabled={
              loadingProcess ||
              readyCount === 0
            }
            style={{
              ...st.btnProcess,
              ...(loadingProcess || readyCount === 0
                ? st.btnDisabled
                : {}),
            }}
          >
            {loadingProcess
              ? "Procesando..."
              : "Procesar anulación"}
          </button>

        </div>
      </div>

      {/* ── Badge resultado ────────────────────────────── */}
      {!loadingSearch && results.length > 0 && (
        <div style={st.summary}>
          <span style={st.badge}>
            {results.length} registro
            {results.length !== 1 ? "s" : ""} consultado
            {results.length !== 1 ? "s" : ""}
          </span>

          <span style={st.readyBadge}>
            {readyCount} disponible
            {readyCount !== 1 ? "s" : ""} para anulación
          </span>
        </div>
      )}

      {/* ── Tabla validación ───────────────────────────── */}
      {results.length > 0 && (
        <div style={st.sectionBlock}>

          <div style={st.tableTitle}>
            <span>Resultado de validación</span>
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>

              <thead>
                <tr style={st.thead}>
                  <th style={st.th}>Waybill</th>
                  <th style={st.th}>Certificate ID</th>
                  <th style={st.th}>Approved At</th>
                  <th style={st.th}>Estado</th>
                </tr>
              </thead>

              <tbody>
                {results.map((row, index) => (
                  <tr
                    key={index}
                    style={st.tableRow}
                  >
                    <td style={st.td}>
                      {row.waybill ?? "—"}
                    </td>

                    <td style={st.td}>
                      {row.certificate_id ?? "—"}
                    </td>

                    <td style={st.td}>
                      {row.approved_at ?? "—"}
                    </td>

                    <td style={st.td}>
                      {renderStatus(row.status)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

      {/* ── Tabla resultado anulación ──────────────────── */}
      {processResults.length > 0 && (
        <div style={st.sectionBlock}>

          <div style={st.tableTitle}>
            <span>Resultado de anulación</span>
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>

              <thead>
                <tr style={st.thead}>
                  <th style={st.th}>Waybill</th>
                  <th style={st.th}>Certificate ID</th>
                  <th style={st.th}>Resultado</th>
                </tr>
              </thead>

              <tbody>
                {processResults.map((row, index) => (
                  <tr
                    key={index}
                    style={st.tableRow}
                  >
                    <td style={st.td}>
                      {row.waybill ?? "—"}
                    </td>

                    <td style={st.td}>
                      {row.certificate_id ?? "—"}
                    </td>

                    <td
                      style={{
                        ...st.td,
                        textAlign: "left",
                        maxWidth: 500,
                      }}
                    >
                      {renderProcessResult(row)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── Styles ──────────────────────────────────────────── */

const st: Record<string, React.CSSProperties> = {
  container: {
    padding: "20px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#e4e4e7",
  },

  /* Panel */

  panel: {
    background: "rgba(24,24,27,0.95)",
    border: "1px solid #2a2a33",
    borderRadius: "14px",
    padding: "16px 20px",
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  section: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#4B5563",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  },

  description: {
    fontSize: 13,
    color: "#9CA3AF",
    lineHeight: 1.5,
  },

  divider: {
    height: 1,
    background: "#2a2a33",
  },

  /* Field */

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    width: "100%",
  },

  fieldLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: 500,
  },

  textarea: {
    background: "#1e1e24",
    border: "1px solid #3f3f46",
    borderRadius: "8px",
    color: "#e4e4e7",
    padding: "10px 12px",
    fontSize: 13,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical",
    fontFamily: "Inter, Arial, sans-serif",
    lineHeight: 1.5,
  },

  /* Actions */

  actions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    justifyContent: "flex-end",
  },

  btnSearch: {
    background: "rgba(37,99,235,0.2)",
    color: "#60A5FA",
    border: "1px solid rgba(37,99,235,0.35)",
    borderRadius: "8px",
    padding: "8px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },

  btnProcess: {
    background: "rgba(239,68,68,0.15)",
    color: "#F87171",
    border: "1px solid rgba(239,68,68,0.35)",
    borderRadius: "8px",
    padding: "8px 20px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
  },

  btnDisabled: {
    opacity: 0.45,
    cursor: "not-allowed",
  },

  /* Summary */

  summary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "10px",
    flexWrap: "wrap",
  },

  badge: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  readyBadge: {
    background: "rgba(16,185,129,0.1)",
    color: "#34D399",
    border: "1px solid rgba(16,185,129,0.25)",
    borderRadius: 6,
    padding: "4px 8px",
    fontSize: 11,
    fontWeight: 600,
  },

  /* Sections */

  sectionBlock: {
    marginBottom: "20px",
  },

  tableTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "#D1D5DB",
    marginBottom: "10px",
  },

  /* Table */

  tableWrap: {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #2a2a33",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 700,
  },

  thead: {
    background: "rgba(15,23,42,0.9)",
  },

  th: {
    padding: "12px 14px",
    textAlign: "center",
    fontSize: 12,
    fontWeight: 700,
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #2a2a33",
    whiteSpace: "nowrap",
  },

  tableRow: {
    backgroundColor: "#1e1e24",
  },

  td: {
    textAlign: "center",
    padding: "12px 14px",
    borderBottom: "1px solid #23232a",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  pre: {
    margin: 0,
    padding: "8px",
    background: "#15151a",
    borderRadius: "6px",
    color: "#9CA3AF",
    fontSize: 11,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: 500,
    textAlign: "left",
  },
};