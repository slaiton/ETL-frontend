import { useState, useCallback } from "react";
import type { Certificate } from "../../../models/certificates.model";
import { getCertificates } from "../../../api/certificates";

export function useCertificates() {
  const [data, setData] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (
      startDate: string,
      endDate: string,
      invoice: string,
      search?: string,
      searchField?: string,
      page?: number,
      limit?: number
    ) => {
      try {
        setLoading(true);
        const raw = await getCertificates(startDate, endDate, invoice, search, searchField, page, limit);
        setData(raw?.data ?? []);
      } catch (error) {
        console.error("Error cargando certificados:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { data, loading, fetchData };
}
