import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
} from "lucide-react";
import { Link } from "react-router-dom";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext";

function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={!disabled ? onChange : undefined}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
        enabled
          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
          : "bg-slate-300"
      } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

export default function CompanySettings() {
  const { company } = useCompany();
  const isLocked = company?.verificationStatus !== "APPROVED";

  const [passwords, setPasswords] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    newPass: false,
    confirm: false,
  });

  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const [loadingPassword, setLoadingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("companySettingsNotifications");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setNotifications((prev) => ({ ...prev, ...parsed }));
    } catch {
      localStorage.removeItem("companySettingsNotifications");
    }
  }, []);

  const handleNotificationsSave = () => {
    if (isLocked) return;

    setSavingNotifications(true);
    localStorage.setItem(
      "companySettingsNotifications",
      JSON.stringify(notifications)
    );

    setTimeout(() => {
      setSavingNotifications(false);
      toast.success("Notification preferences saved");
    }, 350);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (isLocked) return;

    if (!passwords.current || !passwords.newPass || !passwords.confirm) {
      toast.error("All password fields are required");
      return;
    }

    if (passwords.newPass.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwords.newPass !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setLoadingPassword(true);
    setTimeout(() => {
      setLoadingPassword(false);
      toast.success("Password updated successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    }, 1000);
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {isLocked && (
          <UnderReviewAlert
            message="Your company profile is under admin review."
            subMessage="Settings will be enabled after approval."
          />
        )}

        <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Company Profile</h2>
              <p className="text-sm text-slate-600">
                Company details are now managed from the dedicated profile page.
              </p>
            </div>
            <Link
              to="/company/dashboard/profile"
              className="inline-flex items-center justify-center rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Open Company Profile
            </Link>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6">
          <section
            className={`bg-white border border-blue-100 rounded-2xl p-6 shadow-sm ${
              isLocked ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="font-medium text-slate-800">Email Alerts</p>
                  <p className="text-xs text-slate-500">
                    Updates on applications and approvals.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.email}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      email: !prev.email,
                    }))
                  }
                  disabled={isLocked}
                />
              </div>

              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="font-medium text-slate-800">SMS Alerts</p>
                  <p className="text-xs text-slate-500">
                    Receive urgent updates via SMS.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.sms}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      sms: !prev.sms,
                    }))
                  }
                  disabled={isLocked}
                />
              </div>

              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="font-medium text-slate-800">
                    Dashboard Notifications
                  </p>
                  <p className="text-xs text-slate-500">
                    See real-time updates in dashboard.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.push}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      push: !prev.push,
                    }))
                  }
                  disabled={isLocked}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNotificationsSave}
              disabled={savingNotifications || isLocked}
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {savingNotifications ? "Saving..." : "Save Notifications"}
            </button>
          </section>

          <section
            className={`bg-white border border-blue-100 rounded-2xl p-6 shadow-sm ${
              isLocked ? "opacity-60 pointer-events-none" : ""
            }`}
          >
            <div className="flex items-center gap-2 mb-5">
              <Shield className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Security
              </h2>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                {
                  key: "current",
                  label: "Current Password",
                  value: passwords.current,
                  visible: showPassword.current,
                },
                {
                  key: "newPass",
                  label: "New Password",
                  value: passwords.newPass,
                  visible: showPassword.newPass,
                },
                {
                  key: "confirm",
                  label: "Confirm Password",
                  value: passwords.confirm,
                  visible: showPassword.confirm,
                },
              ].map((item) => (
                <div key={item.key}>
                  <label className="block text-sm text-slate-700 mb-1">
                    {item.label}
                  </label>
                  <div className="relative">
                    <input
                      type={item.visible ? "text" : "password"}
                      value={item.value}
                      onChange={(e) =>
                        setPasswords((prev) => ({
                          ...prev,
                          [item.key]: e.target.value,
                        }))
                      }
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Enter password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          [item.key]: !prev[item.key],
                        }))
                      }
                      className="absolute inset-y-0 right-3 text-slate-500"
                    >
                      {item.visible ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              ))}

              <div className="md:col-span-3">
                <button
                  type="submit"
                  disabled={loadingPassword || isLocked}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  <Lock size={16} />
                  {loadingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>

            <div className="mt-5 flex items-center justify-between border border-slate-200 rounded-xl p-4">
              <div>
                <p className="font-medium text-slate-800">
                  Two-Factor Authentication (2FA)
                </p>
                <p className="text-xs text-slate-500">
                  Add an extra layer of security to your account.
                </p>
              </div>
              <Toggle enabled={false} disabled />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
