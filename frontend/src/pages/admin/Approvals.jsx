import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  Building2,
  Calendar,
} from "lucide-react";

const approvalsData = [
  {
    id: 1,
    company: "TechNova Pvt Ltd",
    email: "contact@technova.com",
    submittedOn: "17 Jan 2026",
    status: "Pending",
  },
  {
    id: 2,
    company: "CodeCraft Solutions",
    email: "info@codecraft.com",
    submittedOn: "16 Jan 2026",
    status: "Pending",
  },
];

export default function Approvals() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">
          Company Approvals
        </h1>

        <span className="text-sm text-slate-500">
          Pending Verifications
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-slate-100 text-slate-600">
            <tr>
              <th className="p-4 text-left">Company</th>
              <th>Email</th>
              <th>Submitted</th>
              <th>Status</th>
              <th className="text-right p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {approvalsData.map((item) => (
              <tr
                key={item.id}
                className="border-t hover:bg-slate-50 transition"
              >
                <td className="p-4 flex items-center gap-2 font-medium">
                  <Building2 size={16} className="text-blue-600" />
                  {item.company}
                </td>

                <td className="text-slate-600">{item.email}</td>

                <td className="flex items-center gap-1 text-slate-600">
                  <Calendar size={14} />
                  {item.submittedOn}
                </td>

                <td>
                  <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </td>

                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => setSelected(item)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-lg hover:bg-slate-100"
                  >
                    <Eye size={14} />
                    View
                  </button>

                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <CheckCircle size={14} />
                    Approve
                  </button>

                  <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700">
                    <XCircle size={14} />
                    Reject
                  </button>
                </td>
              </tr>
            ))}

            {approvalsData.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-8 text-slate-500"
                >
                  No pending approvals 🎉
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">
              Company Details
            </h2>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">Company:</span>{" "}
                {selected.company}
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                {selected.email}
              </p>
              <p>
                <span className="font-medium">Submitted On:</span>{" "}
                {selected.submittedOn}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Close
              </button>

              <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                Approve
              </button>

              <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
