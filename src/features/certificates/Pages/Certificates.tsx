import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileText,
  Search,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import PageHeader from "../../../components/ui/PageHeader";
import { C, ui, pill } from "../../../shared/styles/ui";
import type { Certificate } from "../../../models/certificates.model";
import { reportInvoice } from "../../../api/invoices";
import { useCertificates } from "../hooks/useCertificates";
import { escapeCsvCell } from "../../../shared/utils/csv";
import {
  getAllCertificates,
  getPolicyOptions,
  refreshCertificates,
  type CertificateFilters,
  type PolicyOption,
  type RefreshResponse,
  type RefreshRow,
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
    "URL Factura",
    "Valor",
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
    r.bill_url ?? "",
    r.billing_price ?? "",
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map(escapeCsvCell).join(","))
    .join("\r\n");
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
  id: "",
  certificate: "",
  waybill: "",
  factus_bill_consecutive: "",
  policy_id: "",
  plaque: "",
  start_date: "",
  end_date: "",
  is_invoiced: "",
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
  return f;
}

/* ── Component ───────────────────────────────────────── */
export default function Certificates() {
  const [searchParams] = useSearchParams();
  // /certificates?invoice=false (KPI "Sin factura" del dashboard) preselecciona el filtro
  const [initialDraft] = useState<FilterDraft>(() => {
    const invoice = searchParams.get("invoice");
    return {
      ...EMPTY,
      is_invoiced: invoice === "false" || invoice === "true" ? invoice : "",
    };
  });
  const [draft, setDraft] = useState<FilterDraft>(initialDraft);
  const [applied, setApplied] = useState<FilterDraft>(initialDraft);

  /* Refresco desde producción */
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [refreshingIds, setRefreshingIds] = useState<Set<number>>(new Set());
  const [refreshResult, setRefreshResult] = useState<RefreshResponse | null>(
    null,
  );
  const [refreshError, setRefreshError] = useState("");
  const [rowStatus, setRowStatus] = useState<Record<number, RefreshRow>>({});
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [policyOptions, setPolicyOptions] = useState<PolicyOption[]>([]);
  const [exporting, setExporting] = useState(false);

  const { data, total, totalPages, loading, fetchData } = useCertificates();

  const hasFilters = Object.values(applied).some((v) => v !== "");

  /* Carga inicial */
  useEffect(() => {
    fetchData(draftToFilters(initialDraft, 1));
    getPolicyOptions().then(setPolicyOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySearch = () => {
    setSelected(new Set());
    setApplied(draft);
    setPage(1);
    fetchData(draftToFilters(draft, 1));
  };

  const clearAll = () => {
    setSelected(new Set());
    setDraft(EMPTY);
    setApplied(EMPTY);
    setPage(1);
    fetchData({ page: 1, per_page: PER_PAGE });
  };

  const changePage = (next: number) => {
    setSelected(new Set());
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

  /* ── Selección y refresco desde producción ─────────── */
  const pageIds = data.map((c) => c.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selected.has(id));
  const isRefreshing = refreshingIds.size > 0;

  const toggleOne = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAllPage = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) =>
        allPageSelected ? next.delete(id) : next.add(id),
      );
      return next;
    });

  const runRefresh = async (ids: number[]) => {
    if (ids.length === 0 || isRefreshing) return;
    setRefreshingIds(new Set(ids));
    setRefreshError("");
    setRefreshResult(null);
    try {
      const result = await refreshCertificates(ids);
      setRefreshResult(result);
      setRowStatus((prev) => ({
        ...prev,
        ...Object.fromEntries(result.data.map((r) => [r.id, r])),
      }));
      setSelected(new Set());
      // Recarga la página actual con los datos ya actualizados en el DWH
      await fetchData(draftToFilters(applied, page));
    } catch {
      setRefreshError(
        "No fue posible refrescar desde producción. Intenta de nuevo.",
      );
    } finally {
      setRefreshingIds(new Set());
    }
  };

  return (
    <div className="app-page" style={st.container}>
      <PageHeader
        icon={<FileText size={20} />}
        title="Consulta de certificados"
        subtitle="Busca por consecutivo, guía, placa, póliza o factura"
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

      {/* ── Aviso: certificados sin factura ─────────────── */}
      {applied.is_invoiced === "false" && (
        <div style={st.infoBanner}>
          <Info size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <strong style={{ color: C.ink }}>Certificados sin factura.</strong>{" "}
            El ETL solo carga certificados nuevos: si la factura se emitió
            después, refresca desde producción para traerla.
          </div>
          <button
            style={st.btnPrimarySm}
            onClick={() => runRefresh(pageIds)}
            disabled={isRefreshing || pageIds.length === 0}
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "spin" : undefined}
            />{" "}
            Refrescar esta página
          </button>
        </div>
      )}

      {/* ── Resultado del refresco ─────────────────────── */}
      {refreshResult && (
        <RefreshSummary
          result={refreshResult}
          onClose={() => setRefreshResult(null)}
        />
      )}
      {refreshError && (
        <div style={st.errorBanner} role="alert">
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1 }}>{refreshError}</span>
          <button
            style={st.closeBtn}
            onClick={() => setRefreshError("")}
            aria-label="Cerrar"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Resultado + acciones de refresco ───────────── */}
      <div style={st.listBar}>
        <p style={st.badge}>
          {loading
            ? "Cargando..."
            : hasFilters
              ? `${total} registro${total !== 1 ? "s" : ""} encontrado${total !== 1 ? "s" : ""}`
              : "Últimos 20 registros"}
        </p>
        <div style={st.listActions}>
          {selected.size > 0 && (
            <>
              <span style={pill("primary")}>
                {selected.size} seleccionado{selected.size !== 1 ? "s" : ""}
              </span>
              <button style={st.btnLink} onClick={() => setSelected(new Set())}>
                Quitar selección
              </button>
            </>
          )}
          <button
            style={st.btnRefresh}
            disabled={
              isRefreshing ||
              loading ||
              (selected.size === 0 && pageIds.length === 0)
            }
            onClick={() =>
              runRefresh(selected.size > 0 ? [...selected] : pageIds)
            }
            title="Relee los certificados desde producción y actualiza el DWH, incluida la facturación"
          >
            <RefreshCw
              size={15}
              className={isRefreshing ? "spin" : undefined}
            />
            {isRefreshing
              ? "Refrescando..."
              : selected.size > 0
                ? "Refrescar selección"
                : "Refrescar página"}
          </button>
        </div>
      </div>

      {/* ── Tabla ──────────────────────────────────────── */}
      <div style={st.tableWrap}>
        <table style={st.table}>
          <thead>
            <tr style={st.thead}>
              <th style={{ ...st.th, width: 44 }}>
                <input
                  type="checkbox"
                  aria-label="Seleccionar todos los certificados de esta página"
                  checked={allPageSelected}
                  onChange={toggleAllPage}
                  disabled={pageIds.length === 0 || loading}
                  style={st.checkbox}
                />
              </th>
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
                "URL Factura",
                "Valor",
                "Descargar",
                "Enviar factura",
                "Refrescar",
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
                <td colSpan={15} style={st.noData}>
                  Cargando...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={15} style={st.noData}>
                  Sin resultados
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr
                  key={item.id}
                  style={selected.has(item.id) ? st.rowSelected : st.tableRow}
                >
                  <td style={st.td}>
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar certificado ${item.id}`}
                      checked={selected.has(item.id)}
                      onChange={() => toggleOne(item.id)}
                      style={st.checkbox}
                    />
                  </td>
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
                  <td style={st.td}>
                    {item.bill_url ? (
                      <a
                        href={item.bill_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={ui.link}
                      >
                        Ver factura
                      </a>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={st.td}>{item.billing_price ?? "—"}</td>
                  <td style={st.td}>
                    <button
                      style={st.btnAction}
                      onClick={() => {
                        const url = `${import.meta.env.VITE_API_CERTIFICATE_URL}/new_certificates/${btoa(String(item.id))}/download_view`;
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
                            if (!res) {
                              alert("❌ No se pudo reportar la factura");
                              return;
                            }
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
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={st.td}>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <button
                        style={st.btnIconRefresh}
                        onClick={() => runRefresh([item.id])}
                        disabled={isRefreshing}
                        title="Refrescar desde producción"
                        aria-label={`Refrescar certificado ${item.id} desde producción`}
                      >
                        <RefreshCw
                          size={14}
                          className={
                            refreshingIds.has(item.id) ? "spin" : undefined
                          }
                        />
                      </button>
                      {rowStatus[item.id] && (
                        <RowStatus row={rowStatus[item.id]} />
                      )}
                    </div>
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

/* ── Resultado del refresco ──────────────────────────── */
const FIELD_LABELS: Record<string, string> = {
  bill_url: "factura",
  factus_bill_consecutive: "consecutivo de factura",
  billing_price: "valor",
  deleted_at: "anulación",
};

function describeChanges(changed: string[]) {
  return changed.map((f) => FIELD_LABELS[f] ?? f).join(", ");
}

function RefreshSummary({
  result,
  onClose,
}: {
  result: RefreshResponse;
  onClose: () => void;
}) {
  const s = result.summary;
  const problems = s.not_found + s.not_in_dwh;
  const parts = [
    `${s.updated} certificado${s.updated !== 1 ? "s" : ""} refrescado${s.updated !== 1 ? "s" : ""} desde producción`,
    s.with_changes > 0
      ? `${s.with_changes} con cambios`
      : "sin cambios en facturación",
  ];
  if (s.invoiced_now > 0) {
    parts.push(
      `${s.invoiced_now} ahora ${s.invoiced_now !== 1 ? "tienen" : "tiene"} factura`,
    );
  }
  return (
    <div style={problems > 0 ? st.warnBanner : st.successBanner} role="status">
      {problems > 0 ? (
        <AlertTriangle size={18} style={{ flexShrink: 0 }} />
      ) : (
        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
      )}
      <div style={{ flex: 1 }}>
        <strong>{parts[0]}</strong>: {parts.slice(1).join(" · ")}.
        {s.not_found > 0 && ` ${s.not_found} no se encontró en producción.`}
        {s.not_in_dwh > 0 && ` ${s.not_in_dwh} no está en el DWH.`}
        {s.invoiced_now > 0 &&
          ' Los facturados pueden salir de la lista si filtras por "Sin factura".'}
      </div>
      <button style={st.closeBtn} onClick={onClose} aria-label="Cerrar">
        <X size={14} />
      </button>
    </div>
  );
}

function RowStatus({ row }: { row: RefreshRow }) {
  if (row.status !== "updated") {
    return (
      <span
        title={
          row.status === "not_found"
            ? "No se encontró en producción"
            : "No está en el DWH"
        }
        style={{ color: C.warning, display: "inline-flex" }}
      >
        <AlertTriangle size={15} />
      </span>
    );
  }
  const changed = row.changed.length > 0;
  return (
    <span
      title={
        changed
          ? `Actualizado: ${describeChanges(row.changed)}`
          : "Refrescado: sin cambios"
      }
      style={{ color: changed ? C.success : C.faint, display: "inline-flex" }}
    >
      <CheckCircle2 size={15} />
    </span>
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

  badge: { color: C.muted, fontSize: 13, fontWeight: 500, margin: 0 },

  listBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  listActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  btnRefresh: { ...ui.btnSoft, minHeight: 36, padding: "7px 14px" },
  btnPrimarySm: { ...ui.btnPrimary, minHeight: 36, padding: "7px 14px" },
  btnLink: {
    background: "none",
    border: "none",
    padding: "4px 6px",
    cursor: "pointer",
    color: C.muted,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
  },
  btnIconRefresh: {
    ...ui.btnIcon,
    width: 30,
    height: 30,
    minHeight: 30,
    borderRadius: 8,
    background: C.primaryTint,
    color: C.primaryStrong,
    border: `1px solid ${C.primaryTint2}`,
  },
  checkbox: {
    width: 16,
    height: 16,
    cursor: "pointer",
    accentColor: "#0087F6",
  },
  rowSelected: { backgroundColor: C.primaryTint },

  infoBanner: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
    padding: "12px 16px",
    marginBottom: 12,
    borderRadius: 12,
    background: C.primaryTint,
    border: `1px solid ${C.primaryTint2}`,
    color: C.text,
    fontSize: 13,
    lineHeight: 1.5,
  },
  successBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    marginBottom: 12,
    borderRadius: 12,
    background: C.successTint,
    border: `1px solid ${C.successBorder}`,
    color: C.success,
    fontSize: 13,
    lineHeight: 1.5,
  },
  warnBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    padding: "12px 16px",
    marginBottom: 12,
    borderRadius: 12,
    background: C.warningTint,
    border: `1px solid ${C.warningBorder}`,
    color: C.warning,
    fontSize: 13,
    lineHeight: 1.5,
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 14px",
    marginBottom: 12,
    borderRadius: 12,
    background: C.dangerTint,
    border: `1px solid ${C.dangerBorder}`,
    color: C.danger,
    fontSize: 13,
  },
  closeBtn: {
    background: "none",
    border: "none",
    padding: 4,
    cursor: "pointer",
    color: "inherit",
    display: "inline-flex",
    borderRadius: 6,
  },

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
