import {
  UserCog,
  ShieldCheck,
  CreditCard,
  Lock,
  Settings,
  Save,
} from "lucide-react";
import { useState } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    autoApproveCompany: false,
    allowFreePlan: true,
    enableSubscriptions: true,
    twoFactorAuth: false,
    maintenanceMode: false,
  });

  const toggle = (key) =>
    setSettings({ ...settings, [key]: !settings[key] });

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
          <Settings className="h-5 w-5 text-indigo-600" />
        </div>
        <h1 className="text-xl sm:text-2xl font-semibold text-slate-800">
          Admin Settings
        </h1>
      </div>

      {/* Admin Profile */}
      <Section icon={UserCog} title="Admin Profile">
        <Input label="Admin Name" placeholder="Super Admin" />
        <Input label="Admin Email" placeholder="admin@system.com" />
      </Section>

      {/* Company Approval */}
      <Section icon={ShieldCheck} title="Company Approval Settings">
        <Toggle
          label="Auto approve new companies"
          checked={settings.autoApproveCompany}
          onChange={() => toggle("autoApproveCompany")}
        />
      </Section>

      {/* Subscription */}
      <Section icon={CreditCard} title="Subscription Settings">
        <Toggle
          label="Enable subscription system"
          checked={settings.enableSubscriptions}
          onChange={() => toggle("enableSubscriptions")}
        />
        <Toggle
          label="Allow free plan"
          checked={settings.allowFreePlan}
          onChange={() => toggle("allowFreePlan")}
        />
      </Section>

      {/* Security */}
      <Section icon={Lock} title="Security & Access">
        <Toggle
          label="Enable Two-Factor Authentication"
          checked={settings.twoFactorAuth}
          onChange={() => toggle("twoFactorAuth")}
        />
      </Section>

      {/* System */}
      <Section icon={Settings} title="System Controls">
        <Toggle
          label="Maintenance mode"
          checked={settings.maintenanceMode}
          onChange={() => toggle("maintenanceMode")}
        />
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}

/* ---------- Reusable Components ---------- */

function Section({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Input({ label, placeholder }) {
  return (
    <div>
      <label className="text-sm text-slate-600">{label}</label>
      <input
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-700">{label}</span>
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
