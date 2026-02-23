import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SubscriptionContext = createContext(null);
const API_BASE = "http://localhost:5000/api/company/subscription";

export function SubscriptionProvider({ children }) {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getToken = () => localStorage.getItem("token");

  const fetchPlans = useCallback(async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/plans`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch plans");
    setPlans(data.data || []);
    return data.data || [];
  }, []);

  const fetchCurrent = useCallback(async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch subscription");
    setCurrent(data.data || null);
    setEntitlements(data.entitlements || null);
    setUsage(data.usage || null);
    return data;
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchPlans(), fetchCurrent()]);
    } catch (err) {
      setError(err.message || "Failed to refresh subscription");
    } finally {
      setLoading(false);
    }
  }, [fetchCurrent, fetchPlans]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const value = useMemo(
    () => ({
      plans,
      current,
      entitlements,
      usage,
      loading,
      error,
      refreshAll,
      fetchCurrent,
      fetchPlans,
    }),
    [
      plans,
      current,
      entitlements,
      usage,
      loading,
      error,
      refreshAll,
      fetchCurrent,
      fetchPlans,
    ]
  );

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used inside SubscriptionProvider");
  }
  return ctx;
};
