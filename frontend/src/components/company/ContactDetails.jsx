import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Input from "../profile/shared/Input";
import { useCompany } from "../../context/CompanyContext";
import toast from "react-hot-toast";
export default function CompanyContactTab({ data, setFormData, disabled }) {
  const [errors, setErrors] = useState({});

  const { company: contextCompany, updateCompany } = useCompany();

  const [contact, setContact] = useState({
    secondaryEmail: "",
    mobile: "",
  });

  /* ---------------- LOAD DATA FROM CONTEXT ---------------- */
  useEffect(() => {
    if (contextCompany) {
      setContact({
        secondaryEmail: contextCompany?.secondaryEmail || "",
        mobile: contextCompany?.mobile || "",
      });
    }
  }, [contextCompany]);

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};


    if (
      contact.secondaryEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.secondaryEmail)
    )
      newErrors.secondaryEmail = "Enter valid secondary email address";

    if (contact.mobile && !/^[6-9]\d{9}$/.test(contact.mobile))
      newErrors.mobile = "Enter valid 10-digit Indian mobile number";


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
      contactInfo: { ...prev.contactInfo, [field]: value },
    }));

    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /* ---------------- SAVE TO DB ---------------- */
  const handleSave = async () => {
    if (!validate()) return;

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
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8 space-y-8">

        {/* EMAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="Official Email"
            placeholder="hr@company.com"
            disabled
            value={contextCompany?.email}
          />

          <Input
            label="Secondary Email"
            placeholder="support@company.com"
            disabled={disabled}
            value={contact?.secondaryEmail}
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
            placeholder="Enter Mobile Number"
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
          onClick={handleSave}
          className="flex gap-2 px-10 py-3 rounded-lg text-sm font-medium bg-blue-500 text-white w-full sm:w-auto hover:bg-blue-600"
        >
          <Save size={18} /> Save
        </button>
      </div>
    </>
  );
}
