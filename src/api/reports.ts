import { axiosClient } from "../shared/api/axiosClient";

export interface ReportFilters {
  id?: number;
  start_date?: string;
  end_date?: string;
  policy_id?: number;
  page?: number;
  per_page?: number;
}

export async function getReports(filters: ReportFilters = {}): Promise<any> {
  const params: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "" && value !== null) {
      params[key] = value;
    }
  }

  try {
    const response = await axiosClient.get("/certificates/report", {
      params,
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener el reporte:", error);
    return null;
  }
}