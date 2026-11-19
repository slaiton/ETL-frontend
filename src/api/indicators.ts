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
  policy_id?: string
): Promise<CertificatesResponse | null> {
  try {
    const params: Record<string, string> = {
      start_date,
      end_date,
      period,
    };

    if (policy_id) {
      params.policy_id = policy_id;
    }

    const response = await axiosClient.get<CertificatesResponse>(
      "/indicators/certificates",
      {
        params: params,
      }
    );

    return response.data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}
