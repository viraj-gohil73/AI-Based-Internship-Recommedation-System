import { useState } from "react";
import StudentLayout from "../../layout/StudentLayout";
import {
  Lock,
  Bell,
  Shield,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("security");

  return (
    <StudentLayout title="Settings">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-8">

        {/* ================= TABS ================= */}
        <div className="border-b mb-8">
          <nav className="flex gap-6 sm:gap-8 overflow-x-auto">
            <TabButton
              icon={<Lock size={16} />}
              label="Security"
              active={activeTab === "security"}
              onClick={() => setActiveTab("security")}
            />
            <TabButton
              icon={<Bell size={16} />}
              label="Notifications"
              active={activeTab === "notifications"}
              onClick={() => setActiveTab("notifications")}
            />
            <TabButton
              icon={<Shield size={16} />}
              label="Privacy"
              active={activeTab === "privacy"}
              onClick={() => setActiveTab("privacy")}
            />
          </nav>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="space-y-6">

          {/* 🔐 SECURITY */}
          {activeTab === "security" && (
            <SettingsCard
              title="Reset Password"
              desc="Update your password to keep your account secure."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <PasswordInput label="Current password" />
                <PasswordInput label="New password" />
                <PasswordInput label="Confirm new password" />
              </div>
            </SettingsCard>
          )}

          {/* 🔔 NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <SettingsCard
              title="Notification Preferences"
              desc="Choose how you want to receive updates."
            >
              <Toggle
                label="Email notifications"
                desc="Receive important updates via email"
              />
              <Divider />
              <Toggle
                label="Dashboard notifications"
                desc="Show notifications inside dashboard"
              />
            </SettingsCard>
          )}

          {/* 🔒 PRIVACY */}
          {activeTab === "privacy" && (
            <SettingsCard
              title="Privacy Controls"
              desc="Control who can view your profile."
            >
              <Toggle
                label="Profile visibility"
                desc="Allow recruiters to see your profile"
              />
            </SettingsCard>
          )}
        </div>

        {/* ================= ACTIONS ================= */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8">
          <button className="px-9 py-2 rounded-lg border text-slate-700 w-full sm:w-auto">
            Cancel
          </button>
          <button
            className="flex items-center justify-center gap-2 px-6 py-2
            bg-blue-600 text-white rounded-lg hover:bg-blue-700 w-full sm:w-auto"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </StudentLayout>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function TabButton({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 pb-3 text-sm font-medium whitespace-nowrap
        ${
          active
            ? "text-blue-600 border-b-2 border-blue-600"
            : "text-slate-500 hover:text-slate-800"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}

function SettingsCard({ title, desc, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          {desc}
        </p>
      </div>
      {children}
    </div>
  );
}

function PasswordInput({ label }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-slate-600 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}

function Toggle({ label, desc }) {
  const [enabled, setEnabled] = useState(false);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-700">
          {label}
        </p>
        <p className="text-xs text-slate-500">
          {desc}
        </p>
      </div>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${enabled ? "bg-blue-600" : "bg-slate-300"}`}
        aria-checked={enabled}
        role="switch"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${enabled ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-200" />;
}
