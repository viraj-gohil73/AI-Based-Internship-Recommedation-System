import { User, BookOpen, Code, Award } from "lucide-react";

export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "skills", label: "Skills", icon: Code },
    { id: "certificates", label: "Certificates", icon: Award },
    {id:"projects", label: "Projects", icon: BookOpen},
    { id: "social", label: "Social Links", icon: User },
  ];

  return (
    <div className="border-b mb-6">
      <nav className="flex gap-6">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 pb-3 text-sm font-medium cursor-pointer
              ${activeTab === id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-600 hover:text-blue-600"}
            `}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
