import { useEffect, useState } from "react";
import type { Certificate } from "../../../models/certificates.model";
import { useSearchParams } from "react-router-dom";
import { reportInvoice } from "../../../api/invoices";
import { useCertificates } from "../hooks/useCertificates";

const formatDate = (d: Date) => d.toISOString().split("T")[0];

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

  const invoice = searchParams.get("invoice") || true.toString();
  const initialPage = Number(searchParams.get("page")) || 1;
  const initialSearch = searchParams.get("search") || "";
  const limit = Number(searchParams.get("limit")) || 20;

  const [searchField, setSearchField] = useState("consecutive");
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(initialPage);
  const [filtered, setFiltered] = useState<Certificate[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const { data, loading, fetchData } = useCertificates();

  useEffect(() => {
    fetchData(startDate, endDate, invoice);
  // fetchData es estable (useCallback con [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, invoice, fetchData]);

  useEffect(() => {
    const result = data.filter((item) => {
      const value = item[searchField as keyof Certificate];
      if (!value) return false;
      return String(value).toLowerCase().includes(search.toLowerCase());
    });
    setFiltered(result);
    setPage(1);
    setSearchParams({
      page: "1",
      search,
      limit: limit.toString(),
      startDate,
      endDate,
      invoice,
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, data]);

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);
  const totalPages = Math.ceil(filtered.length / limit);

  const changePage = (newPage: number) => {
    setPage(newPage);
    setSearchParams({
      page: newPage.toString(),
      search,
      limit: limit.toString(),
      startDate,
      endDate,
      invoice,
    });
  };

  return (
    <div style={styles.container}>

      {/* Buscador */}
      <div style={styles.searchContainer}>
        <div style={styles.searchGroup}>
          <select
            value={searchField}
            onChange={(e) => setSearchField(e.target.value)}
            style={styles.select}
          >
            <option value="id">Código</option>
            <option value="consecutive">Certificado</option>
            <option value="factus_bill_consecutive">Factura</option>
          </select>
          <input
            type="text"
            placeholder={`Buscar por ${searchField}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.dateGroup}>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
              setSearchParams({ page: "1", search, limit: limit.toString(), startDate: e.target.value, endDate, invoice });
            }}
            style={styles.dateInput}
          />
          <span style={styles.dateSeparator}>→</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
              setSearchParams({ page: "1", search, limit: limit.toString(), startDate, endDate: e.target.value, invoice });
            }}
            style={styles.dateInput}
          />
        </div>
      </div>

      {/* Tabla */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Certificado</th>
            <th>Factura</th>
            <th>Waybill</th>
            <th>Póliza</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Cliente</th>
            <th>Factura URL</th>
            <th>Valor</th>
            <th>Certificado</th>
            <th>Enviar factura</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={12} style={styles.noData}>Cargando...</td>
            </tr>
          ) : paginated.length === 0 ? (
            <tr>
              <td colSpan={12} style={styles.noData}>Sin resultados</td>
            </tr>
          ) : (
            paginated.map((item) => (
              <tr key={item.id} style={styles.tableRow}>
                <td style={styles.tableCell}>{item.id}</td>
                <td style={styles.tableCell}>{item.consecutive}</td>
                <td style={styles.tableCell}>{item.factus_bill_consecutive}</td>
                <td style={styles.tableCell}>{item.waybill}</td>
                <td style={styles.tableCell}>{item.policy_id}</td>
                <td style={styles.tableCell}>
                  {item.start_at ? item.start_at.split("T")[0] : "—"}
                </td>
                <td style={styles.tableCell}>
                  {item.end_at ? item.end_at.split("T")[0] : "—"}
                </td>
                <td style={styles.tableCell}>{item.customer_id ?? "—"}</td>
                <td style={styles.tableCell}>
                  {item.bill_url ? (
                    <a href={item.bill_url} target="_blank" rel="noopener noreferrer" style={{ color: "#4da6ff" }}>
                      Ver factura
                    </a>
                  ) : "—"}
                </td>
                <td style={styles.tableCell}>{item.billing_price}</td>
                <td>
                  <button
                    onClick={() => {
                      const encodedId = btoa(String(item.id));
                      const url = `${import.meta.env.VITE_API_BASE_URL}/new_certificates/${encodedId}/download_view`;
                      window.open(url, "_blank");
                    }}
                    className="btn btn-primary"
                  >
                    Descargar
                  </button>
                </td>
                <td>
                  {!item.bill_url ? (
                    <button
                      className="btn btn-primary"
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
                      {loadingId === item.id ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" />Enviando...</>
                      ) : "Enviar"}
                    </button>
                  ) : "—"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Paginación */}
      <div style={styles.pagination}>
        <button disabled={page === 1} onClick={() => changePage(page - 1)}>Anterior</button>
        <span style={styles.pageInfo}>Página {page} de {totalPages || 1}</span>
        <button disabled={page >= totalPages} onClick={() => changePage(page + 1)}>Siguiente</button>
      </div>

    </div>
  );
}

const styles = {
  container: { padding: "20px", fontFamily: "Inter, Arial, sans-serif", color: "#e4e4e7" } as React.CSSProperties,

  searchContainer: {
    display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center",
    justifyContent: "space-between", marginBottom: "20px",
    background: "#18181b", padding: "12px", borderRadius: "12px", border: "1px solid #2a2a33",
  } as React.CSSProperties,

  searchGroup: {
    display: "flex", alignItems: "center",
    background: "#1e1e24", borderRadius: "10px", border: "1px solid #3f3f46", overflow: "hidden",
  } as React.CSSProperties,

  select: {
    background: "transparent", border: "none", color: "#a1a1aa",
    padding: "10px", outline: "none", borderRight: "1px solid #3f3f46", cursor: "pointer",
  } as React.CSSProperties,

  input: {
    background: "transparent", border: "none", padding: "10px 12px",
    color: "#e4e4e7", outline: "none", minWidth: "220px",
  } as React.CSSProperties,

  dateGroup: {
    display: "flex", alignItems: "center", gap: "8px",
    background: "#1e1e24", padding: "6px 10px", borderRadius: "10px", border: "1px solid #3f3f46",
  } as React.CSSProperties,

  dateInput: { background: "transparent", border: "none", color: "#e4e4e7", outline: "none" } as React.CSSProperties,

  dateSeparator: { color: "#71717a", fontSize: "14px" } as React.CSSProperties,

  table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" } as React.CSSProperties,

  tableRow: { backgroundColor: "#1e1e24", transition: "background 0.2s" } as React.CSSProperties,

  tableCell: { textAlign: "center", padding: "14px", borderBottom: "1px solid #2a2a33" } as React.CSSProperties,

  noData: { textAlign: "center", padding: "20px", color: "#a1a1aa" } as React.CSSProperties,

  pagination: { display: "flex", justifyContent: "center", gap: "12px", marginTop: "20px" } as React.CSSProperties,

  pageInfo: { fontWeight: "500", color: "#c9c9d1", padding: "10px" } as React.CSSProperties,
};
