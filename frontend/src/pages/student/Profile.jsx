import { useState } from "react";
import StudentLayout from "../../layout/StudentLayout";
import ProjectsTab from "../../components/profile/ProjectTab";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfoTab from "../../components/profile/PersonalInfoTab";
import EducationTab from "../../components/profile/EducationTab";
import SkillsTab from "../../components/profile/SkillsTab";
import CertificatesTab from "../../components/profile/CertificatesTab";
import SocialLinksTab from "../../components/profile/SocialLinksTab";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <StudentLayout title="Edit Profile">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 sm:mt-2 pb-6">

        {/* ================= MOBILE DROPDOWN ================= */}
        <div className="sm:hidden mb-4">
          <select
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border bg-white
            text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="personal">Personal Info</option>
            <option value="education">Education</option>
            <option value="skills">Skills</option>
            <option value="certificates">Certificates</option>
            <option value="projects">Projects</option>
            <option value="social">Social Links</option>
          </select>
        </div>

        {/* ================= DESKTOP / TABLET TABS ================= */}
        <div className="hidden sm:block">
          <ProfileTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>

        {/* ================= TAB CONTENT ================= */}
        <div className="mt-4 sm:mt-6">
          {activeTab === "personal" && <PersonalInfoTab />}
          {activeTab === "education" && <EducationTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "certificates" && <CertificatesTab />}
          {activeTab === "projects" && <ProjectsTab />}
          {activeTab === "social" && <SocialLinksTab />}
        </div>

      </div>
    </StudentLayout>
  );
}
