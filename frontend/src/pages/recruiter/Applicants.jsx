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
  BriefcaseBusiness,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const STATUS_OPTIONS = ["ALL", "APPLIED", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"];

const STATUS_ACTIONS = [
  { label: "Shortlist", value: "SHORTLISTED" },
  { label: "Interview", value: "INTERVIEW" },
  { label: "Select", value: "SELECTED" },
  { label: "Reject", value: "REJECTED" },
  { label: "Reset", value: "APPLIED" },
];

const PROFILE_BUTTON_CLASS =
  "group inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-gradient-to-r from-indigo-50 to-blue-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 transition hover:from-indigo-100 hover:to-blue-100";

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
      if (typeof item === "string") return { platform: "Profile", url: item };
      return {
        platform: item.platform || item.label || "Profile",
        url: item.url || item.link || "",
      };
    })
    .filter((item) => item && item.url);

const getLatestEducation = (educations) => {
  const list = toArray(educations);
  return list[list.length - 1] || {};
};

const getCurrentCourseFromEducation = (education = {}) =>
  education?.degreeType || education?.fieldOfStudy || education?.courseType || "";

const getCgpaFromEducation = (education = {}) =>
  education?.gradeValue || education?.grade || education?.cgpa || "";

const normalizeStudentProfile = (rawStudent = {}, fallback = {}) => {
  const source = rawStudent?.student || rawStudent?.profile || rawStudent || {};
  const firstName = source.fname || source.firstName || fallback.fname || "";
  const lastName = source.lname || source.lastName || fallback.lname || "";
  const fullName = `${firstName} ${lastName}`.trim() || source.name || fallback.name || "Student";

  const skillsRaw = source.skills ?? fallback.skills ?? [];
  const skills = Array.isArray(skillsRaw)
    ? skillsRaw
    : `${skillsRaw || ""}`
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const latestEducation = getLatestEducation(source.educations ?? fallback.educations);
  const derivedCurrentCourse = getCurrentCourseFromEducation(latestEducation);
  const derivedCgpa = getCgpaFromEducation(latestEducation);

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
    currentCourse: source.currentCourse || source.degree || source.course || derivedCurrentCourse || "",
    cgpa: source.cgpa || source.score || derivedCgpa || "",
    resume: source.resume || fallback.resume || "",
    skills,
    educations: toArray(source.educations),
    socialLinks: normalizeSocialLinks(source.socialLinks),
  };
};

