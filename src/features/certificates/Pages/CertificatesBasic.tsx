import { useEffect, useState } from "react";
import {
  FileSearch,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { C, ui } from "../../../shared/styles/ui";
import type { Certificate } from "../../../models/certificates.model";
import { useCertificates } from "../hooks/useCertificates";
import { useAuth } from "../../../shared/context/AuthContext";
import { escapeCsvCell } from "../../../shared/utils/csv";
import {
  getAllCertificates,
  getPolicyOptions,
  type CertificateFilters,
  type PolicyOption,
} from "../../../api/certificates";

const PER_PAGE = 20;
const formatDate = (d: Date) => d.toISOString().split("T")[0];

/* ── Excel ────────────────────────────────────────────── */
function exportToExcel(data: Certificate[]) {
  const headers = [
    "ID",
    "Certificado",
    "Factura",
    "Waybill",
    "Placa",
    "Póliza",
    "Inicio",
    "Fin",
    "Cliente",
    "Valor",
    "Anulado",
  ];

  const rows = data.map((r) => [
    r.id,
    r.consecutive,
    r.factus_bill_consecutive ?? "",
    r.waybill ?? "",
    r.plaque ?? "",
    r.policy_id ?? "",
    r.start_at ? r.start_at.split("T")[0] : "",
    r.end_at ? r.end_at.split("T")[0] : "",
    r.customer_id ?? "",
    r.billing_price ?? "",
    r.is_cancelled ? "Sí" : "No",
  ]);

  const csv = [headers, ...rows]
    .map((r) => r.map(escapeCsvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;",
  });

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
  is_cancelled: string;
}

const EMPTY: FilterDraft = {
  id: "",
  certificate: "",
  waybill: "",
  factus_bill_consecutive: "",
  policy_id: "",
  plaque: "",
  start_date: "",
  end_date: "",
  is_invoiced: "",
  is_cancelled: "",
};

function draftToFilters(draft: FilterDraft, page: number): CertificateFilters {
  const f: CertificateFilters = { page, per_page: PER_PAGE };
  if (draft.id) f.id = Number(draft.id);
  if (draft.certificate) f.certificate = draft.certificate;
  if (draft.waybill) f.waybill = draft.waybill;
  if (draft.factus_bill_consecutive)
    f.factus_bill_consecutive = draft.factus_bill_consecutive;
  if (draft.policy_id) f.policy_id = Number(draft.policy_id);
  if (draft.plaque) f.plaque = draft.plaque;
  if (draft.start_date) f.start_date = draft.start_date;
  if (draft.end_date) f.end_date = draft.end_date;
  if (draft.is_invoiced !== "") f.is_invoiced = draft.is_invoiced === "true";
  if (draft.is_cancelled !== "")
    f.is_cancelled = draft.is_cancelled === "true";
  return f;
}

/* ── Component ───────────────────────────────────────── */
export default function Certificates() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<FilterDraft>(EMPTY);
  const [applied, setApplied] = useState<FilterDraft>(EMPTY);
  const [page, setPage] = useState(1);
  const [policyOptions, setPolicyOptions] = useState<PolicyOption[]>([]);
  const [exporting, setExporting] = useState(false);

  const { data, total, totalPages, loading, fetchData } = useCertificates();

  const hasFilters = Object.values(applied).some((v) => v !== "");

  /* Carga inicial */
  useEffect(() => {
    fetchData({ page: 1, per_page: PER_PAGE });
    getPolicyOptions().then(setPolicyOptions);
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

  const set =
    (field: keyof FilterDraft) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setDraft((p) => ({ ...p, [field]: e.target.value }));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") applySearch();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const certificates = await getAllCertificates(draftToFilters(applied, 1));
      exportToExcel(certificates);
    } catch (error) {
      console.error("No fue posible exportar todos los certificados:", error);
      alert(
        "No fue posible descargar todos los certificados. Intenta de nuevo.",
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="app-page" style={st.container}>
      <PageHeader
        icon={<FileSearch size={20} />}
        title="Certificados cliente"
        subtitle={
          user?.client?.name
            ? `Certificados de las pólizas de ${user.client.name}`
            : "Búsqueda rápida y descarga de certificados"
        }
      />

      {/* ── Panel de filtros ───────────────────────────── */}
      <div style={st.panel}>
        {/* Sección Búsqueda */}
        <div style={st.section}>
          <span style={st.sectionLabel}>Búsqueda</span>
          <div style={st.row}>
            <Field label="ID">
              <input
                type="number"
                placeholder="Ej: 12345"
                value={draft.id}
                onChange={set("id")}
                onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Certificado">
              <input
                type="text"
                placeholder="Consecutivo..."
                value={draft.certificate}
                onChange={set("certificate")}
                onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Waybill">
              <input
                type="text"
                placeholder="Nro. guía..."
                value={draft.waybill}
                onChange={set("waybill")}
                onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Placa">
              <input
                type="text"
                placeholder="Ej: ABC123..."
                value={draft.plaque}
                onChange={set("plaque")}
                onKeyDown={onKey}
                style={st.input}
              />
            </Field>
            <Field label="Póliza">
              <div style={st.selectWrap}>
                <select
                  value={draft.policy_id}
                  onChange={set("policy_id")}
                  style={st.select}
                >
                  <option value="">Todas las pólizas</option>
                  {policyOptions.map((p) => (
                    <option key={p.policy_id} value={String(p.policy_id)}>
                      {p.external_code} — {p.beneficiary_name}
                    </option>
                  ))}
                </select>
                <span style={st.chevron}>▾</span>
              </div>
            </Field>
            <Field label="Factura Factus">
              <input
                type="text"
                placeholder="Consecutivo factura..."
                value={draft.factus_bill_consecutive}
                onChange={set("factus_bill_consecutive")}
                onKeyDown={onKey}
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
                type="date"
                value={draft.start_date}
                onChange={set("start_date")}
                style={st.input}
              />
            </Field>
            <Field label="Hasta">
              <input
                type="date"
                value={draft.end_date}
                onChange={set("end_date")}
                style={st.input}
              />
            </Field>
            <Field label="Facturación">
              <div style={st.selectWrap}>
                <select
                  value={draft.is_invoiced}
                  onChange={set("is_invoiced")}
                  style={st.select}
                >
                  <option value="">Todos</option>
                  <option value="true">Facturado</option>
                  <option value="false">Sin factura</option>
                </select>
                <span style={st.chevron}>▾</span>
              </div>
            </Field>
            <Field label="Anulación">
              <div style={st.selectWrap}>
                <select
                  value={draft.is_cancelled}
                  onChange={set("is_cancelled")}
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

        {/* Acciones */}
        <div style={st.actions}>
          <button onClick={applySearch} disabled={loading} style={st.btnSearch}>
            {loading ? (
              "Buscando..."
            ) : (
              <>
                <Search size={15} /> Buscar
              </>
            )}
          </button>
          {hasFilters && (
            <button onClick={clearAll} style={st.btnClear}>
              <X size={15} /> Limpiar
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={data.length === 0 || loading || exporting}
            style={st.btnExcel}
          >
            <Download size={15} /> {exporting ? "Generando Excel..." : "Excel"}
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
              {[
                "ID",
                "Certificado",
                "Factura",
                "Waybill",
                "Placa",
                "Póliza",
                "Inicio",
                "Fin",
                "Cliente",
                "Valor",
                "Anulado",
                "Descargar",
              ].map((h) => (
                <th key={h} style={st.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={12} style={st.noData}>
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={12} style={st.noData}>
                  Sin resultados
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} style={st.tableRow}>
                  <td style={st.td}>{item.id}</td>
                  <td style={st.td}>{item.consecutive}</td>
                  <td style={st.td}>{item.factus_bill_consecutive ?? "—"}</td>
                  <td style={st.td}>{item.waybill ?? "—"}</td>
                  <td style={st.td}>{item.plaque ?? "—"}</td>
                  <td style={st.td}>{item.policy_id ?? "—"}</td>
                  <td style={st.td}>
                    {item.start_at ? item.start_at.split("T")[0] : "—"}
                  </td>
                  <td style={st.td}>
                    {item.end_at ? item.end_at.split("T")[0] : "—"}
                  </td>
                  <td style={st.td}>{item.customer_id ?? "—"}</td>
                  <td style={st.td}>{item.billing_price ?? "—"}</td>
                  <td style={st.td}>{item.is_cancelled ? "Sí" : "No"}</td>
                  <td style={st.td}>
                    {/* No se puede descargar un certificado anulado, por eso se deshabilita el botón */}
                    <button
                      style={st.btnAction}
                      disabled={item.is_cancelled}
                      title={
                        item.is_cancelled
                          ? "No se puede descargar un certificado anulado"
                          : undefined
                      }
                      onClick={() => {
                        const url = `${import.meta.env.VITE_API_CERTIFICATE_URL}/new_certificates/${btoa(String(item.id))}/download_view`;
                        window.open(url, "_blank");
                      }}
                    >
                      Descargar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Paginación ─────────────────────────────────── */}
      {totalPages > 1 && (
        <div style={st.pagination}>
          <button
            disabled={page <= 1}
            onClick={() => changePage(page - 1)}
            style={st.pageBtn}
          >
            <ChevronLeft size={15} /> Anterior
          </button>
          <span style={st.pageInfo}>
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => changePage(page + 1)}
            style={st.pageBtn}
          >
            Siguiente <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Field wrapper ───────────────────────────────────── */
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={st.field}>
      <label style={st.fieldLabel}>{label}</label>
      {children}
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
  row: { display: "flex", flexWrap: "wrap", gap: 12 },
  divider: { height: 1, background: C.borderSoft },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 150,
    flex: 1,
  },
  fieldLabel: ui.label,
  input: ui.input,

  selectWrap: { position: "relative", display: "flex", alignItems: "center" },
  select: {
    ...ui.input,
    appearance: "none",
    paddingRight: 32,
    cursor: "pointer",
  },
  chevron: { display: "none" }, // la flecha la pone .app-page select

  actions: {
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "flex-end",
    flexWrap: "wrap",
  },
  btnSearch: { ...ui.btnPrimary, minWidth: 120 },
  btnClear: ui.btnSecondary,
  btnExcel: ui.btnSuccess,

  badge: { color: C.muted, fontSize: 13, fontWeight: 500, margin: "0 0 10px" },

  tableWrap: ui.tableWrap,
  table: { ...ui.table, minWidth: 900 },
  thead: {},
  th: { ...ui.th, textAlign: "center" },
  tableRow: {},
  td: { ...ui.td, textAlign: "center" },
  noData: ui.noData,
  btnAction: {
    ...ui.btnSoft,
    minHeight: 32,
    padding: "6px 12px",
    fontSize: 12,
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
  },
  pageBtn: { ...ui.btnSecondary, minHeight: 36, padding: "7px 14px" },
  pageInfo: { fontWeight: 600, color: C.muted, fontSize: 13 },
};
