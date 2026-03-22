import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Eye,
  EyeOff,
  Globe,
  Lock,
  Save,
  Shield,
  UserCheck,
} from "lucide-react";
import StudentLayout from "../../layout/StudentLayout";

const SETTINGS_STORAGE_KEY = "studentSettingsPreferences";

const defaultPasswordData = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const defaultToggles = {
  emailNotifications: true,
  dashboardNotifications: true,
  marketingEmails: false,
  profileVisibility: true,
  searchableProfile: false,
  twoFactorEnabled: false,
};

const emptyStatus = { type: "", message: "" };

const getPasswordValidationError = ({ currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    return "All password fields are required";
  }

  if (newPassword !== confirmPassword) {
    return "New password and confirm password must match";
  }

  if (currentPassword === newPassword) {
    return "New password must be different from current password";
  }

  if (newPassword.length < 8) {
    return "New password must be at least 8 characters";
  }

  if (
    !/[a-z]/.test(newPassword) ||
    !/[A-Z]/.test(newPassword) ||
    !/[0-9]/.test(newPassword) ||
    !/[^A-Za-z0-9]/.test(newPassword)
  ) {
    return "Use uppercase, lowercase, number, and special character";
  }

  return "";
};

export default function Settings() {
  const [passwordData, setPasswordData] = useState(defaultPasswordData);
  const [toggles, setToggles] = useState(defaultToggles);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState(emptyStatus);
  const [sectionStatus, setSectionStatus] = useState({
    security: emptyStatus,
    notifications: emptyStatus,
    privacy: emptyStatus,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") return;

      setToggles((prev) => ({
        ...prev,
        emailNotifications:
          typeof parsed.emailNotifications === "boolean"
            ? parsed.emailNotifications
            : prev.emailNotifications,
        dashboardNotifications:
          typeof parsed.dashboardNotifications === "boolean"
            ? parsed.dashboardNotifications
            : prev.dashboardNotifications,
        marketingEmails:
          typeof parsed.marketingEmails === "boolean" ? parsed.marketingEmails : prev.marketingEmails,
        profileVisibility:
          typeof parsed.profileVisibility === "boolean" ? parsed.profileVisibility : prev.profileVisibility,
        searchableProfile:
          typeof parsed.searchableProfile === "boolean" ? parsed.searchableProfile : prev.searchableProfile,
        twoFactorEnabled:
          typeof parsed.twoFactorEnabled === "boolean" ? parsed.twoFactorEnabled : prev.twoFactorEnabled,
      }));
    } catch {
      localStorage.removeItem(SETTINGS_STORAGE_KEY);
    }
  }, []);

  const clearSectionStatus = () => {
    setSectionStatus({
      security: emptyStatus,
      notifications: emptyStatus,
      privacy: emptyStatus,
    });
  };

  const updateToggle = (key) => {
    setToggles((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
    clearSectionStatus();
  };

  const passwordStrength = useMemo(() => {
    const password = passwordData.newPassword;
    let score = 0;

    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const labels = ["Weak", "Fair", "Good", "Strong"];
    return {
      score,
      label: password.length === 0 ? "Not set" : labels[Math.max(score - 1, 0)],
      barClass:
        score <= 1
          ? "bg-rose-500"
          : score === 2
            ? "bg-amber-500"
            : score === 3
              ? "bg-sky-500"
              : "bg-emerald-500",
    };
  }, [passwordData.newPassword]);

  const savePreferences = (section) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toggles));
      const messages = {
        security: "Security preferences saved",
        notifications: "Notification preferences saved",
        privacy: "Privacy preferences saved",
      };

      setSectionStatus((previous) => ({
        ...previous,
        [section]: { type: "success", message: messages[section] || "Settings saved" },
      }));
    } catch {
      setSectionStatus((previous) => ({
        ...previous,
        [section]: { type: "error", message: "Unable to save settings right now" },
      }));
    }
  };

  const handlePasswordChange = async () => {
    setPasswordStatus(emptyStatus);
    const validationError = getPasswordValidationError(passwordData);
    if (validationError) {
      setPasswordStatus({ type: "error", message: validationError });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPasswordStatus({ type: "error", message: "Please login again to change password" });
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await fetch("http://localhost:5000/api/student/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(passwordData),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to change password");
      }

      setPasswordData(defaultPasswordData);
      setPasswordStatus({ type: "success", message: data?.message || "Password changed successfully" });
    } catch (error) {
      setPasswordStatus({ type: "error", message: error.message || "Unable to change password" });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <StudentLayout title="Settings">
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:px-4 sm:pb-10 ">
        <section className="overflow-hidden rounded-2xl border border-slate-200 mt-4 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-gradient-to-r from-sky-50 via-white to-blue-50 px-4 py-5 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Preferences</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">Manage Account Settings</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Security, notifications, and privacy settings are now available in one page for quicker updates.
            </p>
          </div>

          <div className="space-y-6 p-4 sm:p-6">
            <SettingsCard
              icon={Lock}
              title="Account Security"
              description="Use a strong password and protect your account with two-step verification."
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PasswordInput
                  label="Current password"
                  value={passwordData.currentPassword}
                  onChange={(value) => setPasswordData((prev) => ({ ...prev, currentPassword: value }))}
                  autoComplete="current-password"
                />
                <PasswordInput
                  label="New password"
                  value={passwordData.newPassword}
                  onChange={(value) => setPasswordData((prev) => ({ ...prev, newPassword: value }))}
                  autoComplete="new-password"
                />
                <PasswordInput
                  label="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={(value) => setPasswordData((prev) => ({ ...prev, confirmPassword: value }))}
                  autoComplete="new-password"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wide text-slate-500">Password strength</span>
                  <span className="font-medium text-slate-700">{passwordStrength.label}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full transition-all ${passwordStrength.barClass}`}
                    style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                  />
                </div>
              </div>

              <ToggleRow
                icon={UserCheck}
                label="Enable two-step verification"
                description="A verification code will be required during sign in."
                enabled={toggles.twoFactorEnabled}
                onToggle={() => updateToggle("twoFactorEnabled")}
              />

              <StatusMessage status={passwordStatus} />
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Lock size={16} />
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordData(defaultPasswordData);
                    setPasswordStatus(emptyStatus);
                  }}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => savePreferences("security")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <Save size={16} />
                  Save Security
                </button>
              </div>
              <StatusMessage status={sectionStatus.security} />
            </SettingsCard>

            <SettingsCard
              icon={Bell}
              title="Notification Preferences"
              description="Choose where we send alerts and reminders."
            >
              <div className="space-y-4">
                <ToggleRow
                  icon={Bell}
                  label="Email notifications"
                  description="Receive account updates and deadlines via email."
                  enabled={toggles.emailNotifications}
                  onToggle={() => updateToggle("emailNotifications")}
                />
                <ToggleRow
                  icon={Globe}
                  label="Dashboard notifications"
                  description="See notifications inside your student dashboard."
                  enabled={toggles.dashboardNotifications}
                  onToggle={() => updateToggle("dashboardNotifications")}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => savePreferences("notifications")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Save size={16} />
                  Save Notifications
                </button>
              </div>
              <StatusMessage status={sectionStatus.notifications} />
            </SettingsCard>

            <SettingsCard
              icon={Shield}
              title="Privacy Controls"
              description="Choose who can discover and view your profile."
            >
              <div className="space-y-4">
                <ToggleRow
                  icon={Shield}
                  label="Profile visible to recruiters"
                  description="Allow approved recruiters to view your profile details."
                  enabled={toggles.profileVisibility}
                  onToggle={() => updateToggle("profileVisibility")}
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => savePreferences("privacy")}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  <Save size={16} />
                  Save Privacy
                </button>
              </div>
              <StatusMessage status={sectionStatus.privacy} />
            </SettingsCard>
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}

function SettingsCard({ icon: Icon, title, description, children }) {
  return (
    <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="rounded-lg bg-slate-100 p-2 text-slate-700">
          <Icon size={16} />
        </span>
        <div>
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function StatusMessage({ status }) {
  if (!status?.message) {
    return null;
  }

  return (
    <p
      className={`text-sm font-medium ${
        status.type === "error" ? "text-rose-600" : "text-emerald-600"
      }`}
    >
      {status.message}
    </p>
  );
}

function PasswordInput({ label, value, onChange, autoComplete = "new-password" }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 text-sm text-slate-800 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          autoComplete={autoComplete}
        />
        <button
          type="button"
          onClick={() => setVisible((state) => !state)}
          className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-700"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </label>
  );
}

function ToggleRow({ icon: Icon, label, description, enabled, onToggle }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-lg bg-white p-2 text-slate-600 shadow-sm ring-1 ring-slate-200">
          <Icon size={16} />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="mt-1 text-xs text-slate-600">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          enabled ? "bg-blue-600" : "bg-slate-300"
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
