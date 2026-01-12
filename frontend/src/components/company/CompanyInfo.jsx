import { useEffect, useState } from "react";
import { Save, Camera } from "lucide-react";
import Input from "../profile/shared/Input";
import { useNavigate } from "react-router-dom";

export default function CompanyInfoTab({ data, setFormData, disabled }) {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const [company, setCompany] = useState({
    logo: "",
    companyName: "",
    tagline: "",
    industry: "",
    companySize: "",
    foundedYear: "",
    website: "",
    about: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });

  /* ---------------- VALIDATION ---------------- */
  const validate = () => {
    const newErrors = {};

    if (!company.companyName)
      newErrors.companyName = "Company name is required";

    if (!company.industry)
      newErrors.industry = "Industry is required";

    if (!company.companySize)
      newErrors.companySize = "Company size is required";

    if (!company.foundedYear)
      newErrors.foundedYear = "Founded year is required";

    if (!company.website || !/^https?:\/\//.test(company.website))
      newErrors.website = "Enter valid website URL";

    if (!company.about || company.about.length < 100)
      newErrors.about = "About company must be at least 100 characters";

    if (!company.city)
      newErrors.city = "City is required";

    if (!company.state)
      newErrors.state = "State is required";

    if (!/^\d{6}$/.test(company.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));
  };

  /* ---------------- FETCH COMPANY PROFILE ---------------- */
  useEffect(() => {
  const fetchCompany = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("auth/company/login");
        return;
      }

      const res = await fetch("http://localhost:5000/api/company/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Non-JSON response:", text);
        return;
      }

      const data = await res.json();
      console.log("COMPANY DATA 👉", data);

      setCompany((prev) => ({
          ...prev,
          logo: data.data.logo || "",
          companyName: data.companyName || "",
          tagline: data.tagline || "",
          industry: data.industry || "",
          companySize: data.companySize || "",
          foundedYear: data.foundedYear || "",
          website: data.website || "",
          about: data.about || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
        }));
      
    } catch (err) {
      navigate("/company/dashboard/profile");
    }
  };

  fetchCompany();
}, []);

  return (
    <>
      <div className="bg-white rounded-xl  border border-slate-200 shadow p-4 sm:p-6 lg:p-8 space-y-6">

        {/* LOGO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 mx-auto sm:mx-0 rounded-lg bg-white border border-slate-300 overflow-hidden">
            {company.logo ? (
              <img
                src={company.logo}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <Camera size={22} className="text-slate-600" />
              </div>
            )}
          </div>

          <input
            type="file"
            accept="image/*"
            disabled={disabled}
            className="bg-blue-100 text-blue-600 cursor-pointer px-2 py-1 rounded-lg border w-full sm:w-auto"
            onChange={(e) =>
              handleChange("logo", URL.createObjectURL(e.target.files[0]))
            }
          />

          {company.logo && (
            <button
            disabled={disabled}
              className="bg-white text-blue-600 px-4 py-1 rounded-md border w-full sm:w-auto"
              onClick={() => handleChange("logo", "")}
            >
              Remove Logo
            </button>
          )}
        </div>

        {/* COMPANY NAME */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label="Company Name"
            disabled={disabled}
            placeholder="Enter Company Name"
            value={company.companyName}
            error={errors.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />

          <Input
            label="Tagline"
            disabled={disabled}
            placeholder="Short company tagline"
            value={company.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
          />
        </div>

        {/* INDUSTRY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label="Industry"
            disabled={disabled}
            placeholder="IT, AI, Finance"
            value={company.industry}
            error={errors.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />

          <Input
            label="Company Size"
            disabled={disabled}
            
            placeholder="1-10, 11-50"
            value={company.companySize}
            error={errors.companySize}
            onChange={(e) => handleChange("companySize", e.target.value)}
          />

          <Input
            label="Founded Year"
            disabled={disabled}
            placeholder="2020"
            value={company.foundedYear}
            error={errors.foundedYear}
            onChange={(e) =>
              handleChange("foundedYear", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        {/* WEBSITE */}
        <Input
          label="Official Website"
          disabled={disabled}
          placeholder="https://company.com"
          value={company.website}
          error={errors.website}
          onChange={(e) => handleChange("website", e.target.value)}
        />

        {/* ABOUT */}
        <label className="block text-sm font-medium mb-1">About Company</label>
        <textarea
          disabled={disabled}
          placeholder="Describe your company (min 100 characters)"
          value={company.about}
          className={`w-full p-4 rounded-lg ${disabled? "bg-gray-50 text-gray-700 cursor-not-allowed": "border border-slate-300"}`}
          onChange={(e) => handleChange("about", e.target.value)}
        />

        {/* ADDRESS */}
        <Input
          label="Address Line 1"
          disabled={disabled}
          placeholder="Enter Address"
          value={company.address1}
          onChange={(e) => handleChange("address1", e.target.value)}
        />

        <Input
          label="Address Line 2"
          disabled={disabled}
          placeholder="Enter Address"
          value={company.address2}
          onChange={(e) => handleChange("address2", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label="City"
            disabled={disabled}
            placeholder="Enter City"
            value={company.city}
            error={errors.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />

          <Input
            label="State"
            disabled={disabled}
            placeholder="Enter State"
            value={company.state}
            error={errors.state}
            onChange={(e) => handleChange("state", e.target.value)}
          />

          <Input
            label="Pincode"
            disabled={disabled}
            placeholder="Enter Pincode"
            value={company.pincode}
            error={errors.pincode}
            maxLength={6}
            onChange={(e) =>
              handleChange("pincode", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>
        {/* gst no */}
        <Input
          label="GST Number"
          disabled={disabled}
          placeholder="Enter GST Number"
          value={company.gstNumber}
          onChange={(e) => handleChange("gstNumber", e.target.value)}
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
        <button
          onClick={validate}
          className="flex gap-2 px-7 py-3 rounded-lg text-sm cursor-pointer font-medium bg-blue-500 text-white w-full sm:w-auto hover:bg-blue-600"
        >
          <Save size={18} className="mt-0.5"/> Save Information
        </button>
      </div>
    </>
  );
}
