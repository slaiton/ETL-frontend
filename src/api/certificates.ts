import { axiosClient } from "../shared/api/axiosClient";

export async function getCertificates(
  start_date: string,
  end_date: string,
  is_invoiced: string,
  search?: string,
  search_field?: string,
  page?: number,
  limit?: number
): Promise<any> {
  try {
    const response = await axiosClient.get("/certificates/get_all", {
      params: {
        start_date,
        end_date,
        is_invoiced,
        ...(search ? { search, search_field } : {}),
        ...(page !== undefined ? { page } : {}),
        ...(limit !== undefined ? { limit } : {}),
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}
