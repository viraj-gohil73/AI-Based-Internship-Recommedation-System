import { User, BookOpen, Code, Award, FolderKanban, Link as LinkIcon } from "lucide-react";

export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "education", label: "Education", icon: BookOpen },
    { id: "skills", label: "Skills", icon: Code },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "social", label: "Social Links", icon: LinkIcon },
  ];

  return (
    <div className="sticky top-0 z-20 mb-6 p-2 border-b-2 bg-white border-slate-300">
      <nav className="flex gap-4 mt-2 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 whitespace-nowrap pb-3 text-sm font-medium cursor-pointer
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
