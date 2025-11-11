import {
 type CertificatesResponse,
} from "../models/certificates.model";

const BASE_URL = "http://127.0.0.1:8000/v1/indicators";

export async function getCertificates(
  start_date: string,
  end_date: string,
  period: string
): Promise<CertificatesResponse | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/certificates?start_date=${start_date}&end_date=${end_date}&period=${period}`
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