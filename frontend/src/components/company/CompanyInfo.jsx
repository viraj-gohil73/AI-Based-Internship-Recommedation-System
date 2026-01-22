import { useEffect, useState, useRef } from "react";
import { Save, Camera } from "lucide-react";
import Input from "../profile/shared/Input";
import { useCompany } from "../../context/CompanyContext";
import toast from "react-hot-toast";

export default function CompanyInfoTab({ data, setFormData, disabled }) {
  const { company: contextCompany, updateCompany } = useCompany();
  const uploadRef = useRef(null);

  const [errors, setErrors] = useState({});
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
    gst_no: "",
  });

  /* ---------------- LOAD DATA FROM CONTEXT ---------------- */
  useEffect(() => {
    if (!contextCompany) return;

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
      gst_no: contextCompany.gst_no || "",
    });
  }, [contextCompany]);

  /* ---------------- UPLOADCARE (SAFE) ---------------- */
  useEffect(() => {
    if (!window.uploadcare || !uploadRef.current || disabled) return;

    const widget = window.uploadcare.Widget(uploadRef.current);

    if (widget.__listenerAttached) return;
    widget.__listenerAttached = true;

    widget.onUploadComplete((info) => {
      if (disabled) return;

      const url = info.cdnUrl;

      setCompany((prev) => ({ ...prev, logo: url }));

      setFormData((prev) => ({
        ...prev,
        companyInfo: { ...prev.companyInfo, logo: url },
      }));

      updateCompany({ logo: url });
    });
  }, [disabled]);

  /* ---------------- VALIDATION (LOGIC FIX ONLY) ---------------- */
  const validate = () => {
    if (disabled) return true;

    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!company.companyName.trim())
      newErrors.companyName = "Company name is required";

    if (!company.industry.trim())
      newErrors.industry = "Industry is required";

    if (!company.companySize)
      newErrors.companySize = "Company size is required";

    const year = Number(company.foundedYear);
    if (!year || year < 1900 || year > currentYear)
      newErrors.foundedYear = "Enter a valid founded year";

    if (!company.about || company.about.trim().length < 50)
      newErrors.about = "About company must be at least 50 characters";

    if (!company.address1.trim())
      newErrors.address1 = "Address required";

    if (!company.city.trim())
      newErrors.city = "City is required";

    if (!company.state.trim())
      newErrors.state = "State is required";

    if (!/^[1-9][0-9]{5}$/.test(company.pincode))
      newErrors.pincode = "Pincode must be exactly 6 digits";

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(company.gst_no))
      newErrors.gst_no = "Enter valid GST Number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- CHANGE HANDLER ---------------- */
  const handleChange = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }));

    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));

    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (disabled) return;

    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      await updateCompany(company);
      toast.success("Company Information Saved Successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save company information");
    }
  };

  /* ======================= UI (UNCHANGED) ======================= */
  return (
    <>
      <div className="bg-white rounded-xl border border-slate-200 shadow p-4 sm:p-6 lg:p-8 space-y-6">

        {/* LOGO */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
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

          <input
            type="hidden"
            ref={uploadRef}
            role="uploadcare-uploader"
            data-images-only="true"
            data-crop="1:1,4:3,16:9"
            data-image-shrink="512x512"
            disabled={disabled}
            data-disabled={company.logo || disabled ? "true" : "false"}
          />

          {company.logo && !disabled && (
            <button
              type="button"
              onClick={() => handleChange("logo", "")}
              className="flex gap-2 px-8 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-500 hover:bg-blue-700"
            >
              Remove Logo
            </button>
          )}
        </div>

        {/* COMPANY NAME */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Input
            label={<>Company Name <span className="text-red-500">*</span></>}
            disabled={disabled}
            value={company.companyName}
            error={errors.companyName}
            onChange={(e) => handleChange("companyName", e.target.value)}
          />
          <Input
            label="Tagline"
            disabled={disabled}
            value={company.tagline}
            onChange={(e) => handleChange("tagline", e.target.value)}
          />
        </div>

        {/* INDUSTRY */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label={<>Industry<span className="text-red-500"> *</span></>}
            disabled={disabled}
            value={company.industry}
            error={errors.industry}
            onChange={(e) => handleChange("industry", e.target.value)}
          />
          <Input
            label={<>Company Size<span className="text-red-500"> *</span></>}
            disabled={disabled}
            value={company.companySize}
            error={errors.companySize}
            onChange={(e) => handleChange("companySize", e.target.value)}
          />
          <Input
            label={<>Founded Year<span className="text-red-500"> *</span></>}
            disabled={disabled}
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
          value={company.website}
          onChange={(e) => handleChange("website", e.target.value)}
        />

        {/* ABOUT */}
        <label className="block text-sm font-medium mb-1">
          About Company <span className="text-red-500">*</span>
        </label>
        <textarea
          disabled={disabled}
          value={company.about}
          className={`w-full h-[150px] p-4 rounded-lg resize-none ${
            disabled
              ? "bg-gray-50 text-gray-700 cursor-not-allowed"
              : "border-2 border-slate-400"
          }`}
          onChange={(e) => handleChange("about", e.target.value)}
        />
        {errors.about && (
          <p className="text-sm text-red-500">{errors.about}</p>
        )}

        {/* ADDRESS */}
        <Input
          label={<>Address Line 1<span className="text-red-500"> *</span></>}
          disabled={disabled}
          value={company.address1}
          error={errors.address1}
          onChange={(e) => handleChange("address1", e.target.value)}
        />
        <Input
          label="Address Line 2"
          disabled={disabled}
          value={company.address2}
          onChange={(e) => handleChange("address2", e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Input
            label={<>City <span className="text-red-500"> *</span></>}
            disabled={disabled}
            value={company.city}
            error={errors.city}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <Input
            label={<>State<span className="text-red-500"> *</span></>}
            disabled={disabled}
            value={company.state}
            error={errors.state}
            onChange={(e) => handleChange("state", e.target.value)}
          />
          <Input
            label={<>Pincode<span className="text-red-500"> *</span></>}
            disabled={disabled}
            value={company.pincode}
            error={errors.pincode}
            maxLength={6}
            onChange={(e) =>
              handleChange("pincode", e.target.value.replace(/\D/g, ""))
            }
          />
        </div>

        {/* GST */}
        <Input
          label={<>GST Number<span className="text-red-500"> *</span></>}
          disabled={disabled}
          maxLength={15}
          value={company.gst_no}
          error={errors.gst_no}
          onChange={(e) => handleChange("gst_no", e.target.value.toUpperCase())}
        />
      </div>

      {/* ACTION */}
      <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
        <button
          disabled={disabled}
          onClick={handleSave}
          className={`flex gap-2 px-10 py-3 rounded-lg text-sm font-semibold text-white ${
            !disabled
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          <Save size={18} className="mt-0.5" /> Save
        </button>
      </div>
    </>
  );
}
