import { Eye, Pencil, Trash2, MapPin, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CompanyLayout from "../../../layout/CompnayLayout";

export default function InternshipList() {
  const navigate = useNavigate();

  const internships = [
    {
      id: "1",
      title: "Frontend Developer Intern",
      recruiter: "Amit Sharma",
      location: "Remote",
      stipend: "₹8,000 - ₹12,000",
      status: "Active",
    },
    {
      id: "2",
      title: "Backend Developer Intern",
      recruiter: "Neha Patel",
      location: "Ahmedabad",
      stipend: "₹10,000",
      status: "Closed",
    },
  ];

  return (
    <CompanyLayout title="Company Internships">
      <div className="p-6">

        {/* ================= DESKTOP TABLE ================= */}
        <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left">Internship</th>
                <th className="px-4 py-3">Recruiter</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Stipend</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {internships.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.recruiter}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.location}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {item.stipend}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() =>
                          navigate(`/company/dashboard/internships/${item.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/company/dashboard/internships/edit/${item.id}`)
                        }
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ================= MOBILE CARD VIEW ================= */}
        <div className="md:hidden space-y-4">
          {internships.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <h2
                className="text-lg font-semibold text-gray-800 cursor-pointer hover:underline"
                onClick={() =>
                  navigate(`/company/dashboard/internships/${item.id}`)
                }
              >
                {item.title}
              </h2>

              <div className="mt-2 text-sm text-gray-600 space-y-1">
                <p className="flex items-center gap-2">
                  <User size={14} /> {item.recruiter}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} /> {item.location}
                </p>
                <p>
                  <strong>Stipend:</strong> {item.stipend}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    item.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {item.status}
                </span>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      navigate(`/company/dashboard/internships/${item.id}`)
                    }
                    className="text-blue-600"
                  >
                    <Eye size={18} />
                  </button>

                  <button
                    onClick={() =>
                      navigate(`/company/dashboard/internships/edit/${item.id}`)
                    }
                    className="text-yellow-600"
                  >
                    <Pencil size={18} />
                  </button>

                  <button className="text-red-600">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </CompanyLayout>
  );
}
