import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";

dotenv.config();

const ROLE_CATALOG = [
  { title: "Backend (Node.js) Intern", skills: ["Node.js", "Express", "MongoDB", "REST API", "JWT"] },
  { title: "Frontend (React.js) Intern", skills: ["React.js", "JavaScript", "TypeScript", "HTML", "CSS"] },
  { title: "Full Stack Developer Intern", skills: ["React.js", "Node.js", "MongoDB", "REST API", "JavaScript"] },
  { title: "Web Developer Intern", skills: ["HTML", "CSS", "JavaScript", "React.js", "Responsive Design"] },
  { title: "Mobile App Developer (Android/iOS) Intern", skills: ["Kotlin", "Swift", "Flutter", "REST API", "Firebase"] },
  { title: "Software Developer Intern", skills: ["Data Structures", "Algorithms", "OOP", "Git", "Problem Solving"] },
  { title: "Java Developer Intern", skills: ["Java", "Spring Boot", "REST API", "SQL", "OOP"] },
  { title: "Python Developer Intern", skills: ["Python", "Django", "FastAPI", "SQL", "API Development"] },
  { title: ".NET Developer Intern", skills: ["C#", ".NET", "ASP.NET Core", "SQL Server", "Web API"] },
  { title: "AI/ML Intern", skills: ["Python", "Pandas", "Scikit-learn", "Model Training", "Data Preprocessing"] },
  { title: "Data Science Intern", skills: ["Python", "Statistics", "Pandas", "Data Visualization", "Machine Learning"] },
  { title: "Data Analyst Intern", skills: ["SQL", "Excel", "Power BI", "Data Cleaning", "Reporting"] },
  { title: "Cybersecurity Intern", skills: ["Network Security", "OWASP", "Vulnerability Assessment", "SIEM", "Python"] },
  { title: "DevOps Intern", skills: ["Linux", "Docker", "CI/CD", "AWS", "Monitoring"] },
  { title: "Cloud Computing Intern", skills: ["AWS", "Azure", "Cloud Security", "Networking", "Infrastructure"] },
  { title: "UI/UX Designer Intern", skills: ["Figma", "Wireframing", "Prototyping", "User Research", "Design Systems"] },
  { title: "Graphic Designer Intern", skills: ["Photoshop", "Illustrator", "Brand Design", "Typography", "Visual Storytelling"] },
];

const SOFT_SKILLS = [
  "Communication",
  "Collaboration",
  "Time Management",
  "Adaptability",
  "Critical Thinking",
  "Attention to Detail",
  "Ownership",
  "Problem Solving",
];

const titleWithoutIntern = (title = "") => title.replace(/\s*Intern$/i, "").trim();

const buildAbout = (title, skills) => {
  const roleName = titleWithoutIntern(title);
  const skillsText = skills.join(", ");
  return `As a ${roleName}, you will work on live projects and contribute to production-level tasks with mentorship from senior team members. You will implement features, collaborate across teams, and deliver measurable outcomes while following engineering and quality standards. Core tools and competencies expected in this role include ${skillsText}.`;
};

const buildWhoCanApply = (title, skills) => {
  const roleName = titleWithoutIntern(title);
  const skillsText = skills.slice(0, 3).join(", ");
  return `Students from relevant academic backgrounds with strong interest in ${roleName} can apply. Candidates should have hands-on project experience and practical understanding of ${skillsText}. Applicants with internship or real-world project exposure will be preferred.`;
};

const buildOtherReq = (skills, softSkills) => {
  const hardText = skills.join(", ");
  const softText = softSkills.join(", ");
  return `Expected hard skills: ${hardText}. Expected soft skills: ${softText}. Candidates should communicate clearly, follow timelines, and maintain consistent delivery quality.`;
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in environment variables.");

    await mongoose.connect(process.env.MONGO_URI);

    const internships = await Internship.find({}, { _id: 1 }).sort({ createdAt: 1, _id: 1 }).lean();
    if (!internships.length) {
      console.log("No internships found.");
      process.exit(0);
    }

    const operations = internships.map((internship, idx) => {
      const role = ROLE_CATALOG[idx % ROLE_CATALOG.length];
      const soft1 = SOFT_SKILLS[idx % SOFT_SKILLS.length];
      const soft2 = SOFT_SKILLS[(idx + 3) % SOFT_SKILLS.length];
      const softSkills = soft1 === soft2 ? [soft1] : [soft1, soft2];
      const skillReq = [...role.skills, ...softSkills];

      return {
        updateOne: {
          filter: { _id: internship._id },
          update: {
            $set: {
              title: role.title,
              skill_req: skillReq,
              about_work: buildAbout(role.title, role.skills),
              who_can_apply: buildWhoCanApply(role.title, role.skills),
              other_req: buildOtherReq(role.skills, softSkills),
            },
          },
        },
      };
    });

    const result = await Internship.bulkWrite(operations, { ordered: false });
    console.log(`Updated internships: matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`);

    process.exit(0);
  } catch (error) {
    console.error("Failed to apply provided internship role list:", error.message);
    process.exit(1);
  }
};

run();
