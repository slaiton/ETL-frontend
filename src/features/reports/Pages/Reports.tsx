import { useEffect, useState } from "react";
import { getPolicyOptions, type PolicyOption } from "../../../api/certificates";
import {downloadReportExcel} from "../../../api/reports";
import { useReports } from "../hooks/useReports";
import {
  TrendingUp, Search, Download, ChevronLeft, ChevronRight, AlertCircle, Inbox,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { C, ui, pill } from "../../../shared/styles/ui";

const PER_PAGE = 20;

const Reports = () => {
  const { data, loading, total, totalPages, fetchData } = useReports();

const [startDate, setStartDate] = useState("");
const [endDate, setEndDate] = useState("");
const [policyId, setPolicyId] = useState("");
const [isCancelled, setIsCancelled] = useState("");
const [page, setPage] = useState(1);
const [policies, setPolicies] = useState<PolicyOption[]>([]);
const [downloading, setDownloading] = useState(false);
const [downloadError, setDownloadError] = useState("");

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
      ...(isCancelled === "" ? {} : { is_cancelled: isCancelled === "true" }),
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
      ...(isCancelled === "" ? {} : { is_cancelled: isCancelled === "true" }),
      page: next,
      per_page: PER_PAGE,
    });
  };

  const handleDownload = async () => {
    setDownloadError("");

    const start = new Date(startDate);
    const end = new Date(endDate);

    const diffDays =
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays > 62) {
      setDownloadError(
        "El rango máximo permitido para descargar reportes es de dos meses."
      );
      return;
    }
    setDownloading(true);

    try {
      const response = await downloadReportExcel({
        start_date: startDate,
        end_date: endDate,
        policy_id: policyId ? Number(policyId) : undefined,
        ...(isCancelled === "" ? {} : { is_cancelled: isCancelled === "true" }),
      });

      if (!response) {
        alert("No fue posible generar el reporte.");
        return;
      }

      const binary = atob(response.file_base64);

      const bytes = new Uint8Array(binary.length);

      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], {
        type: response.mime_type,
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = response.filename;

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(error);
        if ((error as any)?.response?.status === 504) {
          setDownloadError(
            "La consulta supera el volumen permitido. Para todas las pólizas el rango máximo es de dos meses."
          );
        } else {
          setDownloadError(
            "No fue posible generar el reporte. Intente nuevamente."
          );
        }
        } finally {
      setDownloading(false);
    }
  };

  const hasFilters =
    startDate !== "" || endDate !== "" || policyId !== "" || isCancelled !== "";
  const canDownload = startDate !== "" && endDate !== "" && !downloading;

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <div className="app-page" style={st.container}>
      <PageHeader
        icon={<TrendingUp size={20} />}
        title="Reporte de pólizas"
        subtitle="Consulta los certificados por rango de fechas y descárgalos en Excel"
      />

      <div style={st.panel}>
        <div style={st.section}>
          <span style={st.sectionLabel}>Filtros</span>
          <div style={st.row}>
            <Field label="Fecha inicial">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={st.input}
              />
            </Field>

            <Field label="Fecha final">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={st.input}
              />
            </Field>

            <Field label="Empresa" wide>
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
            <Field label="Anulación">
              <div style={st.selectWrap}>
                <select
                  value={isCancelled}
                  onChange={(e) => setIsCancelled(e.target.value)}
                  style={st.select}
                >
                  <option value="">Todos</option>
                  <option value="true">Anulados</option>
                  <option value="false">No anulados</option>
                </select>
                <span style={st.chevron}>▾</span>
              </div>
            </Field>
          </div>
        </div>

        <div style={st.footer}>
          <span style={st.hint}>
            La descarga en Excel requiere ambas fechas; máximo dos meses por descarga.
          </span>
          <div style={st.actions}>
            <button onClick={handleSearch} disabled={loading} style={st.btnSearch}>
              <Search size={15} /> {loading ? "Consultando..." : "Consultar"}
            </button>
            <button
              onClick={handleDownload}
              disabled={!canDownload}
              style={st.btnExcel}
              title={canDownload ? "Descargar el reporte en Excel" : "Selecciona fecha inicial y final"}
            >
              <Download size={15} /> {downloading ? "Generando Excel..." : "Descargar Excel"}
            </button>
          </div>
        </div>

        {downloadError && (
          <div style={st.downloadError} role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{downloadError}</span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={st.emptyState}>
          <span style={st.spinner} />
          <p style={st.emptyTitle}>Cargando reporte...</p>
        </div>
      ) : data.length === 0 ? (
        <div style={st.emptyState}>
          <span style={st.emptyIcon}><Inbox size={22} /></span>
          <p style={st.emptyTitle}>
            {hasFilters ? "No hay información para estos filtros" : "Aún no hay resultados"}
          </p>
          <p style={st.emptyText}>
            {hasFilters
              ? "Prueba con otro rango de fechas o con otra empresa."
              : "Elige un rango de fechas y presiona Consultar."}
          </p>
        </div>
      ) : (
        <>
          <div style={st.resultBar}>
            <span style={pill("primary")}>
              {total} registro{total !== 1 ? "s" : ""}
            </span>
            {totalPages > 1 && <span style={st.badge}>Página {page} de {totalPages}</span>}
          </div>

          <div style={st.tableWrap}>
            <table style={st.table}>
              <thead>
                <tr style={st.thead}>
                  {columns.map((key) => (
                    <th key={key} style={st.th}>
                      {key === "is_cancelled" ? "Anulado" : key}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {data.map((item: any, index: number) => (
                  <tr key={index} style={st.tableRow}>
                    {columns.map((key) => (
                      <td key={key} style={st.td}>
                        {key === "is_cancelled"
                          ? item[key]
                            ? "Sí"
                            : "No"
                          : item[key] !== null && item[key] !== undefined && item[key] !== ""
                            ? String(item[key])
                            : <span style={{ color: C.faint }}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
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
                <ChevronLeft size={15} /> Anterior
              </button>

              <span style={st.pageInfo}>
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => changePage(page + 1)}
                disabled={page === totalPages}
                style={st.pageBtn}
              >
                Siguiente <ChevronRight size={15} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ ...st.field, ...(wide ? { flex: 2, minWidth: 260 } : {}) }}>
      <label style={st.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const st: Record<string, React.CSSProperties> = {
  container: { ...ui.page },

  title: { ...ui.title, marginBottom: 20 },

  panel: {
    ...ui.card,
    padding: "18px 20px", marginBottom: 16,
    display: "flex", flexDirection: "column", gap: 16,
  },
  section: { display: "flex", flexDirection: "column", gap: 10 },
  sectionLabel: ui.sectionLabel,
  row: { display: "flex", flexWrap: "wrap", gap: 12 },

  field: { display: "flex", flexDirection: "column", gap: 6, minWidth: 200, flex: 1 },
  fieldLabel: ui.label,
  input: ui.input,

  selectWrap: { position: "relative", display: "flex", alignItems: "center" },
  select: { ...ui.input, appearance: "none", paddingRight: 32, cursor: "pointer" },
  chevron: { display: "none" }, // la flecha la pone .app-page select

  footer: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 12, flexWrap: "wrap", paddingTop: 14, borderTop: `1px solid ${C.borderSoft}`,
  },
  hint: { fontSize: 12, color: C.muted },
  actions: { display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" },
  btnSearch: ui.btnPrimary,
  btnExcel: ui.btnSuccess,
  btnCancel: ui.btnDanger,

  badge: { color: C.muted, fontSize: 13, fontWeight: 500 },
  resultBar: { display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" },

  emptyState: {
    ...ui.card,
    padding: "48px 24px",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
    textAlign: "center",
  },
  emptyIcon: { ...ui.iconTile, width: 48, height: 48, borderRadius: 14, marginBottom: 6 },
  emptyTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: C.ink },
  emptyText: { margin: 0, fontSize: 13, color: C.muted },
  spinner: {
    width: 22, height: 22, borderRadius: "50%", marginBottom: 6,
    border: `3px solid ${C.primaryTint2}`, borderTopColor: C.primary,
    animation: "spin 0.8s linear infinite",
  },

  tableWrap: ui.tableWrap,
  table: { ...ui.table, minWidth: 900 },
  thead: {},
  th: { ...ui.th, textAlign: "center" },
  tableRow: {},
  td: { ...ui.td, textAlign: "center" },
  noData: ui.noData,

  pagination: { display: "flex", justifyContent: "center", alignItems: "center", gap: 12, marginTop: 20 },
  pageBtn: { ...ui.btnSecondary, minHeight: 36, padding: "7px 14px" },
  pageInfo: { fontWeight: 600, color: C.muted, fontSize: 13 },
  downloadError: {
    display: "flex", alignItems: "flex-start", gap: 8,
    padding: "10px 14px", borderRadius: 10,
    background: C.dangerTint, border: `1px solid ${C.dangerBorder}`,
    color: C.danger, fontSize: 13, fontWeight: 500,
  },
};

export default Reports;
