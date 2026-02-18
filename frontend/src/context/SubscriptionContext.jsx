import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SubscriptionContext = createContext(null);
const API_BASE = "http://localhost:5000/api/company/subscription";

export function SubscriptionProvider({ children }) {
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [usage, setUsage] = useState(null);
  const [payments, setPayments] = useState([]);
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

  const fetchPayments = useCallback(async () => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/payments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to fetch payments");
    setPayments(data.data || []);
    return data.data || [];
  }, []);

  const refreshAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([fetchPlans(), fetchCurrent(), fetchPayments()]);
    } catch (err) {
      setError(err.message || "Failed to refresh subscription");
    } finally {
      setLoading(false);
    }
  }, [fetchCurrent, fetchPayments, fetchPlans]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const createCheckoutIntent = useCallback(async (payload) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/checkout-intent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to create checkout intent");
    return data.data;
  }, []);

  const confirmCheckout = useCallback(async (payload) => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to confirm payment");
    setCurrent(data.data || null);
    setEntitlements(data.entitlements || null);
    setUsage(data.usage || null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      plans,
      current,
      entitlements,
      usage,
      payments,
      loading,
      error,
      refreshAll,
      fetchCurrent,
      fetchPlans,
      fetchPayments,
      createCheckoutIntent,
      confirmCheckout,
    }),
    [
      plans,
      current,
      entitlements,
      usage,
      payments,
      loading,
      error,
      refreshAll,
      fetchCurrent,
      fetchPlans,
      fetchPayments,
      createCheckoutIntent,
      confirmCheckout,
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
