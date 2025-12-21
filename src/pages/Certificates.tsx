import { useEffect, useState } from "react";
import type { Certificate } from "../models/certificates.model";
import { getCertificates } from "../api/certificates";
import { useSearchParams } from "react-router-dom";

import { reportInvoice } from '../api/invoices'

export default function Certificates() {

    const [searchParams, setSearchParams] = useSearchParams();
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    const formatDate = (d: Date) =>
        d.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const startDate =
        searchParams.get("startDate") || formatDate(firstDay);

    const endDate =
        searchParams.get("endDate") || formatDate(today);

    const invoice = searchParams.get("invoice") || true.toString();


    const [searchField, setSearchField] = useState("consecutive");

    const initialPage = Number(searchParams.get("page")) || 1;
    const initialSearch = searchParams.get("search") || "";
    const limit = Number(searchParams.get("limit")) || 20;

    const [search, setSearch] = useState(initialSearch);
    const [page, setPage] = useState(initialPage);
    const [data, setData] = useState<Certificate[]>([]);
    const [filtered, setFiltered] = useState<Certificate[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response: any = await getCertificates(startDate, endDate, invoice);
            setData(response["data"]);
        } catch (error) {
            console.error("Error cargando datos:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        const result = data.filter((item) =>
            item.consecutive?.toLowerCase().includes(search.toLowerCase())
        );
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
    }, [search, data]);

    // const start = (page - 1) * limit;
    // const paginated = filtered.slice(start, start + limit);

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

            {/* 🔍 Buscador */}
            <div style={styles.searchBox}>
                <select
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    style={styles.searchSelect}
                >
                    <option value="consecutive">Certificado</option>
                    <option value="factus_bill_consecutive">Factura</option>
                    {/* <option value="client">Cliente</option> */}
                </select>

                <input
                    type="text"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {/* 📄 Tabla */}
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Certificado</th>
                        <th>Factura</th>
                        <th>Waybill</th>
                        <th>Poliza</th>
                        <th>Inicio</th>
                        <th>Fin</th>
                        <th>Cliente</th>
                        <th>Factura</th>
                        <th>Valor</th>
                        <th>Certificado</th>
                        <th>Enviar factura</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        <tr>
                            <td colSpan={8} style={styles.noData}>Cargando...</td>
                        </tr>
                    ) : paginated.length === 0 ? (
                        <tr>
                            <td colSpan={8} style={styles.noData}>Sin resultados</td>
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
                                        <a
                                            href={item.bill_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: "#4da6ff" }}
                                        >
                                            Ver factura
                                        </a>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                                <td style={styles.tableCell}>{item.billing_price}</td>
                                <td>
                                    <button
                                        onClick={() => {
                                            const encodedId = btoa(String(item.id));
                                            const url = `https://cotizadorsura-backend.tecnologiafuncional.com/api/certificados/${encodedId}/download`;
                                            window.open(url, "_blank");
                                        }}
                                        className="btn btn-primary"
                                    >
                                        Descargar certificado
                                    </button>
                                </td>
                                <td>
                                    {!item.bill_url ? (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const response = await reportInvoice(item.id);

                                                    if (!response) {
                                                        alert("No se pudo reportar la factura");
                                                        return;
                                                    }

                                                    alert("✅ Factura reportada correctamente");
                                                    console.log("Respuesta API:", response);

                                                    // 👉 aquí puedes refrescar la lista
                                                    // await loadCertificates();

                                                } catch (error) {
                                                    console.error(error);
                                                    alert("❌ Error al reportar la factura");
                                                }
                                            }}
                                            className="btn btn-primary"
                                        >
                                            Enviar
                                        </button>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div style={styles.pagination}>
                <button disabled={page === 1} onClick={() => changePage(page - 1)}>
                    Anterior
                </button>

                <span style={styles.pageInfo}>
                    Página {page} de {totalPages}
                </span>

                <button disabled={page === totalPages} onClick={() => changePage(page + 1)}>
                    Siguiente
                </button>
            </div>

        </div>
    );
}

const styles = {
    container: {
        padding: "20px",
        fontFamily: "Inter, Arial, sans-serif",
        color: "#e4e4e7", // texto gris suave
    } as React.CSSProperties,

    searchBox: {
        marginBottom: "20px",
    } as React.CSSProperties,

    searchInput: {
        width: "70%",
        padding: "12px 14px",
        fontSize: "15px",
        borderRadius: "8px",
        backgroundColor: "#1e1e24",
        border: "1px solid #3f3f46",
        color: "#e4e4e7",
        outline: "none",
        transition: "border 0.2s",
    } as React.CSSProperties,

    table: {
        width: "100%",
        borderCollapse: "separate",
        borderSpacing: "0 6px", // separador entre filas
    } as React.CSSProperties,

    tableRow: {
        backgroundColor: "#1e1e24",
        transition: "background 0.2s",
    } as React.CSSProperties,

    tableRowHover: {
        backgroundColor: "#26262e",
    } as React.CSSProperties,

    tableCell: {
        textAlign: "center",
        padding: "14px",
        borderBottom: "1px solid #2a2a33",
    } as React.CSSProperties,

    tableHeader: {
        backgroundColor: "#2c2c34",
        color: "#c9c9d1",
        fontWeight: "600",
        textAlign: "left",
        padding: "12px",
        borderBottom: "2px solid #3a3a44",
    } as React.CSSProperties,

    noData: {
        textAlign: "center",
        padding: "20px",
        color: "#a1a1aa",
    } as React.CSSProperties,

    pagination: {
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        marginTop: "20px",
    } as React.CSSProperties,

    pageButton: {
        padding: "10px 16px",
        borderRadius: "8px",
        backgroundColor: "#2e2e36",
        border: "1px solid #3f3f46",
        color: "#e4e4e7",
        cursor: "pointer",
        transition: "background 0.2s, transform 0.2s",
    } as React.CSSProperties,

    pageButtonDisabled: {
        opacity: 0.4,
        cursor: "not-allowed",
    } as React.CSSProperties,

    pageInfo: {
        fontWeight: "500",
        color: "#c9c9d1",
        padding: "10px",
    } as React.CSSProperties,
    searchSelect: {
        width: "10%",
        padding: "8px",
        marginRight: "8px",
        borderRadius: "6px",
        border: "1px solid #ccc",
    } as React.CSSProperties,
};