import { useState, useEffect, useCallback, useRef } from "react";

/**
 * Llama a fetchFn en el mount y luego cada `intervalSeconds` segundos.
 * Expone countdown (segundos restantes), lastUpdated y un refresh manual.
 */
export function useAutoRefresh(fetchFn: () => Promise<void>, intervalSeconds = 60) {
  const [countdown, setCountdown] = useState(intervalSeconds);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Ref para evitar closures stale y doble-ejecución concurrente
  const isRefreshingRef = useRef(false);
  const fetchRef = useRef(fetchFn);
  useEffect(() => { fetchRef.current = fetchFn; }); // se actualiza en cada render

  const doRefresh = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsRefreshing(true);
    try {
      await fetchRef.current();
      setLastUpdated(new Date());
      setCountdown(intervalSeconds);
    } finally {
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [intervalSeconds]);

  // Fetch inicial al montar
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { doRefresh(); }, []);

  // Countdown tick + auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          doRefresh();
          return intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [doRefresh, intervalSeconds]);

  return { countdown, lastUpdated, isRefreshing, manualRefresh: doRefresh };
}
