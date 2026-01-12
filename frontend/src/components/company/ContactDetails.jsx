import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import Input from "../profile/shared/Input";

export default function CompanyContactTab({ data, setFormData, disabled }) {
  const [errors, setErrors] = useState({});

  const [contact, setContact] = useState({
    officialEmail: "",
    secondaryEmail: "",
    mobile: "",
  });

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.officialEmail))
      newErrors.officialEmail = "Enter valid official email address";

    if (
      contact.secondaryEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.secondaryEmail)
    )
      newErrors.secondaryEmail = "Enter valid secondary email address";

    if (!/^[6-9]\d{9}$/.test(contact.mobile))
      newErrors.mobile = "Enter valid 10-digit Indian mobile number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field, value) => {
    setContact({ ...contact, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  /* ---------------- FETCH CONTACT DETAILS ---------------- */
  useEffect(() => {
    fetch("/api/company/contact")
      .then((res) => res.json())
      .then((data) => {
        setContact({
          officialEmail: data.officialEmail || "",
          secondaryEmail: data.secondaryEmail || "",
          mobile: data.mobile || "",
        });
      });
  }, []);

  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8 space-y-8">

        {/* EMAILS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="Official Email"
            placeholder="hr@company.com"
            disabled={disabled}
            value={contact.officialEmail}
            error={errors.officialEmail}
            onChange={(e) =>
              handleChange("officialEmail", e.target.value)
            }
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
          onClick={validate}
          className="flex gap-2 px-7 py-3 rounded-lg text-sm cursor-pointer font-medium bg-blue-500 text-white w-full sm:w-auto hover:bg-blue-600"
        >
          <Save size={18} /> Save Contact Details
        </button>
      </div>
    </>
  );
}
