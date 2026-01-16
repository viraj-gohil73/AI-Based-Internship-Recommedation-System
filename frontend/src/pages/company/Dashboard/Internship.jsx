import { useState } from "react";
import { Plus, Pencil, Trash2, Save, Eye } from "lucide-react";
import Input from "../../../components/profile/shared/Input";
import Select from "../../../components/profile/shared/Select";
import { useNavigate } from "react-router-dom";

/* ================= CONSTANT ================= */
const EMPTY_INTERNSHIP = {
  id: null,
  title: "",
  recruiterName: "",
  location: "",
  internshipType: "Remote",
  stipendMin: "",
  stipendMax: "",
  duration: "",
  openings: "",
  status: "Active",
  skills: "",
  description: "",
  startDate: "",
  endDate: "",
};

const ITEMS_PER_PAGE = 15;

/* ================= HELPER ================= */
const getRemainingDays = (endDate) => {
  if (!endDate) return null;
  const today = new Date();
  const end = new Date(endDate);
  return Math.ceil((end - today) / (1000 * 60 * 60 * 24));
};

export default function Internship() {
  const navigate = useNavigate();

  const [internships, setInternships] = useState([
  {
    id: 1,
    title: "Frontend Developer Intern",
    recruiterName: "Amit Sharma",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "8000",
    stipendMax: "12000",
    duration: "3 Months",
    openings: "4",
    status: "Active",
    skills: "HTML, CSS, React",
    description: "Work on real-world React projects and collaborate with the UI team.",
    startDate: "2026-01-01",
    endDate: "2026-02-15",
  },
  {
    id: 2,
    title: "Backend Developer Intern",
    recruiterName: "Priya Nair",
    location: "Bangalore",
    internshipType: "In-Office",
    stipendMin: "10000",
    stipendMax: "15000",
    duration: "6 Months",
    openings: "2",
    status: "Active",
    skills: "Node.js, Express, MongoDB",
    description: "Build scalable APIs and manage database architecture.",
    startDate: "2026-02-01",
    endDate: "2026-03-10",
  },
  {
    id: 3,
    title: "UI/UX Design Intern",
    recruiterName: "Vikram Seth",
    location: "Mumbai",
    internshipType: "Hybrid",
    stipendMin: "5000",
    stipendMax: "8000",
    duration: "2 Months",
    openings: "3",
    status: "Active",
    skills: "Figma, Adobe XD",
    description: "Design user-centric interfaces and wireframes for mobile apps.",
    startDate: "2026-01-15",
    endDate: "2026-02-28",
  },
  {
    id: 4,
    title: "Full Stack Intern",
    recruiterName: "Sanya Gupta",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "15000",
    stipendMax: "20000",
    duration: "6 Months",
    openings: "1",
    status: "Closed",
    skills: "Next.js, PostgreSQL, Tailwind",
    description: "Full ownership of small-scale web applications from scratch.",
    startDate: "2026-01-10",
    endDate: "2026-02-01",
  },
  {
    id: 5,
    title: "Mobile App Intern",
    recruiterName: "Rajesh Kumar",
    location: "Hyderabad",
    internshipType: "In-Office",
    stipendMin: "12000",
    stipendMax: "18000",
    duration: "4 Months",
    openings: "2",
    status: "Active",
    skills: "React Native, Firebase",
    description: "Develop cross-platform mobile features for our e-commerce app.",
    startDate: "2026-02-15",
    endDate: "2026-03-30",
  },
  {
    id: 6,
    title: "Data Science Intern",
    recruiterName: "Ananya Ray",
    location: "Pune",
    internshipType: "Remote",
    stipendMin: "10000",
    stipendMax: "12000",
    duration: "3 Months",
    openings: "5",
    status: "Active",
    skills: "Python, Pandas, Scikit-learn",
    description: "Analyze datasets and build predictive models for sales trends.",
    startDate: "2026-03-01",
    endDate: "2026-04-15",
  },
  {
    id: 7,
    title: "Digital Marketing Intern",
    recruiterName: "Karan Johar",
    location: "Delhi",
    internshipType: "Hybrid",
    stipendMin: "4000",
    stipendMax: "7000",
    duration: "2 Months",
    openings: "10",
    status: "Active",
    skills: "SEO, Google Ads, Content Writing",
    description: "Manage social media campaigns and optimize blog content.",
    startDate: "2026-01-20",
    endDate: "2026-02-20",
  },
  {
    id: 8,
    title: "QA Engineer Intern",
    recruiterName: "Megha Singh",
    location: "Chennai",
    internshipType: "In-Office",
    stipendMin: "9000",
    stipendMax: "11000",
    duration: "6 Months",
    openings: "3",
    status: "Active",
    skills: "Selenium, Jest, Manual Testing",
    description: "Ensure software quality through automated and manual test cases.",
    startDate: "2026-02-10",
    endDate: "2026-03-20",
  },
  {
    id: 9,
    title: "DevOps Intern",
    recruiterName: "Arjun Reddy",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "15000",
    stipendMax: "20000",
    duration: "4 Months",
    openings: "1",
    status: "Pending",
    skills: "Docker, AWS, Jenkins",
    description: "Assist in setting up CI/CD pipelines and managing cloud infra.",
    startDate: "2026-03-15",
    endDate: "2026-04-30",
  },
  {
    id: 10,
    title: "Python Developer Intern",
    recruiterName: "Sneha Kapoor",
    location: "Gurgaon",
    internshipType: "In-Office",
    stipendMin: "10000",
    stipendMax: "14000",
    duration: "3 Months",
    openings: "2",
    status: "Active",
    skills: "Python, Django, SQL",
    description: "Maintain back-end services and integrate third-party APIs.",
    startDate: "2026-02-01",
    endDate: "2026-03-15",
  },
  {
    id: 11,
    title: "Graphic Design Intern",
    recruiterName: "Rohit Verma",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "6000",
    stipendMax: "9000",
    duration: "2 Months",
    openings: "4",
    status: "Active",
    skills: "Photoshop, Illustrator",
    description: "Create marketing banners and branding assets.",
    startDate: "2026-01-25",
    endDate: "2026-03-05",
  },
  {
    id: 12,
    title: "Cybersecurity Intern",
    recruiterName: "Nitin Gadkari",
    location: "Bangalore",
    internshipType: "Hybrid",
    stipendMin: "12000",
    stipendMax: "16000",
    duration: "6 Months",
    openings: "2",
    status: "Active",
    skills: "Penetration Testing, Wireshark",
    description: "Help in identifying vulnerabilities and securing network logs.",
    startDate: "2026-02-20",
    endDate: "2026-04-01",
  },
  {
    id: 13,
    title: "Content Strategy Intern",
    recruiterName: "Pooja Hegde",
    location: "Mumbai",
    internshipType: "Remote",
    stipendMin: "5000",
    stipendMax: "7000",
    duration: "3 Months",
    openings: "5",
    status: "Active",
    skills: "Copywriting, Storyboarding",
    description: "Develop content plans for our SaaS product launch.",
    startDate: "2026-01-12",
    endDate: "2026-02-28",
  },
  {
    id: 14,
    title: "Java Developer Intern",
    recruiterName: "Rahul Dravid",
    location: "Pune",
    internshipType: "In-Office",
    stipendMin: "11000",
    stipendMax: "15000",
    duration: "6 Months",
    openings: "3",
    status: "Active",
    skills: "Java, Spring Boot",
    description: "Work on enterprise-level microservices and legacy code migration.",
    startDate: "2026-02-05",
    endDate: "2026-03-25",
  },
  {
    id: 15,
    title: "Data Analyst Intern",
    recruiterName: "Ishita Bhalla",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "9000",
    stipendMax: "13000",
    duration: "3 Months",
    openings: "2",
    status: "Active",
    skills: "Tableau, Excel, SQL",
    description: "Generate weekly performance reports for the management team.",
    startDate: "2026-01-18",
    endDate: "2026-03-01",
  },
  {
    id: 16,
    title: "Angular Developer Intern",
    recruiterName: "Siddharth Malhotra",
    location: "Ahmedabad",
    internshipType: "Hybrid",
    stipendMin: "10000",
    stipendMax: "14000",
    duration: "4 Months",
    openings: "2",
    status: "Active",
    skills: "Angular, TypeScript, RxJS",
    description: "Build reactive web components for admin dashboards.",
    startDate: "2026-02-12",
    endDate: "2026-03-30",
  },
  {
    id: 17,
    title: "Product Management Intern",
    recruiterName: "Kavya Iyer",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "15000",
    stipendMax: "20000",
    duration: "3 Months",
    openings: "1",
    status: "Active",
    skills: "Agile, Jira, Market Research",
    description: "Conduct competitor analysis and assist in product roadmap planning.",
    startDate: "2026-01-30",
    endDate: "2026-03-10",
  },
  {
    id: 18,
    title: "AI/ML Intern",
    recruiterName: "Manish Pandey",
    location: "Noida",
    internshipType: "In-Office",
    stipendMin: "12000",
    stipendMax: "18000",
    duration: "6 Months",
    openings: "2",
    status: "Active",
    skills: "PyTorch, NLP, OpenCV",
    description: "Implement computer vision algorithms for internal security apps.",
    startDate: "2026-03-05",
    endDate: "2026-04-20",
  },
  {
    id: 19,
    title: "Cloud Architect Intern",
    recruiterName: "Zoya Akhtar",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "14000",
    stipendMax: "19000",
    duration: "5 Months",
    openings: "2",
    status: "Closed",
    skills: "Azure, Terraform, Kubernetes",
    description: "Help optimize cloud costs and architecture scalability.",
    startDate: "2026-01-05",
    endDate: "2026-02-10",
  },
  {
    id: 20,
    title: "PHP Developer Intern",
    recruiterName: "Vijay Sethupathi",
    location: "Chennai",
    internshipType: "In-Office",
    stipendMin: "7000",
    stipendMax: "10000",
    duration: "3 Months",
    openings: "4",
    status: "Active",
    skills: "PHP, Laravel, MySQL",
    description: "Build custom modules for WordPress and Laravel sites.",
    startDate: "2026-02-08",
    endDate: "2026-03-20",
  },
  {
    id: 21,
    title: "Technical Writing Intern",
    recruiterName: "Radhika Apte",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "6000",
    stipendMax: "9000",
    duration: "3 Months",
    openings: "3",
    status: "Active",
    skills: "Markdown, Documentation",
    description: "Write API documentation and developer guides.",
    startDate: "2026-01-22",
    endDate: "2026-03-05",
  },
  {
    id: 22,
    title: "React Developer Intern",
    recruiterName: "Varun Dhawan",
    location: "Kolkata",
    internshipType: "Hybrid",
    stipendMin: "9000",
    stipendMax: "13000",
    duration: "4 Months",
    openings: "2",
    status: "Active",
    skills: "React, Redux, Material UI",
    description: "Convert high-fidelity designs into functional React components.",
    startDate: "2026-02-14",
    endDate: "2026-04-01",
  },
  {
    id: 23,
    title: "Blockchain Intern",
    recruiterName: "Ritesh Deshmukh",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "20000",
    stipendMax: "25000",
    duration: "6 Months",
    openings: "1",
    status: "Active",
    skills: "Solidity, Web3.js, Ethereum",
    description: "Develop smart contracts for decentralized finance protocols.",
    startDate: "2026-03-01",
    endDate: "2026-05-15",
  },
  {
    id: 24,
    title: "Sales & BD Intern",
    recruiterName: "Tara Sutaria",
    location: "Mumbai",
    internshipType: "In-Office",
    stipendMin: "5000",
    stipendMax: "12000",
    duration: "2 Months",
    openings: "8",
    status: "Active",
    skills: "Communication, Cold Calling",
    description: "Generate leads and pitch products to potential B2B clients.",
    startDate: "2026-01-10",
    endDate: "2026-02-15",
  },
  {
    id: 25,
    title: "Vue.js Developer Intern",
    recruiterName: "Farhan Akhtar",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "8000",
    stipendMax: "11000",
    duration: "3 Months",
    openings: "2",
    status: "Active",
    skills: "Vue.js, Vuex, Vite",
    description: "Assist in the frontend development of a real estate platform.",
    startDate: "2026-02-01",
    endDate: "2026-03-15",
  },
  {
    id: 26,
    title: "Embedded Systems Intern",
    recruiterName: "S. Jaishankar",
    location: "Bangalore",
    internshipType: "In-Office",
    stipendMin: "15000",
    stipendMax: "18000",
    duration: "6 Months",
    openings: "2",
    status: "Active",
    skills: "C, Arduino, Raspberry Pi",
    description: "Prototype IoT hardware solutions for smart home automation.",
    startDate: "2026-03-10",
    endDate: "2026-05-20",
  },
  {
    id: 27,
    title: "Game Dev Intern",
    recruiterName: "Akshay Kumar",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "10000",
    stipendMax: "15000",
    duration: "4 Months",
    openings: "3",
    status: "Active",
    skills: "Unity, C#, 3D Modeling",
    description: "Collaborate on level design and character physics in Unity.",
    startDate: "2026-02-20",
    endDate: "2026-04-30",
  },
  {
    id: 28,
    title: "iOS Developer Intern",
    recruiterName: "Alia Bhatt",
    location: "Chandigarh",
    internshipType: "Hybrid",
    stipendMin: "13000",
    stipendMax: "17000",
    duration: "5 Months",
    openings: "2",
    status: "Active",
    skills: "Swift, SwiftUI",
    description: "Assist in building features for our high-rated iOS social app.",
    startDate: "2026-01-25",
    endDate: "2026-03-15",
  },
  {
    id: 29,
    title: "HR Intern",
    recruiterName: "Deepika Padukone",
    location: "Remote",
    internshipType: "Remote",
    stipendMin: "5000",
    stipendMax: "7000",
    duration: "3 Months",
    openings: "2",
    status: "Active",
    skills: "Recruitment, HRMS",
    description: "Screen resumes and coordinate interviews for tech roles.",
    startDate: "2026-01-05",
    endDate: "2026-02-10",
  },
  {
    id: 30,
    title: "Golang Developer Intern",
    recruiterName: "Ranbir Kapoor",
    location: "Gurgaon",
    internshipType: "In-Office",
    stipendMin: "16000",
    stipendMax: "22000",
    duration: "6 Months",
    openings: "2",
    status: "Active",
    skills: "Go, Docker, gRPC",
    description: "Work on high-performance backend systems and streaming data.",
    startDate: "2026-03-15",
    endDate: "2026-05-30",
  }
]);

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_INTERNSHIP);

  /* FILTER STATES */
  const [search, setSearch] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [page, setPage] = useState(1);

  const isFormVisible = editingId !== null;

  /* ================= HANDLERS ================= */

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddNew = () => {
    setFormData({ ...EMPTY_INTERNSHIP, id: Date.now() });
    setEditingId("new");
  };

  const handleEdit = (item) => {
    setFormData({ ...item });
    setEditingId(item.id);
  };

  const handleSave = () => {
    if (editingId === "new") {
      setInternships((prev) => [...prev, formData]);
    } else {
      setInternships((prev) =>
        prev.map((i) => (i.id === editingId ? formData : i))
      );
    }

    setFormData(EMPTY_INTERNSHIP);
    setEditingId(null);
  };

  const handleDelete = (id) => {
    setInternships((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  /* ================= FILTER LOGIC ================= */

  const filteredInternships = internships
    .filter((i) =>
      [i.title, i.recruiterName, i.location]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((i) =>
      filterDate ? i.startDate === filterDate : true
    )
    .filter((i) => {
      if (!filterMonth) return true;
      return (
        new Date(i.startDate).getMonth() + 1 === Number(filterMonth)
      );
    });

  const totalPages = Math.ceil(
    filteredInternships.length / ITEMS_PER_PAGE
  );

  const paginatedInternships = filteredInternships.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= UI ================= */
  return (

      <div className="space-y-4">


        {!isFormVisible && (
          <div className="sticky top-0 z-20 bg-white  px-2 py-3 border-b border-slate-300">
  <div className=" flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-6 px-2">

  {/* 🔍 Search – LEFT */}
  <div className="w-full sm:max-w-sm">
    <input
      placeholder="Search internship..."
      value={search}
      onChange={(e) => {
        setSearch(e.target.value);
        setPage(1);
      }}
      className="w-full px-4 py-2 border rounded-lg"
    />
  </div>

  {/* 📅 Date + Month – RIGHT */}
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full sm:w-auto">
    <input
      type="date"
      value={filterDate}
      onChange={(e) => {
        setFilterDate(e.target.value);
        setPage(1);
      }}
      className="px-4 py-2 border rounded-lg "
    />

    <select
      value={filterMonth}
      onChange={(e) => {
        setFilterMonth(e.target.value);
        setPage(1);
      }}
      className="px-4 py-2 border rounded-lg cursor-pointer"
    >
      <option value="">All Months</option>
      {[...Array(12)].map((_, i) => (
        <option key={i} value={i + 1}>
          {new Date(0, i).toLocaleString("default", {
            month: "long",
          })}
        </option>
      ))}
    </select>
    <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2
              border border-blue-600 text-blue-600 rounded-lg cursor-pointer
              hover:bg-blue-50 text-sm"
            >
              <Plus size={16} /> Post Internship
            </button>
  </div>
      </div>
</div>
        )}

        {/* ================= EDIT / ADD FORM ================= */}
        {isFormVisible && (
          <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4">

            <Input
              label="Internship Title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />

            <Input
              label="Recruiter Name"
              value={formData.recruiterName}
              onChange={(e) =>
                handleChange("recruiterName", e.target.value)
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Location"
                value={formData.location}
                onChange={(e) =>
                  handleChange("location", e.target.value)
                }
              />

              <Select
                label="Internship Type"
                value={formData.internshipType}
                options={["Remote", "In-Office", "Hybrid"]}
                onChange={(val) =>
                  handleChange("internshipType", val)
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  handleChange("startDate", e.target.value)
                }
              />
              <Input
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  handleChange("endDate", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Min Stipend"
                value={formData.stipendMin}
                onChange={(e) =>
                  handleChange("stipendMin", e.target.value)
                }
              />
              <Input
                label="Max Stipend"
                value={formData.stipendMax}
                onChange={(e) =>
                  handleChange("stipendMax", e.target.value)
                }
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Duration"
                value={formData.duration}
                onChange={(e) =>
                  handleChange("duration", e.target.value)
                }
              />
              <Input
                label="Openings"
                value={formData.openings}
                onChange={(e) =>
                  handleChange("openings", e.target.value)
                }
              />
              <Select
                label="Status"
                value={formData.status}
                options={["Active", "Closed", "Pending"]}
                onChange={(val) =>
                  handleChange("status", val)
                }
              />
            </div>

            <Input
              label="Required Skills"
              value={formData.skills}
              onChange={(e) =>
                handleChange("skills", e.target.value)
              }
            />

            <textarea
              rows={3}
              placeholder="Internship Description"
              className="w-full px-4 py-3 rounded-lg border border-slate-300
              focus:ring-2 focus:ring-blue-500 outline-none"
              value={formData.description}
              onChange={(e) =>
                handleChange("description", e.target.value)
              }
            />

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setEditingId(null);
                  setFormData(EMPTY_INTERNSHIP);
                }}
                className="px-4 py-2 text-sm border rounded-lg cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2
                bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer"
              >
                <Save size={16} /> Save Internship
              </button>
            </div>
          </div>
        )}

        {/* ================= CARD GRID ================= */}
        {!isFormVisible && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-2">
            {paginatedInternships.map((item) => {
              const remainingDays = getRemainingDays(item.endDate);
              const isDisabled =
                item.status === "Closed" || remainingDays <= 0;

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-slate-200
                  p-5 hover:shadow-md hover:border-blue-500 transition 
                  flex flex-col gap-4"
                >
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-slate-500">
                    Recruiter: {item.recruiterName}
                  </p>

                  <div className="flex gap-3 mt-auto">
                    <button
                      onClick={() =>
                        navigate(
                          `/company/dashboard/internships/${item.id}`
                        )
                      }
                      className="p-2 border rounded-lg cursor-pointer"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      disabled={isDisabled}
                      onClick={() => handleEdit(item)}
                      className="p-2 border rounded-lg text-blue-600 cursor-pointer"
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      disabled={isDisabled}
                      onClick={() => handleDelete(item.id)}
                      className="p-2 border rounded-lg text-red-600 cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PAGINATION */}
        {!isFormVisible && totalPages > 1 && (
          <div className="flex justify-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
  );
}
