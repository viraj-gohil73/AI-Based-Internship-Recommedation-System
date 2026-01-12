import { useEffect, useState } from "react";
import { Save, Camera } from "lucide-react";
import Input from "../profile/shared/Input";
import GenderSelect from "../profile/shared/GenderSelect";

export default function PersonalInfoTab() {
  const [errors, setErrors] = useState({});
 const validate = () => {
    const newErrors = {};

    if (profile.phone.length !== 10)
      newErrors.phone = "Enter valid 10-digit Indian mobile number";

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email))
      newErrors.email = "Enter valid email address";

    if (!/^\d{6}$/.test(profile.pincode))
      newErrors.pincode = "Pincode must be 6 digits";

    if (!profile.gender)
      newErrors.gender = "Gender is required";

    if(!profile.city)
      newErrors.city = "City is required";

    if(!profile.state)
      newErrors.state = "State is required";

    if(!profile.preferredLocation)
      newErrors.preferredLocation = "Current location is required";

    if(!profile.firstName)
      newErrors.firstName = "First name is required";

    if(!profile.lastName)
      newErrors.lastName = "Last name is required";

    if(!profile.dob)
      newErrors.dob = "Date of birth is required";


    if (profile.hobbies.length > 0 && !/^[a-zA-Z\s,]+$/.test(profile.hobbies))
      newErrors.hobbies = "Hobbies must be comma-separated";

    if (profile.languages.length > 0 && !/^[a-zA-Z\s,]+$/.test(profile.languages) )
      newErrors.languages = "Languages must be comma-separated";


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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
    hobbies: ""
  });

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
    setErrors({ ...errors, [field]: "" });
  };

  useEffect(() => {
    fetch("/api/student/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          dp: data.dp || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          gender: data.gender || "",
          dob: data.dob || "",
          phone: data.phone || "",
          email: data.email || "",
          address1: data.address1 || "",
          address2: data.address2 || "",
          city: data.city || "",
          state: data.state || "",
          pincode: data.pincode || "",
          preferredLocation: data.preferredLocation || "",
          languages: data.languages || "",
          hobbies: data.hobbies || ""
        });
      });
  }, []);

  return (
 <>
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8 space-y-8">

              {/* DP */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 mx-auto sm:mx-0 rounded-full bg-white border-1 border-slate-300 overflow-hidden">
                  {profile.dp ? (
                    <img src={profile.dp} className="w-full h-full object-cover" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-sm">
                     <Camera size={22} className="text-slate-600"/>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="bg-blue-100 text-blue-600 cursor-pointer px-1 py-1 rounded-lg border w-full sm:w-auto"
                  onChange={(e) =>
                    handleChange("dp", URL.createObjectURL(e.target.files[0]))
                  }
                />
                {/* remove button */}
                  {profile.dp && (
                    <button
                      className="bg-white text-blue-600 cursor-pointer px-4 py-1 rounded-md border w-full sm:w-auto"
                      onClick={() => handleChange("dp", "")}
                    >
                      Remove Picture
                    </button>
                  )}
               
              </div>

              {/* NAME */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input label="First Name" placeholder="Enter First Name" value={profile.firstName} onChange={(e) => handleChange("firstName", e.target.value)} />
                <Input label="Last Name" placeholder="Enter Last Name" value={profile.lastName} onChange={(e) => handleChange("lastName", e.target.value)} />
              </div>

              {/* GENDER + DOB */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <GenderSelect value={profile.gender} error={errors.gender} className="cursor-pointer" onChange={(val) => handleChange("gender", val)} />
                <Input
                  label="Date of Birth"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={profile.dob}
                  onChange={(e) => handleChange("dob", e.target.value)}
                />
              </div>

              {/* CONTACT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input
                  label="Phone Number"
                  placeholder="Enter Mobile Number"
                  value={profile.phone}
                  error={errors.phone}
                  maxLength={10}
                  onChange={(e) =>
                    handleChange("phone", e.target.value.replace(/\D/g, ""))
                  }
                />
                <Input
                  label="Email"
                  placeholder="Enter Email Address"
                  value={profile.email}
                  error={errors.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* ADDRESS */}
              <Input label="Address Line 1" placeholder="Enter Address Line 1" value={profile.address1} onChange={(e) => handleChange("address1", e.target.value)} />
              <Input label="Address Line 2" placeholder="Enter Address Line 2" value={profile.address2} onChange={(e) => handleChange("address2", e.target.value)} />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <Input label="City" placeholder="Enter City" value={profile.city} onChange={(e) => handleChange("city", e.target.value)} />
                <Input label="State" placeholder="Enter State" value={profile.state} onChange={(e) => handleChange("state", e.target.value)} />
                <Input
                  label="Pincode"
                  placeholder="Enter Pincode"
                  value={profile.pincode}
                  error={errors.pincode}
                  maxLength={6}
                  onChange={(e) =>
                    handleChange("pincode", e.target.value.replace(/\D/g, ""))
                  }
                />
              </div>

              {/* PREFERENCES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input label="Current Location" placeholder="Enter Current Location" value={profile.preferredLocation} onChange={(e) => handleChange("preferredLocation", e.target.value)} />
                <Input label="Languages Known" placeholder="English, Hindi, Gujarati" value={profile.languages} onChange={(e) => handleChange("languages", e.target.value)} />
              </div>

              {/* hobby */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <Input label="Hobbies" placeholder="Reading, Traveling, Gaming" value={profile.hobbies} onChange={(e) => handleChange("hobbies", e.target.value)} />
                </div>
            </div>

            {/* ACTION */}
            <div className="flex justify-center sm:justify-end mt-6 sm:mt-8">
              <button
                onClick={validate}
                className="flex justify-center  gap-2 px-7 py-3 rounded-lg text-sm font-medium transition cursor-pointer bg-blue-500 text-white w-full sm:w-auto hover:bg-blue-600"
              >
                <Save size={18} /> Save Changes
              </button>
            </div>
          
      

   </>
  );
}
