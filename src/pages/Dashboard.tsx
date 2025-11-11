import { useEffect, useState } from "react";

import type { CertificatesResponse } from "../models/certificates.model";

// import { getCertificates } from "../api/indicators";
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
import { getCertificates } from "../api/indicators";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

import type { ChartOptions } from "chart.js";


ChartJS.register(ArcElement, Tooltip, Legend);

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

  if (loading) return <p>Cargando...</p>;
  if (!data) return <p>Cargando...</p>;

    
  const labels = data.period.map((p) => p.period);
  const issuedArray = data.period.map((p) => p.issued);
  const cancelledArray = data.period.map((p) => p.cancelled);

  // Configuración del Pie Chart
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
    <div style={{ textAlign: "center" }}>
      <h1> Dashboard de Indicadores</h1>

      {/* Filtros */}
      <form
        onSubmit={handleFilter}
        style={{ marginTop: "20px", marginBottom: "20px", display: "flex", justifyContent: "center", gap: "20px" }}
      >
        <label>
          Fecha inicio:
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>

        <label>
          Fecha fin:
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>

        <label>
          Periodo:
          <select value={period} onChange={(e) => setPeriod(e.target.value)}>
            <option value="day">Día</option>
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </label>

        <button type="submit">Aplicar</button>
      </form>

      {/* Totales */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "60px",
          marginBottom: "20px",
        }}
      >
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#36A2EB" }}>
          Emitidos: {data.general.issued}
        </div>
        <div style={{ fontSize: "2rem", fontWeight: "bold", color: "#FF6384" }}>
          Cancelados: {data.general.cancelled}
        </div>
      </div>

      {/* Gráficos */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "500px", maxWidth: "700px" }}>
          <Pie data={pieData} options={pieOptions}  />
        </div>
        <div style={{ flex: 2, minWidth: "700px" }}>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
}