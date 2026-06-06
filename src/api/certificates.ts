import { axiosClient } from "../shared/api/axiosClient";

// La API devuelve { data: Certificate[] } — se tipea como any para reflejar la realidad
export async function getCertificates(
  start_date: string,
  end_date: string,
  is_invoiced: string
): Promise<any> {
  try {
    const response = await axiosClient.get("/certificates/get_all", {
      params: { start_date, end_date, is_invoiced },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}
