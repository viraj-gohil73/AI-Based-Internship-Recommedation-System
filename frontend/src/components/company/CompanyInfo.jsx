import { useEffect, useState, useRef } from "react";
import {
  Save,
  Image,
  Building,
  AlertCircle,
  Globe,
  Briefcase,
  MapPin,
  TrendingUp,
  Check,
} from "lucide-react";
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
  }, [disabled, setFormData, updateCompany]);

  const validate = () => {
    if (disabled) return true;

    const newErrors = {};
    const currentYear = new Date().getFullYear();

    if (!company.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!company.industry.trim()) newErrors.industry = "Industry is required";
    if (!company.companySize) newErrors.companySize = "Company size is required";

    const year = Number(company.foundedYear);
    if (!year || year < 1900 || year > currentYear) {
      newErrors.foundedYear = "Enter a valid founded year";
    }

    if (!company.about || company.about.trim().length < 50) {
      newErrors.about = "About company must be at least 50 characters";
    }

    if (!company.address1.trim()) newErrors.address1 = "Address required";
    if (!company.city.trim()) newErrors.city = "City is required";
    if (!company.state.trim()) newErrors.state = "State is required";

    if (!/^[1-9][0-9]{5}$/.test(company.pincode)) {
      newErrors.pincode = "Pincode must be exactly 6 digits";
    }

    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!gstRegex.test(company.gst_no)) newErrors.gst_no = "Enter valid GST Number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setCompany((prev) => ({ ...prev, [field]: value }));

    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));

    setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleSave = async () => {
    if (disabled) return;

    if (!validate()) {
      toast.error("Please fix the highlighted errors");
      return;
    }

    try {
      await updateCompany(company);
      toast.success("Company information saved successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save company information");
    }
  };

  return (
    <>
      <div className="space-y-5">
       

        <div className="bg-white shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Image className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Company Logo</h3>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div className="w-28 h-28 mx-auto sm:mx-0 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-blue-300 overflow-hidden flex items-center justify-center">
                {company.logo ? (
                  <img src={company.logo} className="w-full h-full object-cover" alt="Company Logo" />
                ) : (
                  <Image size={32} className="text-blue-400" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-3">Upload a clean, square logo.</p>
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
                    className="px-4 py-2 ml-6 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition"
                  >
                    Remove Logo
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                placeholder="Your company tagline"
                onChange={(e) => handleChange("tagline", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-3">
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              Industry and Scale
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
              <Input
                label={<>Industry<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.industry}
                placeholder="E.g., Technology, Finance"
                error={errors.industry}
                onChange={(e) => handleChange("industry", e.target.value)}
              />
              <Input
                label={<>Company Size<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.companySize}
                placeholder="E.g., 10-50, 100-500"
                error={errors.companySize}
                onChange={(e) => handleChange("companySize", e.target.value)}
              />
              <Input
                label={<>Founded Year<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.foundedYear}
                placeholder="YYYY"
                error={errors.foundedYear}
                onChange={(e) => handleChange("foundedYear", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                <Globe className="w-5 h-5 text-white" />
              </div>
              Online Presence
            </h3>
            <Input
              label="Official Website"
              disabled={disabled}
              value={company.website}
              placeholder="https://yourcompany.com"
              onChange={(e) => handleChange("website", e.target.value)}
            />
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              About Company
            </h3>
            <label className="block text-sm font-semibold mb-2 text-slate-700">
              About Company <span className="text-red-500">*</span>
              {company.about && (
                <span className="text-xs text-gray-500 font-normal ml-2">({company.about.length} chars)</span>
              )}
            </label>
            <textarea
              disabled={disabled}
              value={company.about}
              placeholder="Tell us about your company, mission, and values..."
              className={`w-full h-[160px] p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                disabled
                  ? "bg-gray-100 text-gray-600 cursor-not-allowed border border-gray-200"
                  : "border border-slate-300"
              }`}
              onChange={(e) => handleChange("about", e.target.value)}
            />
            {errors.about && (
              <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                <AlertCircle size={16} /> {errors.about}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <h3 className="flex items-center gap-3 text-lg font-bold text-gray-900 mb-5">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              Location
            </h3>

            <div className="space-y-4">
              <Input
                label={<>Address Line 1<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.address1}
                placeholder="Street address"
                error={errors.address1}
                onChange={(e) => handleChange("address1", e.target.value)}
              />
              <Input
                label="Address Line 2"
                disabled={disabled}
                value={company.address2}
                placeholder="Apartment, suite, etc. (optional)"
                onChange={(e) => handleChange("address2", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 mt-4">
              <Input
                label={<>City <span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.city}
                placeholder="City"
                error={errors.city}
                onChange={(e) => handleChange("city", e.target.value)}
              />
              <Input
                label={<>State<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.state}
                placeholder="State"
                error={errors.state}
                onChange={(e) => handleChange("state", e.target.value)}
              />
              <Input
                label={<>Pincode<span className="text-red-500"> *</span></>}
                disabled={disabled}
                value={company.pincode}
                placeholder="XXXXXX"
                error={errors.pincode}
                maxLength={6}
                onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 p-4 sm:p-5">
            <Input
              label={<>GST Number<span className="text-red-500"> *</span></>}
              disabled={disabled}
              maxLength={15}
              value={company.gst_no}
              placeholder="22AAAAA0000A1Z5"
              error={errors.gst_no}
              onChange={(e) => handleChange("gst_no", e.target.value.toUpperCase())}
            />
          </section>
        </div>
      </div>

      <div className="flex justify-center sm:justify-end mt-8">
        <button
          disabled={disabled}
          onClick={handleSave}
          className={`inline-flex items-center gap-2 px-10 py-3 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-lg ${
            !disabled
              ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75"
          }`}
        >
          {disabled ? (
            <>
              <Check size={18} className="animate-pulse" /> Saved
            </>
          ) : (
            <>
              <Save size={18} /> Save Information
            </>
          )}
        </button>
      </div>
    </>
  );
}
