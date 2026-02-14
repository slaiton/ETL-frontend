import {
  type Certificate,
} from "../models/certificates.model";

import { axiosClient } from "../shared/api/axiosClient";

export async function getCertificates(
  start_date: string,
  end_date: string,
  is_invoiced: string
): Promise<Certificate[] | null> {
  try {

    const response = await axiosClient.get<Certificate[]>(
      "/certificates/get_all",
      {
        params: {
          start_date,
          end_date,
          is_invoiced,
        },
      }
    );

    return response.data;

  } catch (error) {
    console.error("❌ Error en getCertificates:", error);
    return null;
  }
}