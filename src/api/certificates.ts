import { axiosClient } from "../shared/api/axiosClient";

export interface PolicyOption {
  policy_id: number;
  external_code: string;
  beneficiary_name: string | null;
  beneficiary_id?: number | null;
}

/* ── Refresco desde producción ─────────────────────────── */
export type RefreshStatus = "updated" | "not_found" | "not_in_dwh";

export interface RefreshRow {
  id: number;
  status: RefreshStatus;
  /** Campos de facturación que cambiaron: bill_url, factus_bill_consecutive, billing_price, deleted_at */
  changed: string[];
  invoiced_now?: boolean;
  bill_url?: string | null;
  factus_bill_consecutive?: string | null;
}

export interface RefreshResponse {
  summary: {
    requested: number;
    updated: number;
    with_changes: number;
    invoiced_now: number;
    not_found: number;
    not_in_dwh: number;
  };
  data: RefreshRow[];
}

/** Relee los certificados desde producción y actualiza el DWH (incluida la facturación). */
export async function refreshCertificates(ids: number[]): Promise<RefreshResponse> {
  const response = await axiosClient.post<RefreshResponse>("/certificates/refresh", { ids });
  return response.data;
}

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

export async function getPolicyOptions(): Promise<PolicyOption[]> {
  try {
    const response = await axiosClient.get("/policies/");
    return response.data?.data ?? [];
  } catch {
    return [];
  }
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
