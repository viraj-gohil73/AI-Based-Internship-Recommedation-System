import {
  UserCog,
  ShieldCheck,
  CreditCard,
  Lock,
  Settings,
  Save,
  Bell,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const defaultSettings = {
  autoApproveCompany: false,
  allowFreePlan: true,
  enableSubscriptions: true,
  twoFactorAuth: false,
  maintenanceMode: false,
  weeklySummary: false,
  approvalAlerts: false,
};

const defaultProfile = {
  name: "",
  email: "",
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [profile, setProfile] = useState(defaultProfile);
  const [initialProfile, setInitialProfile] = useState(defaultProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const toggle = (key) =>
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      setLoadingProfile(false);
      return;
    }

    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (!res.ok || data?.success === false) {
          throw new Error(data?.message || "Failed to load admin profile");
        }

        const nextProfile = {
          name: data?.data?.name || "",
          email: data?.data?.email || "",
        };

        setProfile(nextProfile);
        setInitialProfile(nextProfile);
      } catch (error) {
        toast.error(error.message || "Failed to load admin profile");
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, []);

  const onProfileChange = (key, value) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setProfile(initialProfile);
    setSettings(defaultSettings);
  };

  const handleSave = async () => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    const name = String(profile.name || "").trim();
    const email = String(profile.email || "").trim();

    if (!name || !email) {
      toast.error("Admin name and email are required");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Failed to update profile");
      }

      const updated = {
        name: data?.data?.name || name,
        email: data?.data?.email || email,
      };

      setProfile(updated);
      setInitialProfile(updated);

      const existingUser = (() => {
        try {
          const raw = localStorage.getItem("adminUser");
          return raw ? JSON.parse(raw) : {};
        } catch {
          return {};
        }
      })();

      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          ...existingUser,
          name: updated.name,
          email: updated.email,
        })
      );

      toast.success("Admin profile updated");
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-indigo-50 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Settings className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Admin Settings
              </h1>
              <p className="text-sm text-slate-600">
                Manage platform rules, approvals, subscriptions, and security.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
              System healthy
            </span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 text-indigo-700">
              Admin role
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="space-y-6">
          <Section icon={UserCog} title="Admin Profile" desc="Basic admin identity for system access.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Admin Name"
                placeholder="Super Admin"
                value={profile.name}
                onChange={(value) => onProfileChange("name", value)}
                disabled={loadingProfile || saving}
              />
              <Input
                label="Admin Email"
                placeholder="admin@system.com"
                icon={Mail}
                type="email"
                value={profile.email}
                onChange={(value) => onProfileChange("email", value)}
                disabled={loadingProfile || saving}
              />
            </div>
          </Section>

          {/* <Section icon={ShieldCheck} title="Company Approval" desc="Control verification behavior for new companies.">
            <Toggle
              label="Auto approve new companies"
              hint="Skip manual verification for trusted signups."
              checked={settings.autoApproveCompany}
              onChange={() => toggle("autoApproveCompany")}
            />
          </Section> */}

          <Section icon={CreditCard} title="Subscriptions" desc="Enable plans and control free access.">
            <Toggle
              label="Enable subscription system"
              hint="Allow paid plans and billing access."
              checked={settings.enableSubscriptions}
              onChange={() => toggle("enableSubscriptions")}
            />
            <Toggle
              label="Allow free plan"
              hint="Let companies stay on the free tier."
              checked={settings.allowFreePlan}
              onChange={() => toggle("allowFreePlan")}
            />
          </Section>
        </div>

        <div className="space-y-6">
          {/* <Section icon={Lock} title="Security & Access" desc="Harden admin and platform access.">
            <Toggle
              label="Enable Two-Factor Authentication"
              hint="Recommended for all admins."
              checked={settings.twoFactorAuth}
              onChange={() => toggle("twoFactorAuth")}
            />
          </Section> */}

          <Section icon={Bell} title="Notifications" desc="Control admin alerts and reports.">
            <Toggle
              label="Weekly summary email"
              hint="Receive weekly performance snapshots."
              checked={settings.weeklySummary}
              onChange={() => toggle("weeklySummary")}
            />
            <Toggle
              label="Approval alerts"
              hint="Get notified when new approvals arrive."
              checked={settings.approvalAlerts}
              onChange={() => toggle("approvalAlerts")}
            />
          </Section>

          <Section icon={Settings} title="System Controls" desc="Platform-wide switch for critical tasks.">
            <Toggle
              label="Maintenance mode"
              hint="Temporarily pause access for all users."
              checked={settings.maintenanceMode}
              onChange={() => toggle("maintenanceMode")}
            />
          </Section>
        </div>
      </div>

      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur sm:flex-row">
          <p className="text-sm text-slate-600">
            Changes will apply immediately after saving.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving || loadingProfile}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon: Icon, title, desc, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 space-y-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          {desc && <p className="text-sm text-slate-500">{desc}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, placeholder, icon: Icon, value, onChange, type = "text", disabled = false }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <div className="relative mt-1">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        )}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 ${
            Icon ? "pl-9" : ""
          }`}
        />
      </div>
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <p className="text-xs text-slate-500">{hint}</p>}
      </div>
      <button
        onClick={onChange}
        className={`w-11 h-6 rounded-full relative transition ${
          checked ? "bg-indigo-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "right-0.5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
