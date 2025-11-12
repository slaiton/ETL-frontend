import { useEffect, useState } from "react";
import { Pie, Bar } from "react-chartjs-2";
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
  const today = new Date().toISOString().split("T")[0];
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const defaultStart = oneMonthAgo.toISOString().split("T")[0];

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
          color: "#ffffff",
          font: { size: 14 },
        },
      },
      tooltip: {
        enabled: true,
        titleColor: "#fff",
        bodyColor: "#fff",
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
    plugins: {
      legend: {
        position: "top",
        labels: { color: "#fff" },
      },
      tooltip: {
        enabled: true,
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
      y: {
        ticks: { color: "#fff" },
        grid: { color: "rgba(255,255,255,0.2)" },
      },
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard de Indicadores</h1>

      {/* Filtros */}
      <form onSubmit={handleFilter} style={styles.form}>
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

        <button type="submit" style={styles.button}>
          Aplicar
        </button>
      </form>

      {/* Totales */}
      <div style={styles.totals}>
        <div style={{ ...styles.totalItem, color: "#36A2EB" }}>
          Emitidos: {data.general.issued}
        </div>
        <div style={{ ...styles.totalItem, color: "#FF6384" }}>
          Cancelados: {data.general.cancelled}
        </div>
      </div>

      {/* Gráficos */}
      <div style={styles.chartsContainer}>
        <div style={styles.chartBox}>
          <div style={styles.chartWrapper}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        <div style={styles.chartBox}>
          <div style={styles.chartWrapper}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    textAlign: "center",
    padding: "20px",
    maxWidth: "1200px",
    margin: "0 auto",
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
  chartsContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
  },
  chartBox: {
    flex: "1 1 350px",
    maxWidth: "600px",
    minWidth: "300px",
  },
  chartWrapper: {
    width: "100%",
    height: "400px",
  },
};