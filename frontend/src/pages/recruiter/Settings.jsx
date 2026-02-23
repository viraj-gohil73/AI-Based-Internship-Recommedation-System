import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  Bell,
  CheckCircle2,
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
      className={`relative inline-flex h-7 w-12 items-center rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled
          ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600"
          : "border-slate-300 bg-slate-200"
      }`}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition ${
          enabled ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function SectionShell({ icon: Icon, title, subtitle, children, className = "" }) {
  return (
    <section
      className={`rounded-3xl border border-blue-100 bg-white/95 p-6 shadow-sm backdrop-blur ${className}`}
    >
      <div className="mb-5 flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700">
          <Icon size={18} />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function passwordStrength(value) {
  if (!value) return { label: "Not set", score: 0, tone: "bg-slate-200" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 2) return { label: "Weak", score, tone: "bg-rose-500" };
  if (score <= 4) return { label: "Medium", score, tone: "bg-amber-500" };
  return { label: "Strong", score, tone: "bg-emerald-500" };
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

  const enabledNotifications = useMemo(
    () => Object.values(notifications).filter(Boolean).length,
    [notifications]
  );

  const profileCompletion = useMemo(() => {
    const fields = [profile.name, profile.email, profile.mobile, profile.designation];
    const filled = fields.filter((item) => String(item || "").trim()).length;
    return Math.round((filled / fields.length) * 100);
  }, [profile]);

  const strength = useMemo(() => passwordStrength(passwords.next), [passwords.next]);

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
    <div className="min-h-full bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#e0e7ff,_transparent_42%),linear-gradient(to_bottom,_#f8fafc,_#eff6ff)] p-4 sm:p-6">
      <div className="mx-auto max-w-6xl space-y-6">

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <SectionShell
            icon={UserCog}
            title="Profile Details"
            subtitle="Keep your recruiter identity and contact details current."
          >
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-700">Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-700">Official Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={profile.email}
                    disabled
                    className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-slate-500 outline-none"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-500">
                    Locked
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-700">Mobile</label>
                  <input
                    type="text"
                    value={profile.mobile}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        mobile: e.target.value.replace(/[^\d+]/g, ""),
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    placeholder="Enter mobile number"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-700">Designation</label>
                  <input
                    type="text"
                    value={profile.designation}
                    onChange={(e) =>
                      setProfile((prev) => ({
                        ...prev,
                        designation: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
                    placeholder="e.g. Talent Acquisition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 sm:w-auto"
              >
                <Save size={16} />
                {savingProfile ? "Saving..." : "Save Profile"}
              </button>
            </form>
          </SectionShell>

          <SectionShell
            icon={Bell}
            title="Notifications"
            subtitle="Control where and how you receive recruiter updates."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
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

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
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

              <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                <div>
                  <p className="font-medium text-slate-800">New Internship Suggestions</p>
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
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 sm:w-auto"
            >
              <Save size={16} />
              {savingNotifications ? "Saving..." : "Save Notifications"}
            </button>
          </SectionShell>

          <SectionShell
            icon={Shield}
            title="Security"
            subtitle="Update account password and maintain a stronger login posture."
            className="xl:col-span-2"
          >
            <form
              onSubmit={handlePasswordSubmit}
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
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
                  <label className="mb-1 block text-sm text-slate-700">{item.label}</label>
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
                      className="w-full rounded-xl border border-slate-300 px-3 py-2.5 pr-10 text-slate-900 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200"
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

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:col-span-3">
                <div className="flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-700">Password strength</p>
                  <p className="inline-flex items-center gap-1 font-semibold text-slate-700">
                    <CheckCircle2 size={14} />
                    {strength.label}
                  </p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-2 rounded-full transition-all ${strength.tone}`}
                    style={{ width: `${Math.min(100, strength.score * 20)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Use at least 8 characters with uppercase, lowercase, number, and symbol.
                </p>
              </div>

              <div className="md:col-span-3">
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 sm:w-auto"
                >
                  <Lock size={16} />
                  Update Password
                </button>
              </div>
            </form>
          </SectionShell>
        </div>
      </div>
    </div>
  );
}