export default function Applicants() {
  const [internships, setInternships] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedInternshipId, setSelectedInternshipId] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [busyKey, setBusyKey] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loadingStudentProfile, setLoadingStudentProfile] = useState(false);

  const studentSkills = Array.isArray(selectedStudent?.skills) ? selectedStudent.skills : [];
  const studentEducations = Array.isArray(selectedStudent?.educations) ? selectedStudent.educations : [];
  const studentSocialLinks = Array.isArray(selectedStudent?.socialLinks) ? selectedStudent.socialLinks : [];

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("recruiterToken");

      const [internshipsRes, applicantsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/recruiter/internships`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE_URL}/api/recruiter/applicants`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const internshipsData = await internshipsRes.json();
      const applicantsData = await applicantsRes.json();

      if (!internshipsRes.ok) throw new Error(internshipsData.message || "Failed to load internships");
      if (!applicantsRes.ok) throw new Error(applicantsData.message || "Failed to load applicants");

      const internshipList = Array.isArray(internshipsData)
        ? internshipsData.map((item) => ({
            id: String(item?._id || ""),
            title: item?.title || "Untitled Internship",
            status: item?.intern_status || "DRAFT",
            createdAt: item?.createdAt || "",
          }))
        : [];

      const applicantList = Array.isArray(applicantsData?.applicants) ? applicantsData.applicants : [];

      setInternships(internshipList);
      setApplicants(applicantList);

      if (internshipList.length) {
        const stillValid = internshipList.some((item) => item.id === selectedInternshipId);
        if (!selectedInternshipId || !stillValid) {
          const byApplicantCount = [...internshipList].sort((a, b) => {
            const aCount = applicantList.filter((x) => String(x.internshipId) === a.id).length;
            const bCount = applicantList.filter((x) => String(x.internshipId) === b.id).length;
            return bCount - aCount;
          });
          setSelectedInternshipId(byApplicantCount[0]?.id || internshipList[0].id);
        }
      } else {
        setSelectedInternshipId("");
      }
    } catch (error) {
      toast.error(error.message || "Unable to load applicants");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setSearch("");
    setStatusFilter("ALL");
  }, [selectedInternshipId]);

  const applicantsBySelectedInternship = useMemo(() => {
    if (!selectedInternshipId) return [];
    return applicants.filter((item) => String(item.internshipId) === String(selectedInternshipId));
  }, [applicants, selectedInternshipId]);

  const selectedInternship = useMemo(
    () => internships.find((item) => item.id === selectedInternshipId) || null,
    [internships, selectedInternshipId]
  );

  const filteredApplicants = useMemo(() => {
    return applicantsBySelectedInternship.filter((item) => {
      const searchTerm = search.trim().toLowerCase();
      const fullText = `${item?.student?.name || ""} ${item?.student?.email || ""}`.toLowerCase();
      const matchesSearch = !searchTerm || fullText.includes(searchTerm);
      const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [applicantsBySelectedInternship, search, statusFilter]);

  const internshipCards = useMemo(() => {
    return internships.map((item) => {
      const count = applicants.filter((x) => String(x.internshipId) === item.id).length;
      return { ...item, applicantCount: count };
    });
  }, [internships, applicants]);

  const stats = useMemo(() => {
    const total = applicantsBySelectedInternship.length;
    const selected = applicantsBySelectedInternship.filter((a) => a.status === "SELECTED").length;
    const inProcess = applicantsBySelectedInternship.filter((a) =>
      ["APPLIED", "SHORTLISTED", "INTERVIEW"].includes(a.status)
    ).length;
    return { total, selected, inProcess };
  }, [applicantsBySelectedInternship]);

  const updateStatus = async (applicant, status) => {
    if (applicant.status === status) return;

    const requestKey = `${applicant.studentId}-${applicant.internshipId}-${status}`;
    setBusyKey(requestKey);

    try {
      const token = localStorage.getItem("recruiterToken");
      const res = await fetch(
        `${API_BASE_URL}/api/recruiter/applications/${applicant.internshipId}/${applicant.studentId}/status`,
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
      if (!res.ok) throw new Error(data.message || "Failed to update status");

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
      const res = await fetch(`${API_BASE_URL}/api/recruiter/students/${applicant.studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch student profile");

      setSelectedStudent(
        normalizeStudentProfile(data.student || data.profile || data, applicant?.student || {})
      );
    } catch (error) {
      toast.error(error.message || "Unable to load student profile");
    } finally {
      setLoadingStudentProfile(false);
    }
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-blue-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-700">Applicant Pipeline</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">Internship Applicants</h1>
              <p className="mt-1 text-sm text-slate-600">
                Select an internship first, then review and manage applicants for that role.
              </p>
            </div>

            <div className="w-full max-w-sm">
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Select Internship
              </label>
              <select
                value={selectedInternshipId}
                onChange={(e) => setSelectedInternshipId(e.target.value)}
                className="w-full rounded-xl border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                disabled={loading || !internships.length}
              >
                {!internships.length ? <option value="">No internships found</option> : null}
                {internshipCards.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.applicantCount})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {selectedInternship ? (
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Users size={16} />
                <span className="text-sm">Applicants</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <CheckCircle2 size={16} />
                <span className="text-sm">Selected</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-emerald-900">{stats.selected}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-2 text-amber-700">
                <Clock3 size={16} />
                <span className="text-sm">In Process</span>
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-900">{stats.inProcess}</p>
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex flex-wrap gap-2">
            {internshipCards.slice(0, 8).map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedInternshipId(item.id)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  selectedInternshipId === item.id
                    ? "border-blue-300 bg-blue-600 text-white"
                    : "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                }`}
              >
                <BriefcaseBusiness size={13} /> {item.title}
                <span className={`rounded-full px-1.5 py-0.5 ${selectedInternshipId === item.id ? "bg-white/20" : "bg-white"}`}>
                  {item.applicantCount}
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by student name or email"
                className="w-full rounded-lg border border-blue-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                disabled={!selectedInternshipId}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              disabled={!selectedInternshipId}
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "ALL" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[960px] w-full text-sm">
              <thead className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Student</th>
                  <th className="px-4 py-3 text-left">Applied On</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Loading applicants...
                    </td>
                  </tr>
                ) : !selectedInternshipId ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Select an internship to view applicants.
                    </td>
                  </tr>
                ) : filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      No applicants found for this internship.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((applicant) => (
                    <tr key={applicant.applicationId} className="border-t border-slate-100 hover:bg-blue-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-700 flex items-center justify-center">
                            {applicant.student.profilePic ? (
                              <img
                                src={applicant.student.profilePic}
                                alt={applicant.student.name}
                                className="h-full w-full object-cover"
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
                      <td className="px-4 py-3 text-slate-700">{formatDate(applicant.appliedAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusClasses(applicant.status)}`}>
                          {applicant.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <button onClick={() => openStudentProfile(applicant)} className={PROFILE_BUTTON_CLASS}>
                            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                              <Eye size={12} />
                            </span>
                            View Profile
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
                              disabled={busyKey === `${applicant.studentId}-${applicant.internshipId}-${action.value}`}
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
        </section>
      </div>

      {selectedStudent ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="mx-auto mt-4 mb-8 max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
            <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-400/20 blur-2xl" />
              <div className="absolute -bottom-16 -left-14 h-52 w-52 rounded-full bg-indigo-400/20 blur-2xl" />
              <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-white/10 text-lg font-semibold">
                    {selectedStudent.profilePic ? (
                      <img
                        src={selectedStudent.profilePic}
                        alt={selectedStudent.fname || "Student"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      `${selectedStudent.fname || selectedStudent.name || "S"}`.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                      {`${selectedStudent.fname || ""} ${selectedStudent.lname || ""}`.trim() ||
                        selectedStudent.name ||
                        "Student Profile"}
                    </h2>
                    <p className="mt-1 text-sm text-blue-100">Candidate Profile for Internship Review</p>
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
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
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
                      {[selectedStudent.city, selectedStudent.state].filter(Boolean).join(", ") || "-"}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Preferences</h3>
                  <div className="mt-2 text-sm text-slate-700">
                    <p>
                      <span className="text-slate-500">Preferred Location:</span> {selectedStudent.preferredLocation || "-"}
                    </p>
                    <p className="mt-2">
                      <span className="text-slate-500">Date of Birth:</span> {formatDate(selectedStudent.dob)}
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
                    {studentSocialLinks.slice(0, 4).map((link, idx) => (
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
                        {`${selectedStudent.fname || ""} ${selectedStudent.lname || ""}`.trim() || selectedStudent.name || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-indigo-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Gender</p>
                      <p className="text-sm font-medium text-slate-900">{selectedStudent.gender || "-"}</p>
                    </div>
                    <div className="rounded-xl border border-blue-200 bg-white p-3">
                      <p className="text-xs text-slate-500">Current Course</p>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedStudent.currentCourse || selectedStudent.degree || "-"}
                      </p>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white p-3">
                      <p className="text-xs text-slate-500">CGPA / Score</p>
                      <p className="text-sm font-medium text-slate-900">{selectedStudent.cgpa || selectedStudent.score || "-"}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Skills</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentSkills.length ? (
                      studentSkills.map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
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
                    <GraduationCap size={16} className="text-slate-600" /> Education
                  </h3>
                  {studentEducations.length ? (
                    <div className="mt-3 space-y-3">
                      {studentEducations.map((edu, idx) => (
                        <div key={`${edu.instituteName || "edu"}-${idx}`} className="rounded-xl border border-amber-200 bg-white p-3">
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
                          {edu.grade || edu.cgpa ? (
                            <p className="mt-1 text-xs text-slate-500">Grade: {edu.grade || edu.cgpa}</p>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-slate-500">No education details found.</p>
                  )}
                </div>
              </div>
            </div>

            {loadingStudentProfile ? (
              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-600">
                Refreshing latest profile details...
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
