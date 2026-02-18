import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  Eye,
  EyeOff,
  Lock,
  Save,
  Shield,
  UserCog,
} from "lucide-react";
import { useRecruiter } from "../../context/RecruiterContext";

function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
        enabled
          ? "bg-gradient-to-r from-blue-600 to-indigo-600"
          : "bg-slate-300"
      }`}
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

export default function RecruiterSettings() {
  const { recruiter, updateRecruiter } = useRecruiter();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
  });

  const [notifications, setNotifications] = useState({
    email: true,
    browser: true,
    internshipAlerts: true,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  useEffect(() => {
    if (!recruiter) return;

    setProfile({
      name: recruiter.name || "",
      email: recruiter.email || "",
      mobile: recruiter.mobile || "",
      designation: recruiter.designation || "",
    });
  }, [recruiter]);

  useEffect(() => {
    const saved = localStorage.getItem("recruiterSettingsNotifications");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setNotifications((prev) => ({ ...prev, ...parsed }));
    } catch {
      localStorage.removeItem("recruiterSettingsNotifications");
    }
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (!profile.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setSavingProfile(true);
    try {
      await updateRecruiter({
        name: profile.name.trim(),
        mobile: profile.mobile.trim(),
        designation: profile.designation.trim(),
      });
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message || "Profile update failed");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleNotificationSave = () => {
    setSavingNotifications(true);
    localStorage.setItem(
      "recruiterSettingsNotifications",
      JSON.stringify(notifications)
    );
    setTimeout(() => {
      setSavingNotifications(false);
      toast.success("Notification preferences saved");
    }, 350);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (!passwords.current || !passwords.next || !passwords.confirm) {
      toast.error("All password fields are required");
      return;
    }

    if (passwords.next.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwords.next !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswords({ current: "", next: "", confirm: "" });
    toast.success("Password form validated. Connect API endpoint to persist.");
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white border border-blue-100 rounded-2xl p-5 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Recruiter Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your account profile, alerts, and security preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <UserCog className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                Profile Details
              </h2>
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-slate-700 mb-1">
                  Official Email
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border border-slate-200 bg-slate-100 text-slate-500 rounded-lg px-3 py-2 outline-none cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    Mobile
                  </label>
                  <input
                    type="text"
                    value={profile.mobile}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        mobile: e.target.value.replace(/[^\d+]/g, ""),
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Talent Acquisition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
              >
                <Save size={16} />
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </section>

          <section className="bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
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
                    Internship and applicant updates by email.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.email}
                  onChange={() =>
                    setNotifications((prev) => ({ ...prev, email: !prev.email }))
                  }
                />
              </div>

              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="font-medium text-slate-800">Browser Alerts</p>
                  <p className="text-xs text-slate-500">
                    Show alerts in your recruiter dashboard.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.browser}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      browser: !prev.browser,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between border border-slate-200 rounded-xl p-4">
                <div>
                  <p className="font-medium text-slate-800">
                    New Internship Suggestions
                  </p>
                  <p className="text-xs text-slate-500">
                    Receive recommendations based on your postings.
                  </p>
                </div>
                <Toggle
                  enabled={notifications.internshipAlerts}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      internshipAlerts: !prev.internshipAlerts,
                    }))
                  }
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleNotificationSave}
              disabled={savingNotifications}
              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
            >
              <Save size={16} />
              {savingNotifications ? "Saving..." : "Save Notifications"}
            </button>
          </section>

          <section className="xl:col-span-2 bg-white border border-blue-100 rounded-2xl p-6 shadow-sm">
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
                  key: "next",
                  label: "New Password",
                  value: passwords.next,
                  visible: showPassword.next,
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
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-white font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  <Lock size={16} />
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
