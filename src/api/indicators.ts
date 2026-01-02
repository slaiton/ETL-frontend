import {
 type CertificatesResponse,
} from "../models/certificates.model";

const URL = import.meta.env.VITE_API_BASE_URL;

const BASE_URL = URL + "/v1/indicators";

export async function getCertificates(
  start_date: string,
  end_date: string,
  period: string,
  policy_id: string
): Promise<CertificatesResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/certificates?start_date=${start_date}&end_date=${end_date}&period=${period}&policy_id=${policy_id}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener datos de certificados");
    }

    const data: CertificatesResponse = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}