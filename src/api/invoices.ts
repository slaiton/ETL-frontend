const URL = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = URL + "/v1/invoices";

export async function reportInvoice(
  certificateId: number
): Promise<any | null> {
  try {
    const response = await fetch(`${BASE_URL}/reportar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: certificateId,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Error al reportar la factura");
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("❌ Error en reportInvoice:", error);
    return null;
  }
}