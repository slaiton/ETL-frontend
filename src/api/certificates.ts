import {
 type Certificate,
} from "../models/certificates.model";

const URL = import.meta.env.VITE_API_BASE_URL;

const BASE_URL = URL + "/v1/certificates";

export async function getCertificates(
  start_date: string,
  end_date: string,
  is_invoiced: string
): Promise<Certificate[] | null> {
  try {
    const response = await fetch(
      `${BASE_URL}/get_all?start_date=${start_date}&end_date=${end_date}&is_invoiced=${is_invoiced}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener datos de certificados");
    }

    const data: Certificate[] = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}