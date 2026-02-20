import { useEffect, useRef, useState } from "react";
import { Save, Camera, Sparkles, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Input from "../profile/shared/Input";
import GenderSelect from "../profile/shared/GenderSelect";

const API_BASE_URL = "http://localhost:5000";

export default function PersonalInfoTab() {
  const uploadRef = useRef(null);
  const syncUserStorage = (patch = {}) => {
    try {
      const raw = localStorage.getItem("user");
      const prev = raw ? JSON.parse(raw) : {};
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      window.dispatchEvent(new Event("student-profile-updated"));
    } catch {}
  };

  const [errors, setErrors] = useState({});
  const [dpUploading, setDpUploading] = useState(false);
  const [dpSaving, setDpSaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [profile, setProfile] = useState({
    dp: "",
    firstName: "",
    lastName: "",
    gender: "",
    dob: "",
    phone: "",
    email: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    preferredLocation: "",
    languages: "",
    hobbies: "",
  });

  const validate = () => {
    const newErrors = {};

    if (profile.phone.length !== 10) newErrors.phone = "Enter valid 10-digit Indian mobile number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) newErrors.email = "Enter valid email address";
    if (!/^\d{6}$/.test(profile.pincode)) newErrors.pincode = "Pincode must be 6 digits";
    if (!profile.gender) newErrors.gender = "Gender is required";
    if (!profile.city) newErrors.city = "City is required";
    if (!profile.state) newErrors.state = "State is required";
    if (!profile.preferredLocation) newErrors.preferredLocation = "Current location is required";
    if (!profile.firstName) newErrors.firstName = "First name is required";
    if (!profile.lastName) newErrors.lastName = "Last name is required";
    if (!profile.dob) newErrors.dob = "Date of birth is required";
    if (profile.hobbies.length > 0 && !/^[a-zA-Z\s,]+$/.test(profile.hobbies)) newErrors.hobbies = "Hobbies must be comma-separated";
    if (profile.languages.length > 0 && !/^[a-zA-Z\s,]+$/.test(profile.languages)) newErrors.languages = "Languages must be comma-separated";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const openUploader = () => {
    uploadRef.current?.click();
  };

  const autoSaveDp = async (dpUrl) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setDpSaving(true);
      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ dp: dpUrl }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Failed to save profile picture");
      }

      syncUserStorage({ dp: dpUrl, avatar: dpUrl });
      toast.success("Profile picture saved");
    } catch (error) {
      toast.error(error.message || "Failed to save profile picture");
    } finally {
      setDpSaving(false);
    }
  };

  const handleSave = async () => {
    if (dpUploading) {
      toast.error("Please wait for profile image upload to complete");
      return;
    }

    if (!validate()) return;

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login again");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(`${API_BASE_URL}/api/student/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update profile");
      }

      syncUserStorage({
        firstName: profile.firstName,
        lastName: profile.lastName,
        fname: profile.firstName,
        lname: profile.lastName,
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim(),
        email: profile.email,
        dp: profile.dp,
        avatar: profile.dp,
      });
      toast.success("Profile saved successfully");
    } catch (error) {
      toast.error(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`${API_BASE_URL}/api/student/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const profileData = data?.profile || {};

        setProfile({
          dp: profileData.dp || "",
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          gender: profileData.gender || "",
          dob: profileData.dob || "",
          phone: profileData.phone || "",
          email: profileData.email || "",
          address1: profileData.address1 || "",
          address2: profileData.address2 || "",
          city: profileData.city || "",
          state: profileData.state || "",
          pincode: profileData.pincode || "",
          preferredLocation: profileData.preferredLocation || "",
          languages: profileData.languages || "",
          hobbies: profileData.hobbies || "",
        });

        syncUserStorage({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          fname: profileData.firstName || "",
          lname: profileData.lastName || "",
          name: `${profileData.firstName || ""} ${profileData.lastName || ""}`.trim(),
          email: profileData.email || "",
          dp: profileData.dp || "",
          avatar: profileData.dp || "",
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!uploadRef.current || !window.uploadcare) return;

    const widget = window.uploadcare.Widget(uploadRef.current);

    widget.onChange(() => {
      setDpUploading(true);
    });

    widget.onUploadComplete((fileInfo) => {
      setDpUploading(false);
      handleChange("dp", fileInfo.cdnUrl);
      autoSaveDp(fileInfo.cdnUrl);
    });
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
              <Sparkles size={14} />
              Personal Profile
            </div>
            <h2 className="text-lg font-semibold text-slate-900 mt-2">Personal Information</h2>
            <p className="text-sm text-slate-600 mt-1">Keep your details complete and accurate for better opportunities.</p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
            <CheckCircle2 size={14} className="text-blue-600" />
            Profile details updated
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <p className="text-sm font-semibold text-slate-800">Profile Picture</p>
          <p className="text-xs text-slate-600 mt-1">Use a clear photo to improve trust and profile visibility.</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 mx-auto sm:mx-0 rounded-full bg-white border border-slate-300 overflow-hidden">
              {profile.dp ? (
                <img src={profile.dp} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="h-full flex items-center justify-center text-sm">
                  <Camera size={22} className="text-slate-600" />
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {/* <button
                type="button"
                className="bg-white text-blue-700 cursor-pointer px-4 py-2 rounded-lg border border-blue-200 w-full sm:w-auto text-center text-sm font-medium hover:bg-blue-50"
                onClick={openUploader}
              >
                {dpUploading ? "Uploading..." : dpSaving ? "Saving..." : "Upload Picture"}
              </button> */}

              {profile.dp && (
                <button
                  type="button"
                  className="bg-white text-red-600 cursor-pointer px-4 py-2 rounded-lg border border-red-200 w-full sm:w-auto text-sm font-medium hover:bg-red-50"
                  onClick={() => {
                    handleChange("dp", "");
                    autoSaveDp("");
                  }}
                >
                  Remove Picture
                </button>
              )}
            </div>

            <input
              ref={uploadRef}
              type="hidden"
              role="uploadcare-uploader"
              data-public-key={import.meta.env.VITE_UPLOADCARE_PUBLIC_KEY || window.UPLOADCARE_PUBLIC_KEY}
              data-images-only="true"
              data-crop="1:1"
              data-image-shrink="512x512"
            />
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Basic Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="First Name"
                placeholder="Enter First Name"
                value={profile.firstName}
                error={errors.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <Input
                label="Last Name"
                placeholder="Enter Last Name"
                value={profile.lastName}
                error={errors.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <GenderSelect value={profile.gender} error={errors.gender} onChange={(val) => handleChange("gender", val)} />
            <Input
              label="Date of Birth"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              value={profile.dob}
              error={errors.dob}
              onChange={(e) => handleChange("dob", e.target.value)}
            />
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Contact Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Phone Number"
                placeholder="Enter Mobile Number"
                value={profile.phone}
                error={errors.phone}
                maxLength={10}
                onChange={(e) => handleChange("phone", e.target.value.replace(/\D/g, ""))}
              />
              <Input
                label="Email"
                placeholder="Enter Email Address"
                value={profile.email}
                error={errors.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Address</h3>
            <div className="space-y-4 sm:space-y-6">
              <Input
                label="Address Line 1"
                placeholder="Enter Address Line 1"
                value={profile.address1}
                onChange={(e) => handleChange("address1", e.target.value)}
              />
              <Input
                label="Address Line 2"
                placeholder="Enter Address Line 2"
                value={profile.address2}
                onChange={(e) => handleChange("address2", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Input
                  label="City"
                  placeholder="Enter City"
                  value={profile.city}
                  error={errors.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
                <Input
                  label="State"
                  placeholder="Enter State"
                  value={profile.state}
                  error={errors.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
                <Input
                  label="Pincode"
                  placeholder="Enter Pincode"
                  value={profile.pincode}
                  error={errors.pincode}
                  maxLength={6}
                  onChange={(e) => handleChange("pincode", e.target.value.replace(/\D/g, ""))}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-800 mb-3">Preferences</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Current Location"
                placeholder="Enter Current Location"
                value={profile.preferredLocation}
                error={errors.preferredLocation}
                onChange={(e) => handleChange("preferredLocation", e.target.value)}
              />
              <Input
                label="Languages Known"
                placeholder="English, Hindi, Gujarati"
                value={profile.languages}
                error={errors.languages}
                onChange={(e) => handleChange("languages", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <Input
              label="Hobbies"
              placeholder="Reading, Traveling, Gaming"
              value={profile.hobbies}
              error={errors.hobbies}
              onChange={(e) => handleChange("hobbies", e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-center sm:justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving || dpUploading}
          className="flex justify-center gap-2 px-7 py-3 rounded-lg text-sm font-medium transition cursor-pointer bg-gradient-to-r from-blue-600 to-blue-700 text-white w-full sm:w-auto hover:from-blue-700 hover:to-blue-800 shadow-sm disabled:opacity-50"
        >
          <Save size={18} /> {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
