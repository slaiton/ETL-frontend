import type { CertificatesResponse } from "../models/certificates.model";
import { axiosClient } from "../shared/api/axiosClient";
import type { PolicyOption } from "./certificates";

/** Pólizas vigentes con need_billing_process = true (filtro del dashboard). */
export async function getDashboardPolicies(): Promise<PolicyOption[]> {
  try {
    const response = await axiosClient.get("/indicators/policies");
    return response.data?.data ?? [];
  } catch (error) {
    console.error("❌ Error en getDashboardPolicies:", error);
    return [];
  }
}

export async function getCertificates(
  start_date: string,
  end_date: string,
  period: string,
  policyIds: number[] = []
): Promise<CertificatesResponse | null> {
  try {
    const params: Record<string, string | number[]> = {
      start_date,
      end_date,
      period,
    };

    // Sin pólizas = todas las vigentes con facturación
    if (policyIds.length > 0) {
      params.policy_ids = policyIds;
    }

    const response = await axiosClient.get<CertificatesResponse>(
      "/indicators/certificates",
      {
        params,
        // FastAPI espera ?policy_ids=1&policy_ids=2 (sin corchetes)
        paramsSerializer: { indexes: null },
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}
