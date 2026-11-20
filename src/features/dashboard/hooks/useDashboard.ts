import { useEffect, useState } from "react";
import type { CertificatesResponse } from "../../../models/certificates.model";
import type { PolicyOption } from "../../../api/certificates";
import { getCertificates, getDashboardPolicies } from "../../../api/indicators";

const today = new Date().toISOString().split("T")[0];
const firstDayOfMonth = new Date();
firstDayOfMonth.setDate(1);
const defaultStart = firstDayOfMonth.toISOString().split("T")[0];

export const initialDashboardData: CertificatesResponse = {
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
  entities_general: { total_created: 0, total_sent: 0, total_signed: 0 },
  entities_period_created: [],
  entities_period_signed: [],
  period: [],
  policies: [],
  signatures_by_client: [],
};

export function useDashboard() {
  const [data, setData] = useState<CertificatesResponse>(initialDashboardData);
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(today);
  const [period, setPeriod] = useState("day");
  /** Pólizas seleccionadas en el filtro; vacío = todas las vigentes */
  const [policyIds, setPolicyIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [policies, setPolicies] = useState<PolicyOption[]>([]);

  /* Pólizas vigentes con facturación — opciones del filtro "Cliente" */
  useEffect(() => {
    getDashboardPolicies().then(setPolicies);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getCertificates(
        startDate,
        endDate,
        period,
        policyIds,
      );
      if (response) {
        setData({
          invoices: response.invoices ?? initialDashboardData.invoices,
          general: response.general ?? initialDashboardData.general,
          period: response.period ?? [],
          policies: response.policies ?? [],
          signatures_by_client: response.signatures_by_client ?? [],
          signatures_total: response.signatures_total ?? null,
          client: response.client ?? null,
          entities_general:
            response.entities_general ?? initialDashboardData.entities_general,
          entities_period_created: response.entities_period_created ?? [],
          entities_period_signed: response.entities_period_signed ?? [],
        });
      } else {
        setData(initialDashboardData);
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    period,
    setPeriod,
    policyIds,
    setPolicyIds,
    loading,
    fetchData,
    policies,
    policiesByCompany: data.policies,
  };
}
