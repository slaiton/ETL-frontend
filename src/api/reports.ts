import { axiosClient } from "../shared/api/axiosClient";

export interface ReportFilters {
  id?: number;
  start_date?: string;
  end_date?: string;
  policy_id?: number;
  page?: number;
  per_page?: number;
}

export async function getReports(
  filters: ReportFilters = {}
): Promise<any> {
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
    return null;
  }
}

let cancelDownload = false;
export function wasDownloadCancelled() {
  return cancelDownload;
}

export function cancelReportDownload() {
  cancelDownload = true;
}

export async function downloadReport(
  filters: ReportFilters
): Promise<any[]> {

  cancelDownload = false;

  let allData: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    if (cancelDownload) {
      console.log("Descarga cancelada por el usuario.");
      break;
    }

    console.log("Consultando página:", page);

    const response = await getReports({
      ...filters,
      page,
      per_page: 100,
    });

    if (!response) {
      console.log("No hubo respuesta");
      break;
    }

    allData = [...allData, ...(response.data ?? [])];

    totalPages = response.total_pages ?? 1;

    page++;

  } while (page <= totalPages);

  console.log("Total registros:", allData.length);

    if (cancelDownload) {
      cancelDownload = false;
      return [];
    }

    return allData;
  }