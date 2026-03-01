import { useEffect, useState } from "react";
import { Save, MailOpen, PhoneCall, Info } from "lucide-react";
import Input from "../profile/shared/Input";
import { useCompany } from "../../context/CompanyContext";
import toast from "react-hot-toast";

export default function CompanyContactTab({ data, setFormData, disabled }) {
  const { company: contextCompany, updateCompany } = useCompany();

  const [contact, setContact] = useState({
    secondaryEmail: "",
    mobile: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!contextCompany) return;

    setContact({
      secondaryEmail: contextCompany.secondaryEmail || "",
      mobile: contextCompany.mobile || "",
    });
  }, [contextCompany]);

  const validate = () => {
    if (disabled) return true;

    const newErrors = {};

    if (!/^[6-9]\d{9}$/.test(contact.mobile)) {
      newErrors.mobile = "Enter valid 10-digit Indian mobile number";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.secondaryEmail)) {
      newErrors.secondaryEmail = "Enter valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setContact((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: null,
    }));
  };

  const handleSave = async () => {
    if (disabled) return;

    const isValid = validate();
    if (!isValid) {
      toast.error("Please fix the errors before saving");
      return;
    }

    try {
      await updateCompany(contact);
      toast.success("Contact details saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save contact details");
    }
  };

  return (
    <>
      <div className="space-y-5">
        

        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <MailOpen className="w-5 h-5 text-white" />
              </div>
              Email Contacts
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="Official Email"
                value={contextCompany?.email || ""}
                disabled
              />

              <Input
                label="Secondary Email"
                placeholder="support@company.com"
                disabled={disabled}
                value={contact.secondaryEmail}
                error={errors.secondaryEmail}
                onChange={(e) => handleChange("secondaryEmail", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <PhoneCall className="w-5 h-5 text-white" />
              </div>
              Phone Number
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <Input
                label="Mobile Number"
                placeholder="10-digit mobile number"
                disabled={disabled}
                value={contact.mobile}
                error={errors.mobile}
                maxLength={10}
                onChange={(e) =>
                  handleChange("mobile", e.target.value.replace(/\D/g, ""))
                }
              />
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800 flex items-start gap-3">
            <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-1">Contact Information</p>
              <p className="text-xs text-blue-700">
                Updated contact details help candidates and platform support reach your team faster.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end mt-8">
        <button
          type="button"
          disabled={disabled}
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-10 py-3 m-6 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
            !disabled
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
          }`}
        >
          <Save size={18} /> Save Contact Details
        </button>
      </div>
    </>
  );
}
