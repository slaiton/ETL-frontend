import { useState, useCallback } from "react";
import type { Certificate } from "../../../models/certificates.model";
import { getCertificates, type CertificateFilters } from "../../../api/certificates";

interface CertificatesState {
  data: Certificate[];
  total: number;
  totalPages: number;
  loading: boolean;
}

export function useCertificates() {
  const [state, setState] = useState<CertificatesState>({
    data: [],
    total: 0,
    totalPages: 1,
    loading: false,
  });

  const fetchData = useCallback(async (filters: CertificateFilters) => {
    setState((prev) => ({ ...prev, loading: true }));
    try {
      const raw = await getCertificates(filters);
      setState({
        data: raw?.data ?? [],
        total: raw?.total ?? 0,
        totalPages: raw?.total_pages ?? 1,
        loading: false,
      });
    } catch {
      setState({ data: [], total: 0, totalPages: 1, loading: false });
    }
  }, []);

  return { ...state, fetchData };
}
