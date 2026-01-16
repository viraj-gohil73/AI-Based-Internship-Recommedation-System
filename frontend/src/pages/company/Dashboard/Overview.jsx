import { Users, Briefcase, CheckCircle, Layers } from "lucide-react";
import { useCompany } from "../../../context/CompanyContext"; // later use

export default function Overview() {
   const { company, loading } = useCompany(); // future API

  const stats = [
    {
      title: "Total Recruiters",
      value: 6,
      icon: <Users className="text-blue-600" size={28} />,
      bg: "bg-blue-100",
    },
    {
      title: "Total Internships",
      value: 14,
      icon: <Briefcase className="text-purple-600" size={28} />,
      bg: "bg-purple-100",
    },
    {
      title: "Active Internships",
      value: 9,
      icon: <CheckCircle className="text-green-600" size={28} />,
      bg: "bg-green-100",
    },
    {
      title: "Remaining Posts",
      value: 5,
      icon: <Layers className="text-orange-600" size={28} />,
      bg: "bg-orange-100",
    },
  ];

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        Company Overview
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div
              className={`w-12 h-12 flex items-center justify-center rounded-lg ${item.bg}`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{item.title}</p>
              <h2 className="text-xl font-bold text-gray-800">
                {item.value}
              </h2>
            </div>
          </div>
        ))}
      </div>

      {/* Subscription Info */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Current Subscription
          </h3>
          <p className="text-gray-600">
            Plan: <span className="font-medium">Pro Plan</span>
          </p>
          <p className="text-gray-600 mt-2">
            Expiry Date: <span className="font-medium">31 Dec 2026</span>
          </p>
        </div>

        <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Summary
          </h3>
          <ul className="text-gray-600 space-y-2">
            <li>✔ Recruiters can post internships</li>
            <li>✔ Subscription is active</li>
            <li>✔ No pending verification</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
