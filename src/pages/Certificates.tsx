import { useEffect, useState } from "react";

interface Certificate {
    id: number;
    certificate: string;
    status: string;
}

export default function Certificates() {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);

    const [data, setData] = useState<Certificate[]>([]);
    const [filtered, setFiltered] = useState<Certificate[]>([]);

    useEffect(() => {
        // Simulación de datos: reemplaza con tu API
        const fakeData = Array.from({ length: 53 }, (_, i) => ({
            id: i + 1,
            certificate: `Certificado #${i + 1}`,
            status: i % 2 === 0 ? "Activo" : "Inactivo"
        }));

        setData(fakeData);
    }, []);

    useEffect(() => {
        const result = data.filter((item) =>
            item.certificate.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(result);
        setPage(1); // Reiniciar paginación al buscar
    }, [search, data]);

    // const start = (page - 1) * limit;
    // const paginated = filtered.slice(start, start + limit);

    const totalPages = Math.ceil(filtered.length / limit);

    return (
        <div style={styles.container}>

            {/* 🔍 Buscador */}
            <div style={styles.searchBox}>
                <input
                    type="text"
                    placeholder="Buscar certificados..."
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
                        <th>Estado</th>
                    </tr>
                </thead>
                {/* <tbody>
                    {paginated.map((item) => (
                        <tr
                            key={item.id}
                            style={styles.tableRow}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#26262e")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#1e1e24")}
                        >
                            <td style={styles.tableCell}>{item.id}</td>
                            <td style={styles.tableCell}>{item.certificate}</td>
                            <td style={styles.tableCell}>{item.status}</td>
                        </tr>
                    ))}
                </tbody> */}
            </table>

            <div style={styles.pagination}>
                <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                >
                    Anterior
                </button>

                <span style={styles.pageInfo}>
                    Página {page} de {totalPages}
                </span>

                <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                >
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
        width: "100%",
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
};