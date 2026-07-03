import { useState, useCallback } from "react";
import { getReports, type ReportFilters } from "../../../api/reports";

interface ReportsState {
  data: any[];
  total: number;
  totalPages: number;
  loading: boolean;
}

export function useReports() {
  const [state, setState] = useState<ReportsState>({
    data: [],
    total: 0,
    totalPages: 1,
    loading: false,
  });

  const fetchData = useCallback(async (filters: ReportFilters) => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const raw = await getReports(filters);

      setState({
        data: raw?.data ?? [],
        total: raw?.total ?? 0,
        totalPages: raw?.total_pages ?? 1,
        loading: false,
      });
    } catch {
      setState({
        data: [],
        total: 0,
        totalPages: 1,
        loading: false,
      });
    }
  }, []);

  return {
    ...state,
    fetchData,
  };
}