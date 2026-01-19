import { useEffect, useState } from "react";
import { Save } from "lucide-react";
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

  /* ---------------- LOAD DATA FROM CONTEXT ---------------- */
  useEffect(() => {
    if (!contextCompany) return;

    setContact({
      secondaryEmail: contextCompany.secondaryEmail || "",
      mobile: contextCompany.mobile || "",
    });
  }, [contextCompany]);

  /* ---------------- VALIDATION ---------------- */
   const validate = async () => {
    const newErrors = {};

    if (contact.mobile == "" && contact.mobile.length !== 10) {
  newErrors.mobile = "Mobile number must be exactly 10 digits";
} else if (
  contact.mobile &&
  !/^[0-9]\d{9}$/.test(contact.mobile)
) {
  newErrors.mobile = "Enter a valid Indian mobile number";
}


if (
  contact.secondaryEmail == "" &&
  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.secondaryEmail)
) {
  newErrors.secondaryEmail = "Enter a valid email address";
}



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CHANGE HANDLER ---------------- */
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
      [field]: "",
    }));
  };

  /* ---------------- SAVE TO DB ---------------- */
  const handleSave = async () => {
    if (disabled) return;

    const isValid = await validate();
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
      {/* FORM */}
      <div className="bg-white rounded-xl border border-slate-200 shadow p-4 sm:p-6 lg:p-8 space-y-6">
        {/* EMAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
            onChange={(e) =>
              handleChange("secondaryEmail", e.target.value)
            }
          />
        </div>

        {/* MOBILE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="Mobile Number"
            placeholder="Enter 10-digit mobile number"
            disabled={disabled}
            value={contact.mobile}
            error={errors.mobile}
            maxLength={10}
            onChange={(e) =>
              handleChange(
                "mobile",
                e.target.value.replace(/\D/g, "")
              )
            }
          />
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
        <button
          type="button"
          disabled={disabled}
          onClick={handleSave}
          className={`flex gap-2 px-10 py-3 rounded-lg text-sm font-semibold text-white ${
            !disabled
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Save size={18} /> Save
        </button>
      </div>
    </>
  );
}
