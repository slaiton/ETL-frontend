import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import type { CertificatesResponse } from "../models/certificates.model";
import { getCertificates } from "../api/indicators";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const defaultStart = firstDayOfMonth.toISOString().split("T")[0];

  const [data, setData] = useState<CertificatesResponse | null>(null);
  const [startDate, setStartDate] = useState(defaultStart);
  const [period, setPeriod] = useState("day");
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCertificates(startDate, endDate, period);
      setData(response);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  if (loading || !data) return <p style={{ textAlign: "center" }}>Cargando...</p>;

  const labels = data.period.map((p) => p.period);
  const issuedArray = data.period.map((p) => p.issued);
  const cancelledArray = data.period.map((p) => p.cancelled);

  const pieData = {
    labels: ["Emitidos", "Cancelados"],
    datasets: [
      {
        label: "Certificados",
        data: [data.general.issued, data.general.cancelled],
        backgroundColor: ["#36A2EB", "#FF6384"],
      },
    ],
  };

  const pieOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  const barData = {
    labels,
    datasets: [
      {
        label: "Emitidos",
        data: issuedArray,
        backgroundColor: "#36A2EB",
      },
      {
        label: "Cancelados",
        data: cancelledArray,
        backgroundColor: "#FF6384",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,

    scales: {
      x: {
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y: {
        grid: { color: "rgba(255,255,255,0.2)" },
      },
    },
  };

  const gridLayout: React.CSSProperties = {
    display: "grid",
    width: "100%",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "20px",
    marginTop: "20px",
    boxSizing: "border-box",
  };

  /* Función para declarar tamaño de 1–12 columnas */
  const gridItem = (cols: number): React.CSSProperties => ({
    gridColumn: `span ${cols}`,
  });

  /* Card para gráficos */
  const chartCard: React.CSSProperties = {
    background: "#1e1e1e",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  };

  const toolbarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "20px",
    background: "#1f2937",
    padding: "12px 20px",
    borderRadius: "10px",
    marginBottom: "20px",
    color: "white",
  };

  return (
    <div style={styles.container}>

      {/* Filtros */}
      <form onSubmit={handleFilter} style={toolbarStyle}>
        <div style={styles.formRow}>

          <label style={styles.label}>
            Fecha inicio:
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Fecha fin:
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Periodo:
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={styles.select}
            >
              <option value="day">Día</option>
              <option value="week">Semana</option>
              <option value="month">Mes</option>
            </select>
          </label>

          <label style={styles.label}>
            Cliente:
            <select
              value={"2"}
              disabled
              style={styles.select}
              name="vigia"
            >
              <option value="2">Vigía</option>
            </select>
          </label>

          <button type="submit" style={styles.button}>
            Aplicar
          </button>
        </div>

      </form>


      <div style={gridLayout} className="grid-responsive">

        {/* Card Totales */}
        <div style={{ ...gridItem(3), ...baseCardStyle, color: "#36eb6cff" }}>
          <div style={styles.cardTitle}>Certificados</div>
          <div style={{ ...styles.cardNumber, color: "#36eb6cff" }}>
            {data.general.issued + data.general.cancelled}
          </div>
        </div>

        <div style={{ ...gridItem(3), ...baseCardStyle, color: "#36A2EB" }}>
          <div style={styles.cardTitle}>Emitidos</div>
          <div style={{ ...styles.cardNumber, color: "#36A2EB" }}>
            {data.general.issued}
          </div>
        </div>

        <div style={{ ...gridItem(3), ...baseCardStyle, color: "#FF6384" }}>
          <div style={styles.cardTitle}>Cancelados</div>
          <div style={{ ...styles.cardNumber, color: "#FF6384" }}>
            {data.general.cancelled}
          </div>
        </div>

        <div style={{ ...gridItem(3), ...baseCardStyle, color: "#cab70dff" }} onClick={() => navigate("/certificates?invoice=false")}>
          <div style={styles.cardTitle}>Sin Factura</div>
          <div style={{ ...styles.cardNumber, color: "#cab70dff" }}>
            {data.general.no_invoice}
          </div>
        </div>

        {/* PIE CHART (4 columnas) */}
        <div style={{ ...gridItem(4), ...chartCard }}>
          <div style={styles.chartWrapper}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* BAR CHART (8 columnas) */}
        <div style={{ ...gridItem(4), ...chartCard }}>
          <div style={styles.chartWrapper}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

    </div>
  );
}


const baseCardStyle: React.CSSProperties = {
  background: "#1e1e1e",
  borderRadius: "14px",
  padding: "20px",
  color: "white",
  boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
  fontWeight: 500,
};


const styles: Record<string, React.CSSProperties> = {

  cardTitle: {
    fontSize: "1rem",
    fontWeight: 600,
    textAlign: "center",
    opacity: 0.8,
    marginBottom: "8px",
  },
  cardNumber: {
    fontSize: "2.6rem",
    fontWeight: 800,
    textAlign: "center",
    lineHeight: "1",
    marginTop: "4px",
  },
  chartWrapper: {
    width: "100%",
    minHeight: window.innerWidth < 768 ? "300px" : "400px",
    padding: window.innerWidth < 768 ? "5px" : "10px",
    boxSizing: "border-box",
  },

  container: {
    textAlign: "center",
    padding: "20px",
    maxWidth: "100%",
    margin: "0 auto",
    minHeight: "100dvh",
    overflowY: "auto",
    boxSizing: "border-box",
  },
  title: {
    fontSize: "2rem",
    marginBottom: "10px",
  },
  form: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
  },

  formRow: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    color: "#fff",
  },
  input: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  select: {
    padding: "5px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    backgroundColor: "#36A2EB",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    padding: "8px 16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  totals: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "20px",
  },
  totalItem: {
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  chartBox: {
    flex: "1 1 350px",
    maxWidth: "600px",
    minWidth: "100px",
  }
};