import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Input from "../../../components/profile/shared/Input";
import { useVerification } from "../../../context/VerificationContext";
import UnderReviewAlert from "../../../components/UnderReviewAlert";
import { useCompany } from "../../../context/CompanyContext"
/* ---------------- TOGGLE SWITCH ---------------- */
function Toggle({ enabled, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={!disabled ? onChange : undefined}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300
        ${enabled ? "bg-blue-600" : "bg-gray-300"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
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
  const { company } = useCompany();
  const { status } = useVerification();
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

  const [loading, setLoading] = useState(false);

  /* -------- PASSWORD UPDATE -------- */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();

    if (isLocked) return;

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

      <div className="max-w-7xl p-4 mx-auto  space-y-6">

        {/* 🔒 STATUS MESSAGE */}
        {isLocked && (
          <UnderReviewAlert
    message="Your company profile is under admin review."
    subMessage="Settings will be enabled after approval."
  />
        )}

        <div className="space-y-8 md:space-y-0 md:flex md:gap-6 md:items-start">

          {/* ---------------- CHANGE PASSWORD ---------------- */}
          <section
            className={`bg-white md:w-[50%] rounded-xl border border-slate-300 shadow-sm p-5
              ${isLocked ? "opacity-60 pointer-events-none" : ""}`}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Change Password
            </h2>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
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
                  {showPassword.current ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
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
                  {showPassword.newPass ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({ ...passwords, confirm: e.target.value })
                  }
                  required
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
                  {showPassword.confirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading || isLocked}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2 rounded-lg font-medium transition"
              >
                {isLocked
                  ? "Locked (Under Review)"
                  : loading
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>
          </section>

          {/* ---------------- NOTIFICATIONS ---------------- */}
          <section
            className={`bg-white md:w-[50%] rounded-xl border border-slate-300 shadow-sm p-8
              ${isLocked ? "opacity-60" : ""}`}
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Notifications
            </h2>

            <div className="space-y-6">
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
                  className="flex items-center justify-between"
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
                    disabled={isLocked}
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
      </div>
  );
}
