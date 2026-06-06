import { axiosClient } from "../shared/api/axiosClient";

export async function reportInvoice(certificateId: number): Promise<any> {
  try {
    const response = await axiosClient.post("/invoices/reportar", {
      id: certificateId,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error en reportInvoice:", error);
    return null;
  }
}
