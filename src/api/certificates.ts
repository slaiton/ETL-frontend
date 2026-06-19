import { axiosClient } from "../shared/api/axiosClient";

export interface CertificateFilters {
  id?: number;
  certificate?: string;
  waybill?: string;
  factus_bill_consecutive?: string;
  start_date?: string;
  end_date?: string;
  is_invoiced?: boolean;
  customer_id?: number;
  policy_id?: number;
  plaque?: string;
  page?: number;
  per_page?: number;
}

export async function getCertificates(filters: CertificateFilters = {}): Promise<any> {
  const params: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(filters)) {
    if (v !== undefined && v !== "" && v !== null) params[k] = v;
  }
  try {
    const response = await axiosClient.get("/certificates/get_all", { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}
