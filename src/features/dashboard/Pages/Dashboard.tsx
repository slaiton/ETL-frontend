import { useEffect, useState } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import { useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  type ChartOptions,
} from "chart.js";
import {
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import type { CertificatesResponse } from "../../../models/certificates.model";
import { getCertificates } from "../../../api/indicators";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Filler
);



export default function Dashboard() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const defaultStart = firstDayOfMonth.toISOString().split("T")[0];

  const initialData: CertificatesResponse = {
    invoices: {
      issued: 0,
      cancelled: 0,
      no_invoice: 0,
      total_billing: 0,
      start_date: "",
      end_date: "",
      customer_id: null,
    },
    general: {
      issued: 0,
      cancelled: 0,
      no_invoice: 0,
      total_billing: 0,
      start_date: "",
      end_date: "",
      customer_id: null,
    },
    entities_general: {
      total_created: 0,
      total_sent: 0,
      total_signed: 0,
    },
    entities_period_created: [],
    entities_period_signed: [],
    period: [],
  };

  const [data, setData] = useState<CertificatesResponse>(initialData);

  const [startDate, setStartDate] = useState(defaultStart);
  const [period, setPeriod] = useState("day");
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [policy_id, setPolicy] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCertificates(startDate, endDate, period, policy_id);
      if (response) {
        setData({
          invoices: response.invoices ?? initialData.invoices,
          general: response.general ?? initialData.general,
          period: response.period ?? [],
          entities_general:
            response.entities_general ?? initialData.entities_general,

          entities_period_created:
            response.entities_period_created ??
            initialData.entities_period_created,

          entities_period_signed:
            response.entities_period_signed ??
            initialData.entities_period_signed,
        });
      } else {
        setData(initialData);
      }
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

  if (loading) return <p style={{ textAlign: "center" }}>Cargando...</p>;


  const labels = data?.period?.map((p) => p.period);
  const issuedArray = data?.period?.map((p) => p.issued);
  const cancelledArray = data?.period?.map((p) => p.cancelled);

  const entitiesCreatedLabels =
    data?.entities_period_created?.map((e) => e.date) || [];

  const entitiesCreatedData =
    data?.entities_period_created?.map((e) => e.total) || [];

  const entitiesSignedData =
    entitiesCreatedLabels.map((date) => {
      const found = data?.entities_period_signed?.find(
        (s) => s.date === date
      );

      return found ? found.total : 0;
    });



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

  const doughnutOptions: ChartOptions<"doughnut"> =
    pieOptions as ChartOptions<"doughnut">;

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
    background: "rgba(15,23,42,0.92)",
    borderRadius: "22px",
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
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

  const entitiesLineData = {
    labels: entitiesCreatedLabels,
    datasets: [
      {
        label: "Teceros Creados",
        data: entitiesCreatedData,
        borderColor: "#3B82F6",
        backgroundColor: "rgba(59,130,246,0.15)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Terceros Firmados",
        data: entitiesSignedData,
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.15)",
        tension: 0.4,
        fill: true,
      },
    ],
  };


  const entitiesPieData = {
    labels: ["Firmadas", "Pendientes"],
    datasets: [
      {
        data: [
          data.entities_general.total_signed,
          data.entities_general.total_created -
          data.entities_general.total_signed,
        ],
        backgroundColor: ["#10B981", "#374151"],
        borderWidth: 0,
      },
    ],
  };


  const modernChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#fff",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#9CA3AF" },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
      y: {
        ticks: { color: "#9CA3AF" },
        grid: {
          color: "rgba(255,255,255,0.05)",
        },
      },
    },
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
              value={policy_id}
              onChange={(e) => setPolicy(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos</option>
              <option value="5">Vigía2</option>
              <option value="2">Vigía</option>
              <option value="3">TDH</option>
            </select>
          </label>

          <button type="submit" style={styles.button}>
            Aplicar
          </button>
        </div>

      </form>


      <div style={gridLayout} className="grid-responsive">

        {/* Card Totales */}
        <div
          style={{
            ...gridItem(2),
            ...baseCardStyle,
            ...getCardAccent("#36eb6cff"),
          }}
        >
          <div style={styles.cardTitle}>Certificados</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#36eb6cff",
            }}
          >
            {data.general.issued + data.general.cancelled}
          </div>
        </div>

        <div
          style={{
            ...gridItem(2),
            ...baseCardStyle,
            ...getCardAccent("#36A2EB"),
          }}
        >
          <div style={styles.cardTitle}>Emitidos</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#36A2EB",
            }}
          >
            {data.general.issued}
          </div>
        </div>


        <div
          style={{
            ...gridItem(2),
            ...baseCardStyle,
            ...getCardAccent("#FF6384"),
          }}
        >
          <div style={styles.cardTitle}>Cancelados</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#FF6384",
            }}
          >
            {data.general.cancelled}
          </div>
        </div>

        <div
          style={{
            ...gridItem(2),
            ...baseCardStyle,
            ...getCardAccent("#cab70dff"),
          }}
          onClick={() => navigate("/certificates?invoice=false")}
        >
          <div style={styles.cardTitle}>Sin Factura</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#cab70dff",
            }}
          >
            {data.general.no_invoice}
          </div>
        </div>


        <div
          style={{
            ...gridItem(3),
            ...baseCardStyle,
            ...getCardAccent("#4ada12ff"),
          }}
        >
          <div style={styles.cardTitle}>Total Certificados</div>
          <div style={{ ...styles.cardNumber, color: "#4ada12ff" }}>
            {Number(data?.general?.total_billing ?? 0).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>


        <div
          style={{
            ...gridItem(3),
            ...baseCardStyle,
            ...getCardAccent("#1d4ed8"),
          }}
        >
          <div style={styles.cardTitle}>Nuevos Terceros</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#1d4ed8",
            }}
          >
            {data.entities_general.total_created}
          </div>
        </div>

        <div
          style={{
            ...gridItem(3),
            ...baseCardStyle,
            ...getCardAccent("#10B981"),
          }}
        >
          <div style={styles.cardTitle}>Terceros Firmados</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#10B981",
            }}
          >
            {data.entities_general.total_signed}
          </div>
        </div>

        <div
          style={{
            ...gridItem(3),
            ...baseCardStyle,
            ...getCardAccent("#7c3aed"),
          }}
        >
          <div style={styles.cardTitle}>Terceros Notificados</div>

          <div
            style={{
              ...styles.cardNumber,
              color: "#7c3aed",
            }}
          >
            {data.entities_general.total_sent}
          </div>
        </div>



        <div
          style={{
            ...gridItem(3),
            ...baseCardStyle,
            ...getCardAccent("#1247daff"),
          }}
        >
          <div style={styles.cardTitle}>Total Facturas</div>
          <div style={{ ...styles.cardNumber, color: "#1247daff" }}>
            {Number(data?.invoices?.total_billing ?? 0).toLocaleString("es-CO", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>



        {/* PIE CHART (4 columnas) */}
        <div style={{ ...gridItem(4), ...chartCard }}>
          <div style={styles.chartWrapper}>
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* BAR CHART (8 columnas) */}
        <div style={{ ...gridItem(8), ...chartCard }}>
          <div style={styles.chartWrapper}>
            <Bar data={barData} options={barOptions} />
          </div>
        </div>





        {/* LINE CHART ENTITIES */}
        <div style={{ ...gridItem(8), ...chartCard }}>
          <h3 style={styles.chartTitle}>
            Tendencia de Firmas
          </h3>

          <div style={styles.chartWrapper}>
            <Line
              data={entitiesLineData}
              options={modernChartOptions}
            />
          </div>
        </div>

        {/* DOUGHNUT */}
        <div style={{ ...gridItem(4), ...chartCard }}>
          <h3 style={styles.chartTitle}>
            Estado de Firma
          </h3>

          <div style={styles.chartWrapper}>
            <Doughnut
              data={entitiesPieData}
              options={doughnutOptions}
            />
          </div>
        </div>

      </div>

    </div>
  );
}


const baseCardStyle: React.CSSProperties = {
  background: "rgba(30,41,59,0.92)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "20px",
  padding: "22px",
  color: "white",
  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
  backdropFilter: "blur(10px)",
  transition: "all .25s ease",
  position: "relative",
  overflow: "hidden",
  cursor: "default",
};

const getCardAccent = (color: string): React.CSSProperties => ({
  borderLeft: `4px solid ${color}`,
});


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
    maxWidth: "100%",
    margin: "0 auto",
    minHeight: "100dvh",
    overflowY: "auto",
    boxSizing: "border-box",
    padding: "24px",
    background:
      "linear-gradient(180deg,#0f172a 0%, #111827 100%)",
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