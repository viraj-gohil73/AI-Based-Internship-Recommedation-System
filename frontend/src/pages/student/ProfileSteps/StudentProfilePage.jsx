import { useState } from "react";
import { Pencil } from "lucide-react";
import EditModal from "./EditModal";

export default function StudentProfilePage() {
  const [modal, setModal] = useState({ open: false, section: null });

  const openModal = (section) => {
    setModal({ open: true, section });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-10">

      {/* About Section */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">About</h2>
          <Pencil size={18} className="text-gray-500 cursor-pointer" onClick={() => openModal("about")} />
        </div>
        <p className="text-gray-600 mt-1">
          Craft an engaging story in your bio and make impactful connections.
        </p>
        <button className="text-blue-600 mt-2 font-medium" onClick={() => openModal("about")}>
          Add / Edit About
        </button>
      </div>

      <hr />

      {/* Resume Section */}
      <div className="p-5 border rounded-xl bg-blue-50 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-blue-900">Add your Resume & auto-fill your profile</h3>
          <p className="text-gray-700 text-sm mt-1">
            Upload your resume to auto-fill skills, projects, experience & more.
          </p>

          <button className="text-blue-600 mt-2 font-medium">Upload Resume</button>
        </div>

        <img
          src="https://cdn-icons-png.flaticon.com/512/9073/9073573.png"
          className="w-20 opacity-70"
          alt=""
        />
      </div>

      <hr />

      {/* Skills */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Pencil size={18} className="text-gray-500 cursor-pointer" onClick={() => openModal("skills")} />
        </div>

        <div className="flex flex-wrap gap-3 mt-3">
          {["HTML", "CSS", "JavaScript", "React"].map((skill, i) => (
            <span
              key={i}
              className="px-4 py-1 border rounded-full bg-gray-100 text-gray-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <hr />

      {/* Work Experience */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Work Experience</h2>
          <Pencil size={18} className="text-gray-500 cursor-pointer" onClick={() => openModal("work")} />
        </div>
        <p className="text-gray-600 mt-1">
          Narrate your professional journey and fast-track your way to new opportunities.
        </p>
        <button className="text-blue-600 mt-2 font-medium" onClick={() => openModal("work")}>
          Add Work Experience
        </button>
      </div>

      <hr />

      {/* Education */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Education</h2>
          <Pencil size={18} className="text-gray-500 cursor-pointer" onClick={() => openModal("education")} />
        </div>
        <p className="text-gray-600 mt-1">
          Showcase your academic journey and open doors to career opportunities.
        </p>
        <button className="text-blue-600 mt-2 font-medium" onClick={() => openModal("education")}>
          Add Education
        </button>
      </div>

      {/* Edit Modal */}
      {modal.open && (
        <EditModal section={modal.section} close={() => setModal({ open: false })} />
      )}
    </div>
  );
}
