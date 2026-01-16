import { useEffect, useState , useRef} from "react";
import { Save, Camera } from "lucide-react";
import Input from "../profile/shared/Input";
import { useNavigate } from "react-router-dom";
import { useCompany } from "../../context/CompanyContext";
import toast from "react-hot-toast";

export default function CompanyInfoTab({ data, setFormData, disabled }) {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const { company: contextCompany, updateCompany } = useCompany();

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
    gstNumber: "",
  });
const uploadRef = useRef(null);

  /* ---------------- LOAD DATA FROM CONTEXT ---------------- */
  useEffect(() => {
    if (contextCompany) {
      setCompany({
        logo: contextCompany.logo || "",
        companyName: contextCompany.companyName || "",
        tagline: contextCompany.tagline || "",
        industry: contextCompany.industry || "",
        companySize: contextCompany.companySize || "",
        foundedYear: contextCompany.foundedYear || "",
        website: contextCompany.website || "",
        about: contextCompany.about || "",
        address1: contextCompany.address1 || "",
        address2: contextCompany.address2 || "",
        city: contextCompany.city || "",
        state: contextCompany.state || "",
        pincode: contextCompany.pincode || "",
        gstNumber: contextCompany.gstNumber || "",
      });
    }
  }, [contextCompany]);

  useEffect(() => {
  if (!window.uploadcare || !uploadRef.current) return;

  const widget = window.uploadcare.Widget(uploadRef.current);

  widget.onUploadComplete((info) => {
    const url = info.cdnUrl;

    // preview
    setCompany((prev) => ({ ...prev, logo: url }));

    // formData for autosave
    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, logo: url },
    }));

    // optional instant save to DB
    updateCompany({ logo: url });
  });
}, []);

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
    setCompany((prev) => ({
      ...prev,
      [field]: value,
    }));

    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));
  };

  /* ---------------- SAVE TO DB ---------------- */
  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateCompany(company);
      toast.success("Company Information Saved Successfully");
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to save company information");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow p-4 sm:p-6 lg:p-8 space-y-6">

        {/* LOGO */}
        {/* LOGO */}
<div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">

  {/* Preview Box */}
  <div className="w-22 h-22 mx-auto sm:mx-0 rounded-lg bg-white border border-slate-300 overflow-hidden">
    {company.logo ? (
      <img
        src={company.logo}
        className="w-full h-full object-cover"
        alt="Company Logo"
      />
    ) : (
      <div className="h-full flex items-center justify-center">
        <Camera size={22} className="text-slate-600" />
      </div>
    )}
    
  </div>
  {/* Uploadcare hidden input */}
  <input
    type="hidden"
    ref={uploadRef}
    role="uploadcare-uploader"
    data-images-only="true"
    data-crop="1:1,4:3,16:9"
    data-image-shrink="512x512"
    disabled={disabled}
  />


  {/* Choose File Button
  <button
    type="button"
    disabled={disabled}
    onClick={() => uploadRef.current.click()}
    className="bg-blue-100 text-blue-600 cursor-pointer px-3 py-1 rounded-lg border w-full sm:w-auto"
  >
    Choose File
  </button> */}

  {/* Remove Logo */}
  {company.logo && !disabled && (
    <button
      type="button"
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
          placeholder="Describe your company"
          value={company.about}
          className={`w-full p-4 rounded-lg ${
            disabled
              ? "bg-gray-50 text-gray-700 cursor-not-allowed"
              : "border border-slate-300"
          }`}
          onChange={(e) => handleChange("about", e.target.value)}
        />

        {/* ADDRESS */}
        <Input
          label="Address Line 1"
          placeholder="Address Line 1"
          disabled={disabled}
          value={company.address1}
          onChange={(e) => handleChange("address1", e.target.value)}
        />

        <Input
          label="Address Line 2"
          disabled={disabled}
          placeholder="Address Line 2"
          value={company.address2}
          onChange={(e) => handleChange("address2", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label="City"
            disabled={disabled}
            value={company.city}
            placeholder="City"
            error={errors.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />

          <Input
            label="State"
            disabled={disabled}
            value={company.state}
            placeholder="State"
            error={errors.state}
            onChange={(e) => handleChange("state", e.target.value)}
          />

          <Input
            label="Pincode"
            disabled={disabled}
            value={company.pincode}
            error={errors.pincode}
            placeholder="Pincode"
            maxLength={6}
            onChange={(e) =>
              handleChange("pincode", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        <Input
          label="GST Number"
          disabled={disabled}
          value={company.gstNumber}
          placeholder="GST Number"
          onChange={(e) => handleChange("gstNumber", e.target.value)}
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
        <button
          onClick={handleSave}
          className="flex gap-2 px-10 py-3 rounded-lg text-sm tracking-tight font-semibold bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
        >
          <Save size={18} className="mt-0.5" /> Save
        </button>
      </div>
    </>
  );
}
