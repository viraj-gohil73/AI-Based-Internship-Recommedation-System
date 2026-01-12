export default function TabsHeader({ tabs, activeTab, setActiveTab }) {
  return (
    <div className="relative border-b border-gray-200 ">
      <div className="flex gap-8 px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative py-3 text-sm font-medium transition-colors cursor-pointer
                ${isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"}
              `}
            >
              {tab}

              {/* ACTIVE UNDERLINE */}
              {isActive && (
                <span
                  className="absolute left-0 -bottom-[1px] w-full h-[2px] bg-blue-600"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
