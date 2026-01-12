export default function ProfileTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "companyinfo", label: "Company Info" },
    {id:"contacttails", label:"Contact Details"},
    { id: "documents", label: "Documents" },
    { id: "sociallinks", label: "Social Links" },
    { id: "settings", label: "Settings" },
  ];
    return (
    <div className="border-b border-gray-300">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm cursor-pointer
                    ${activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>
    </div>
  );
}