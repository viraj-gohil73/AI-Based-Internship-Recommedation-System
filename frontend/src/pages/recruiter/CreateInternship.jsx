import { useEffect, useState } from "react";
import { X, Calendar, Check, AlertCircle, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function RecruiterInternshipForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    internship_type: "",
    employment_type: "",
    mode: "",
    location: "",
    duration_months: "",
    openings: "",
    start_date: "",
    apply_by_date: "",
    is_paid: true,
    stipend_min: "",
    stipend_max: "",
    about_work: "",
    who_can_apply: "",
    other_requirements: "",
    publish: true,
  });

  const [skillInput, setSkillInput] = useState("");
  const [perkInput, setPerkInput] = useState("");
  const [skills, setSkills] = useState([]);
  const [perks, setPerks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [postingLimits, setPostingLimits] = useState({
    maxActivePostings: null,
    activePostingsCount: 0,
  });

  useEffect(() => {
    const fetchPostingLimits = async () => {
      try {
        const token = localStorage.getItem("recruiterToken");
        const res = await fetch("http://localhost:5000/api/recruiter/subscription/current", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) return;
        setPostingLimits({
          maxActivePostings: data?.entitlements?.limits?.maxActivePostings ?? null,
          activePostingsCount: data?.usage?.activePostingsCount ?? 0,
        });
      } catch (err) {
        setPostingLimits({
          maxActivePostings: null,
          activePostingsCount: 0,
        });
      }
    };

    fetchPostingLimits();
  }, []);

  const postingLimitReached =
    postingLimits.maxActivePostings !== null &&
    postingLimits.maxActivePostings !== undefined &&
    postingLimits.activePostingsCount >= postingLimits.maxActivePostings;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
    setError(""); // Clear error on input change
  };

  const togglePaid = () => {
    setForm({ ...form, is_paid: !form.is_paid });
  };

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) =>
    setSkills(skills.filter((s) => s !== skill));

  const addPerk = () => {
    if (perkInput.trim() && !perks.includes(perkInput.trim())) {
      setPerks([...perks, perkInput.trim()]);
      setPerkInput("");
    }
  };

  const removePerk = (perk) =>
    setPerks(perks.filter((p) => p !== perk));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (postingLimitReached) {
      setError(
        `Active posting limit reached (${postingLimits.activePostingsCount}/${postingLimits.maxActivePostings}).`
      );
      return;
    }
    setLoading(true);

    const token = localStorage.getItem("recruiterToken");
    
    const payload = {
      ...form,
      skill_req: skills,
      perks,
      intern_status: form.publish ? "ACTIVE" : "DRAFT",
      is_published: form.publish,
    };

    try {
      const res = await fetch("http://localhost:5000/api/internships", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to post internship");
      }

      const data = await res.json();
      setSuccess(true);
      console.log("SUCCESS:", data);

      setTimeout(() => {
        setSuccess(false);
        // Reset form or redirect
        // navigate("/recruiter/internships");
      }, 2000);
    } catch (error) {
      setError(error.message);
      console.error("ERROR:", error.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-3 py-6 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">Post Internship</h1>
              <p className="mt-1 text-sm text-blue-100">Create and publish a new internship opportunity</p>
            </div>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          </div>
          {postingLimitReached && (
            <div className="mx-5 my-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              Posting limit reached ({postingLimits.activePostingsCount}/{postingLimits.maxActivePostings}).
            </div>
          )}
        </motion.div>

        {/* Success Alert */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3"
            >
              <Check className="text-green-600" size={20} />
              <span className="text-green-700 font-medium">Internship posted successfully!</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
            >
              <AlertCircle className="text-red-600" size={20} />
              <span className="text-red-700 font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-8"
        >
          {/* BASIC INFO */}
          <Section title="Basic Information" delay={0.2}>
            <Grid>
              <Input label="Internship Title" name="title" onChange={handleChange} required />
              <Select label="Internship Type" name="internship_type" options={["Internship", "Internship + PPO"]} onChange={handleChange} />
              <Select label="Employment Type" name="employment_type" options={["Full Time", "Part Time"]} onChange={handleChange} />
              <Select label="Work Mode" name="mode" options={["Remote", "Onsite", "Hybrid"]} onChange={handleChange} />
              <Input label="Location" name="location" onChange={handleChange} />
              <Input label="Duration (months)" name="duration_months" type="number" onChange={handleChange} />
              <Input label="Openings" name="openings" type="number" onChange={handleChange} />
            </Grid>
          </Section>

          {/* TIMELINE */}
          <Section title="Timeline" delay={0.3}>
            <Grid>
              <Input label="Start Date" name="start_date" type="date" icon={<Calendar size={16} />} onChange={handleChange} />
              <Input label="Apply By Date" name="apply_by_date" type="date" icon={<Calendar size={16} />} onChange={handleChange} />
            </Grid>
          </Section>

          {/* STIPEND */}
          <Section title="Stipend" delay={0.4}>
            <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: form.is_paid ? 360 : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-white rounded-full"
                  >
                    <span className={form.is_paid ? "text-blue-600 text-lg" : "text-gray-400 text-lg"}>INR</span>
                  </motion.div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">
                      {form.is_paid ? "Paid Internship" : "Unpaid"}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {form.is_paid
                        ? "Provide stipend details"
                        : "No stipend offered"}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={togglePaid}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-300 flex-shrink-0 ${
                    form.is_paid
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gray-300"
                  }`}
                >
                  <motion.div
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 700,
                      damping: 30,
                    }}
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg ${
                      form.is_paid ? "right-1" : "left-1"
                    }`}
                  >
                    <motion.div
                      animate={{
                        scale: form.is_paid ? 1 : 0,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check size={14} className="text-blue-600" />
                    </motion.div>
                  </motion.div>
                </motion.button>
              </div>
            </div>

            <AnimatePresence>
              {form.is_paid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <Grid>
                    <Input label="Stipend Min (INR)" name="stipend_min" type="number" onChange={handleChange} />
                    <Input label="Stipend Max (INR)" name="stipend_max" type="number" onChange={handleChange} />
                  </Grid>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>

          {/* SKILLS */}
          <Section title="Required Skills" delay={0.5}>
            <ChipInput
              value={skillInput}
              setValue={setSkillInput}
              onAdd={addSkill}
              chips={skills}
              onRemove={removeSkill}
              placeholder="e.g. React"
            />
          </Section>

          {/* PERKS */}
          <Section title="Perks" delay={0.6}>
            <ChipInput
              value={perkInput}
              setValue={setPerkInput}
              onAdd={addPerk}
              chips={perks}
              onRemove={removePerk}
              placeholder="Certificate, PPO"
            />
          </Section>

          {/* DETAILS */}
          <Section title="Internship Details" delay={0.7}>
            <Textarea label="About the Work" name="about_work" onChange={handleChange} />
            <Textarea label="Who Can Apply" name="who_can_apply" onChange={handleChange} />
            <Textarea label="Other Requirements" name="other_requirements" onChange={handleChange} />
          </Section>

          {/* PUBLISH */}
          <Section title="Publication Status" delay={0.8}>
            <div className="rounded-lg border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: form.publish ? 360 : 0,
                    }}
                    transition={{ duration: 0.6 }}
                    className="p-2 bg-white rounded-full"
                  >
                    {form.publish ? (
                      <Eye className="text-blue-600" size={18} />
                    ) : (
                      <EyeOff className="text-gray-400" size={18} />
                    )}
                  </motion.div>

                  <div>
                    <h3 className="font-semibold text-sm text-gray-800">
                      {form.publish ? "Publish Immediately" : "Save as Draft"}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {form.publish
                        ? "Visible to students"
                        : "Not visible yet"}
                    </p>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, publish: !form.publish })
                  }
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className={`relative h-7 w-12 rounded-full transition-colors duration-300 flex-shrink-0 ${
                    form.publish
                      ? "bg-gradient-to-r from-blue-500 to-indigo-500"
                      : "bg-gray-300"
                  }`}
                >
                  <motion.div
                    layout
                    transition={{
                      type: "spring",
                      stiffness: 700,
                      damping: 30,
                    }}
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-lg ${
                      form.publish ? "right-1" : "left-1"
                    }`}
                  >
                    <motion.div
                      animate={{
                        scale: form.publish ? 1 : 0,
                      }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <Check size={14} className="text-blue-600" />
                    </motion.div>
                  </motion.div>
                </motion.button>
              </div>

              <AnimatePresence>
                {form.publish && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 border-t border-blue-200 pt-2"
                  >
                    <div className="flex items-center gap-2 rounded bg-blue-50 px-2 py-1.5 text-xs text-blue-700">
                      <Check size={12} />
                      <span>Ready to accept applications</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Section>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex justify-end pt-6"
          >
            <motion.button
              type="submit"
              disabled={loading || postingLimitReached}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`relative px-10 py-3 rounded-xl font-bold text-md text-white transition overflow-hidden shadow-lg ${
                loading
                  ? "cursor-not-allowed bg-blue-300"
                  : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              }`}
            >
              <motion.span
                animate={{ opacity: loading ? 0 : 1 }}
                transition={{ duration: 0.2 }}
              >
                {form.publish ? "Post Internship" : "Save Draft"}
              </motion.span>
              {loading && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                  />
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </div>
  );
}

/* ---------- UI COMPONENTS ---------- */

function Section({ title, children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <h2 className="mb-4 border-b-2 border-blue-200 pb-3 text-lg font-semibold text-slate-800">
        {title}
      </h2>
      {children}
    </motion.div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function Input({ label, name, type = "text", icon, onChange, required = false }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <div className="relative">
        {icon && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-3 top-2.5 text-blue-500"
          >
            {icon}
          </motion.span>
        )}
        <motion.input
          name={name}
          type={type}
          required={required}
          onChange={onChange}
          whileFocus={{ scale: 1.01 }}
          className={`w-full rounded-lg border-2 border-slate-200 px-3 py-2.5 transition ${
            icon ? "pl-10" : ""
          } focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none`}
        />
      </div>
    </motion.div>
  );
}

function Textarea({ label, name, onChange }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <motion.textarea
        name={name}
        rows="3"
        onChange={onChange}
        whileFocus={{ scale: 1.01 }}
        className="w-full resize-none rounded-lg border-2 border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
      />
    </motion.div>
  );
}

function Select({ label, name, options, onChange }) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <label className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <motion.select
        name={name}
        onChange={onChange}
        whileFocus={{ scale: 1.01 }}
        className="w-full cursor-pointer rounded-lg border-2 border-slate-200 bg-white px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
      >
        <option value="">Select</option>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </motion.select>
    </motion.div>
  );
}

function ChipInput({ value, setValue, onAdd, chips, onRemove, placeholder }) {
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onAdd();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <motion.input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          whileFocus={{ scale: 1.01 }}
          className="flex-1 rounded-lg border-2 border-slate-200 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
        />
        <motion.button
          type="button"
          onClick={onAdd}
          whileHover={{ scale: 1.05, backgroundColor: "#1d4ed8" }}
          whileTap={{ scale: 0.95 }}
          className="rounded-lg bg-blue-600 px-6 font-medium text-white transition"
        >
          Add
        </motion.button>
      </div>

      <motion.div layout className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {chips.map((chip) => (
            <motion.span
              key={chip}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700"
            >
              {chip}
              <motion.button
                type="button"
                onClick={() => onRemove(chip)}
                whileHover={{ rotate: 90, scale: 1.2 }}
                whileTap={{ scale: 0.8 }}
              >
                <X size={14} className="cursor-pointer" />
              </motion.button>
            </motion.span>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
