export default function Education({ next, back, data, update }) {
  const [education, setEducation] = useState(data || []);

  const addEducation = () => {
    setEducation([
      ...education,
      { degree: "", college: "", start: "", end: "", grade: "" }
    ]);
  };

  const updateField = (index, field, value) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const handleNext = () => {
    update("education", education);
    next();
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Education</h2>

      {education.map((edu, i) => (
        <div key={i} className="border p-4 rounded-lg mb-4">
          <input className="input" placeholder="Degree" value={edu.degree}
            onChange={(e) => updateField(i, "degree", e.target.value)} />

          <input className="input mt-2" placeholder="College Name" value={edu.college}
            onChange={(e) => updateField(i, "college", e.target.value)} />

          <div className="grid grid-cols-2 gap-3 mt-2">
            <input className="input" type="date" value={edu.start}
              onChange={(e) => updateField(i, "start", e.target.value)} />

            <input className="input" type="date" value={edu.end}
              onChange={(e) => updateField(i, "end", e.target.value)} />
          </div>

          <input className="input mt-2" placeholder="Grade / CGPA" value={edu.grade}
            onChange={(e) => updateField(i, "grade", e.target.value)} />
        </div>
      ))}

      <button className="btn-secondary mt-2" onClick={addEducation}>+ Add Education</button>

      <div className="flex justify-between mt-6">
        <button className="btn-secondary" onClick={back}>Back</button>
        <button className="btn-primary" onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}
