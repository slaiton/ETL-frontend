import { useState } from "react";
import { FileX, Search, Ban } from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { C, ui, pill } from "../../../shared/styles/ui";
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
  const STATUS: Record<string, { label: string; tone: Parameters<typeof pill>[0] }> = {
    READY: { label: "Disponible", tone: "success" },
    ALREADY_DECLINED: { label: "Ya anulado", tone: "danger" },
    NOT_FOUND: { label: "No encontrado", tone: "warning" },
  };

  const renderStatus = (status: string) => {
    const meta = STATUS[status] ?? { label: status, tone: "neutral" as const };
    return (
      <span style={pill(meta.tone)} title={status}>
        {meta.label}
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
    <div className="app-page" style={st.container}>
      <PageHeader
        icon={<FileX size={20} />}
        title="Anulación de certificados"
        subtitle="Valida uno o varios waybills y anula los certificados disponibles"
      />

      {/* ── Panel principal ───────────────────────────── */}
      <div style={st.panel}>

        {/* Sección búsqueda */}
        <div style={st.section}>
          <span style={st.sectionLabel}>
            Consulta por waybill
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
              : <><Search size={15} /> Buscar certificados</>}
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
              : <><Ban size={15} /> Procesar anulación</>}
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
  container: { ...ui.page },

  panel: {
    ...ui.card,
    padding: "18px 20px",
    marginBottom: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: ui.sectionLabel,
  description: { fontSize: 13, color: C.muted, lineHeight: 1.5 },
  divider: { height: 1, background: C.borderSoft },

  field: { display: "flex", flexDirection: "column", gap: 6, width: "100%" },
  fieldLabel: ui.label,
  textarea: {
    ...ui.input,
    padding: "10px 12px",
    resize: "vertical",
    lineHeight: 1.6,
    fontFamily: "Consolas, 'Cascadia Mono', ui-monospace, monospace",
  },

  actions: { display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" },
  btnSearch: ui.btnPrimary,
  btnProcess: {
    ...ui.btnPrimary,
    background: C.dangerSolid,
    boxShadow: "0 10px 20px -12px rgba(220,38,38,0.9)",
  },
  btnDisabled: { opacity: 0.5, cursor: "not-allowed", boxShadow: "none" },

  summary: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" },
  badge: { color: C.muted, fontSize: 13, fontWeight: 500 },
  readyBadge: pill("success"),

  sectionBlock: { marginBottom: 20 },
  tableTitle: { fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 10 },

  tableWrap: ui.tableWrap,
  table: { ...ui.table, minWidth: 700 },
  thead: {},
  th: { ...ui.th, textAlign: "center" },
  tableRow: {},
  td: { ...ui.td, textAlign: "center" },

  pre: {
    margin: 0,
    padding: 10,
    background: C.surfaceAlt,
    border: `1px solid ${C.borderSoft}`,
    borderRadius: 8,
    color: C.text,
    fontSize: 11,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxWidth: 500,
    textAlign: "left",
  },
};
