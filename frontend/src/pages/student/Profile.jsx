import { useState } from "react";
import { useLocation } from "react-router-dom";
import StudentLayout from "../../layout/StudentLayout";
import ProjectsTab from "../../components/profile/ProjectTab";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfoTab from "../../components/profile/PersonalInfoTab";
import EducationTab from "../../components/profile/EducationTab";
import SkillsTab from "../../components/profile/SkillsTab";
import CertificatesTab from "../../components/profile/CertificatesTab";
import SocialLinksTab from "../../components/profile/SocialLinksTab";

const tabOptions = [
  { id: "personal", label: "Personal Info" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "certificates", label: "Certificates" },
  { id: "projects", label: "Projects" },
  { id: "social", label: "Social Links" },
];

export default function Profile() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("personal");
  const missingFields = Array.isArray(location.state?.missingFields)
    ? location.state.missingFields.filter(Boolean)
    : [];

  return (
    <StudentLayout title="Edit Profile">
      <div className="mx-auto max-w-7xl px-3 pb-8 sm:mt-2 sm:px-6 lg:px-8">
        {location.state?.profileRequired && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Complete required personal details first. Certificates and social links are optional.
            {missingFields.length > 0 && (
              <span className="block mt-1 font-medium">
                Missing: {missingFields.join(", ")}
              </span>
            )}
          </div>
        )}

        <section className=" bg-white  ">
          <div className="sm:hidden ">
            <label htmlFor="profile-tab-select" className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Choose section
            </label>
            <select
              id="profile-tab-select"
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            >
              {tabOptions.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          <div className="hidden sm:block sticky top-0 z-20 bg-white">
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>

          <div className="mt-4 sm:mt-6">
            {activeTab === "personal" && <PersonalInfoTab />}
            {activeTab === "education" && <EducationTab />}
            {activeTab === "skills" && <SkillsTab />}
            {activeTab === "certificates" && <CertificatesTab />}
            {activeTab === "projects" && <ProjectsTab />}
            {activeTab === "social" && <SocialLinksTab />}
          </div>
        </section>
      </div>
    </StudentLayout>
  );
}
