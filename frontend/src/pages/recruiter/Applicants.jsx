import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  Eye,
  Download,
  CheckCircle2,
  Clock3,
  Users,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  ExternalLink,
  X,
} from "lucide-react";

const STATUS_OPTIONS = [
  "ALL",
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW",
  "SELECTED",
  "REJECTED",
];

const STATUS_ACTIONS = [
  { label: "Shortlist", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Select", value: "SELECTED" },
  { label: "Reject", value: "REJECTED" },
  { label: "Reset", value: "APPLIED" },
];

const getStatusClasses = (status) => {
  switch (status) {
    case "SHORTLISTED":
      return "bg-indigo-100 text-indigo-700 border-indigo-200";
    case "INTERVIEW":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "SELECTED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "REJECTED":
      return "bg-rose-100 text-rose-700 border-rose-200";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const normalizeSocialLinks = (links) =>
  toArray(links)
    .map((item) => {
      if (!item) return null;
      if (typeof item === "string") {
        return { platform: "Profile", url: item };
      }
      return {
        platform: item.platform || item.label || "Profile",
        url: item.url || item.link || "",
      };
    })
    .filter((item) => item && item.url);

const normalizeStudentProfile = (rawStudent = {}, fallback = {}) => {
  const source = rawStudent?.student || rawStudent?.profile || rawStudent || {};
  const firstName = source.fname || source.firstName || fallback.fname || "";
  const lastName = source.lname || source.lastName || fallback.lname || "";
  const fullName =
    `${firstName} ${lastName}`.trim() ||
    source.name ||
    fallback.name ||
    "Student";

  const skillsRaw = source.skills ?? fallback.skills ?? [];
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw
    : `${skillsRaw || ""}`
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  return {
    ...source,
    ...fallback,
    fname: firstName,
    lname: lastName,
    name: fullName,
    email: source.email || fallback.email || "",
    profilePic: source.profilePic || fallback.profilePic || "",
    phone_no: source.phone_no || source.phone || fallback.phone || "",
    city: source.city || fallback.city || "",
    state: source.state || fallback.state || "",
    preferredLocation:
      source.preferredLocation || source.currentLocation || fallback.preferredLocation || "",
    dob: source.dob || "",
    gender: source.gender || "",
    currentCourse: source.currentCourse || source.degree || source.course || "",
    cgpa: source.cgpa || source.score || "",
    resume: source.resume || fallback.resume || "",
    skills,
    educations: toArray(source.educations),
    socialLinks: normalizeSocialLinks(source.socialLinks),
  };
};

export default function Applicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [internshipFilter, setInternshipFilter] = useState("ALL");
  const [busyKey, setBusyKey] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudentProfile, setLoadingStudentProfile] = useState(false);
  const studentSkills = Array.isArray(selectedStudent?.skills) ? selectedStudent.skills : [];
  const studentEducations = Array.isArray(selectedStudent?.educations)
    ? selectedStudent.educations
    : [];
  const studentSocialLinks = Array.isArray(selectedStudent?.socialLinks)
    ? selectedStudent.socialLinks
    : [];

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch("http://localhost:5000/api/recruiter/applicants", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to load applicants");
      }

      setApplicants(Array.isArray(data.applicants) ? data.applicants : []);
    } catch (error) {
      toast.error(error.message || "Unable to fetch applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  const internships = useMemo(() => {
    const set = new Set(applicants.map((item) => item.internshipTitle).filter(Boolean));
    return ["ALL", ...Array.from(set)];
  }, [applicants]);

  const filteredApplicants = useMemo(() => {
    return applicants.filter((item) => {
      const searchTerm = search.trim().toLowerCase();
      const fullText = `${item?.student?.name || ""} ${item?.student?.email || ""} ${
        item?.internshipTitle || ""
      }`.toLowerCase();

      const matchesSearch = !searchTerm || fullText.includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      const matchesInternship =
        internshipFilter === "ALL" || item.internshipTitle === internshipFilter;

      return matchesSearch && matchesStatus && matchesInternship;
    });
  }, [applicants, search, statusFilter, internshipFilter]);

  const updateStatus = async (applicant, status) => {
    if (applicant.status === status) return;

    const requestKey = `${applicant.studentId}-${applicant.internshipId}-${status}`;
    setBusyKey(requestKey);

    try {
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(
        `http://localhost:5000/api/recruiter/applications/${applicant.internshipId}/${applicant.studentId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update status");
      }

      setApplicants((prev) =>
        prev.map((item) =>
          item.applicationId === applicant.applicationId ? { ...item, status } : item
        )
      );
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error(error.message || "Unable to update status");
    } finally {
      setBusyKey("");
    }
  };

  const openStudentProfile = async (applicant) => {
    try {
      const fallback = normalizeStudentProfile({}, applicant?.student || {});
      setSelectedStudent({
        ...fallback,
        _id: applicant?.studentId || fallback?._id,
      });
      setLoadingStudentProfile(true);
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(`http://localhost:5000/api/recruiter/students/${applicant.studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch student profile");
      }

      setSelectedStudent(normalizeStudentProfile(data.student || data.profile || data, applicant?.student || {}));
    } catch (error) {
      toast.error(error.message || "Unable to load student profile");
    } finally {
      setLoadingStudentProfile(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-700">
              <Users size={16} />
              <span className="text-sm">Total Applicants</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-blue-900">{applicants.length}</p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-700">
              <CheckCircle2 size={16} />
              <span className="text-sm">Selected</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-900">
              {applicants.filter((a) => a.status === "SELECTED").length}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-amber-700">
              <Clock3 size={16} />
              <span className="text-sm">In Process</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-amber-900">
              {
                applicants.filter((a) =>
                  ["APPLIED", "SHORTLISTED", "INTERVIEW"].includes(a.status)
                ).length
              }
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 via-white to-indigo-50 p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="relative md:col-span-1">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, internship"
                className="w-full rounded-lg border border-sky-200 bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All Statuses" : status}
                </option>
              ))}
            </select>

            <select
              value={internshipFilter}
              onChange={(e) => setInternshipFilter(e.target.value)}
              className="rounded-lg border border-sky-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
            >
              {internships.map((title) => (
                <option key={title} value={title}>
                  {title === "ALL" ? "All Internships" : title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-gradient-to-r from-sky-600 to-indigo-600 text-white">
                <tr>
                  <th className="text-left px-4 py-3">Student</th>
                  <th className="text-left px-4 py-3">Internship</th>
                  <th className="text-left px-4 py-3">Applied On</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center px-4 py-8 text-slate-500">
                      Loading applicants...
                    </td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center px-4 py-8 text-slate-500">
                      No applicants found.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.applicationId} className="border-t border-slate-100 hover:bg-sky-50/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center text-xs font-semibold text-slate-700">
                            {applicant.student.profilePic ? (
                              <img
                                src={applicant.student.profilePic}
                                alt={applicant.student.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (applicant.student.name || "S").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{applicant.student.name}</p>
                            <p className="text-xs text-slate-500">{applicant.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700">{applicant.internshipTitle}</td>
                      <td className="px-4 py-3 text-slate-700">
                        {applicant.appliedAt
                          ? new Date(applicant.appliedAt).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(
                            applicant.status
                          )}`}
                        >
                          {applicant.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => openStudentProfile(applicant)}
                            className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-100"
                          >
                            <Eye size={14} />
                            Profile
                          </button>
                          <Link
                            to={`/recruiter/applicants/${applicant.internshipId}/${applicant.studentId}`}
                            className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
                          >
                            Details
                          </Link>
                          {STATUS_ACTIONS.map((action) => (
                            <button
                              key={action.value}
                              onClick={() => updateStatus(applicant, action.value)}
                              disabled={
                                busyKey ===
                                `${applicant.studentId}-${applicant.internshipId}-${action.value}`
                              }
                              className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="max-w-5xl mx-auto mt-4 mb-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-sky-700 to-indigo-700 p-6 text-white">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-sky-400/20 blur-2xl" />
              <div className="absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-indigo-400/20 blur-2xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold flex items-center justify-center overflow-hidden">
                    {selectedStudent.profilePic ? (
                      <img
                        src={selectedStudent.profilePic}
                        alt={selectedStudent.fname || "Student"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      `${selectedStudent.fname || selectedStudent.name || "S"}`
                        .charAt(0)
                        .toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {`${selectedStudent.fname || ""} ${selectedStudent.lname || ""}`.trim() ||
                        selectedStudent.name ||
                        "Student Profile"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-200">
                      Candidate Profile for Internship Review
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="self-start rounded-xl border border-white/20 bg-white/10 p-2 text-slate-100 transition hover:bg-white/20 sm:self-auto"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-12">
              <div className="space-y-4 lg:col-span-4">
                <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <h3 className="text-sm font-semibold text-slate-900">Contact Information</h3>
                    <div className="mt-3 space-y-3 text-sm">
                    <p className="flex items-center gap-2 text-slate-700">
                      <Mail size={15} className="text-slate-500" />
                      {selectedStudent.email || "-"}
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <Phone size={15} className="text-slate-500" />
                      {selectedStudent.phone_no || "-"}
                    </p>
                    <p className="flex items-center gap-2 text-slate-700">
                      <MapPin size={15} className="text-slate-500" />
                      {[selectedStudent.city, selectedStudent.state]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Preferences</h3>
                  <div className="mt-2 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">Preferred Location:</span>{" "}
                      {selectedStudent.preferredLocation || "-"}
                    </p>
                    <p className="mt-2">
                      <span className="text-slate-500">Date of Birth:</span>{" "}
                      {formatDate(selectedStudent.dob)}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Documents & Links</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedStudent.resume ? (
                      <a
                        href={selectedStudent.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        <Download size={14} />
                        View Resume
                      </a>
                    ) : (
                      <span className="text-xs text-slate-500">Resume not uploaded</span>
                    )}
                    {studentSocialLinks
                      .slice(0, 4)
                      .map((link, idx) => (
                        <a
                          key={`${link.url || "social"}-${idx}`}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          <ExternalLink size={13} />
                          {link.platform || "Profile"}
                        </a>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 lg:col-span-8">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Profile Overview</h3>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-blue-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Full Name</p>
                      <p className="text-sm font-medium text-slate-900">
                        {`${selectedStudent.fname || ""} ${selectedStudent.lname || ""}`.trim() ||
                          selectedStudent.name ||
                          "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Gender</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedStudent.gender || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-sky-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Current Course</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedStudent.currentCourse || selectedStudent.degree || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white p-3">
                      <p className="text-xs text-slate-500">CGPA / Score</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedStudent.cgpa || selectedStudent.score || "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentSkills.length ? (
                      studentSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">No skills listed.</p>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <GraduationCap size={16} className="text-slate-600" />
                    Education
                  </h3>
                  {studentEducations.length ? (
                    <div className="mt-3 space-y-3">
                      {studentEducations.map((edu, idx) => (
                        <div
                          key={`${edu.instituteName || "edu"}-${idx}`}
                          className="rounded-xl border border-amber-200 bg-white p-3"
                        >
                          <p className="font-medium text-slate-900">
                            {edu.degreeType || "Degree"}
                            {edu.fieldOfStudy ? ` - ${edu.fieldOfStudy}` : ""}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {edu.instituteName || "-"}
                            {edu.startYear || edu.endYear
                              ? ` (${edu.startYear || "-"} - ${edu.endYear || "-"})`
                              : ""}
                          </p>
                          {(edu.grade || edu.cgpa) && (
                            <p className="mt-1 text-xs text-slate-500">
                              Grade: {edu.grade || edu.cgpa}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No education details found.</p>
                  )}
                </div>
              </div>
            </div>

            {loadingStudentProfile && (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                Refreshing latest profile details...
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
