import type { CertificatesResponse } from "../models/certificates.model";
import { axiosClient } from "../shared/api/axiosClient";

export async function getCertificates(
  start_date: string,
  end_date: string,
  period: string,
  policy_id?: string
): Promise<CertificatesResponse | null> {
  try {
    const params: any = {
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
