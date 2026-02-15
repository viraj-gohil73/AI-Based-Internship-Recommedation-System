import { useState } from "react";
import { Eye, EyeOff, Lock, Bell, Mail, Smartphone, Send } from "lucide-react";
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
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 shadow-sm
        ${enabled ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gray-200"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:shadow-md"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 shadow-sm
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
            className={`bg-gradient-to-br from-white to-blue-50 md:w-[50%] rounded-xl border border-blue-100 shadow-md p-6 transition-all duration-300
              ${isLocked ? "opacity-60 pointer-events-none" : "hover:shadow-lg"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Change Password
              </h2>
            </div>

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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:opacity-75 text-white py-2 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                {isLocked
                  ? "Locked (Under Review)"
                  : loading
                  ? "Updating..."
                  : <>Confirm Password</>}
              </button>
            </form>
          </section>

          {/* ---------------- SECURITY SECTION ---------------- */}
          <section
            className={`bg-gradient-to-br from-white to-gray-50 md:w-[50%] rounded-xl border border-gray-200 shadow-md p-6 transition-all duration-300
              ${isLocked ? "opacity-60 pointer-events-none" : "hover:shadow-lg"}`}
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-bold text-gray-900">
                Security
              </h2>
            </div>

            {/* 2FA Toggle */}
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 mb-4">
              <div>
                <p className="font-semibold text-gray-800">Two-Factor Authentication (2FA)</p>
                <p className="text-sm text-gray-500 mt-0.5">Add an extra layer of security to your account.</p>
              </div>
              <Toggle enabled={false} disabled={true} />
            </div>

            {/* Device Management Placeholder */}
            <div className="p-4 bg-white rounded-lg border border-gray-100">
              <p className="font-semibold text-gray-800 mb-1">Device Management</p>
              <p className="text-sm text-gray-500">View and manage devices that have accessed your account. (Coming soon)</p>
            </div>
          </section>
        </div>
      </div>
  );
}
