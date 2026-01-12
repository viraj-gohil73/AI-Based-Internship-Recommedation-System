import { useState } from "react";
import CompanyLayout from "../../../layout/CompnayLayout";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../../components/profile/shared/Input";
/* ---------------- TOGGLE SWITCH ---------------- */
function Toggle({ enabled, onChange }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer duration-300
        ${enabled ? "bg-blue-600" : "bg-gray-300"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300
          ${enabled ? "translate-x-6" : "translate-x-1"}`}
      />
    </button>
  );
}

/* ---------------- MAIN SETTINGS PAGE ---------------- */
export default function CompanySettings() {
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

  const [loading, setLoading] = useState(false);

  /* -------- PASSWORD UPDATE -------- */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (passwords.newPass !== passwords.confirm) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      alert("Password updated successfully");
      setPasswords({ current: "", newPass: "", confirm: "" });
    }, 1000);
  };

  return (
    <CompanyLayout title="Company Settings">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-8 md:space-y-0 md:flex md:gap-6 md:items-start   ">

        {/* ---------------- CHANGE PASSWORD ---------------- */}
        <section className="bg-white md:w-[50%] rounded-xl border border-slate-300 shadow-sm p-5 ">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Change Password
          </h2>
  
          <form
            onSubmit={handlePasswordSubmit}
            className="flex flex-col gap-4 "
          >
            {/* Current Password */}
            <div className="relative">
              <Input
                type={showPassword.current ? "text" : "password"}
                placeholder="Current Password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    current: !showPassword.current,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* New Password */}
            <div className="relative">
              <Input
                type={showPassword.newPass ? "text" : "password"}
                placeholder="New Password"
                value={passwords.newPass}
                onChange={(e) =>
                  setPasswords({ ...passwords, newPass: e.target.value })
                }
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    newPass: !showPassword.newPass,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
          </div>
          <div className="relative">
              <Input
                type={showPassword.confirm ? "text" : "password"}
                placeholder="Confirm New Password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                required
                className="input pr-10"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPassword({
                    ...showPassword,
                    confirm: !showPassword.confirm,
                  })
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="sm:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        
        </section>

        {/* ---------------- NOTIFICATIONS ---------------- */}
        <section className="bg-white md:w-[50%]  rounded-xl border border-slate-300 shadow-sm p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Notifications
          </h2>

          <div className="space-y-8">
            {[
              {
                key: "email",
                title: "Email Notifications",
                desc: "Get updates via email",
              },
              {
                key: "sms",
                title: "SMS Notifications",
                desc: "Important alerts on phone",
              },
              {
                key: "push",
                title: "Push Notifications",
                desc: "Real-time dashboard alerts",
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between "
              >
                <div>
                  <p className="font-medium text-gray-700">
                    {item.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.desc}
                  </p>
                </div>

                <Toggle
                  enabled={notifications[item.key]}
                  onChange={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]: !notifications[item.key],
                    })
                  }
                />
              </div>
            ))}
          </div>
        </section>
      </div>
    </CompanyLayout>
  );
}
