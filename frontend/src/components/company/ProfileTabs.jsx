export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "companyinfo", label: "Company Info" },
    {id:"contacttails", label:"Contact Details"},
    { id: "documents", label: "Documents" },
    { id: "sociallinks", label: "Social Links" },
    { id: "settings", label: "Settings" },
  ];
  
  return (
    <div className="bg-white rounded-t-xl border border-b-0 border-blue-200 shadow-md">
      <nav className="flex space-x-1 overflow-x-auto" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 sm:px-6 py-3 text-sm font-semibold whitespace-nowrap transition-all duration-300 group ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            {tab.label}
            
            {/* UNDERLINE INDICATOR */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300 ${
                activeTab === tab.id ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
              }`}
            />
            
            {/* HOVER EFFECT */}
            <div
              className={`absolute inset-x-0 bottom-0 h-10 bg-blue-50 rounded-t-lg -z-10 transition-all duration-300 ${
                activeTab === tab.id ? "opacity-100" : "opacity-0 group-hover:opacity-50"
              }`}
            />
          </button>
        ))}
      </nav>
    </div>
  );
}