import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";
import Company from "../models/Company.js";

dotenv.config();

const ROLE_CATALOG = [
  {
    key: "frontend-engineer",
    title: "Frontend Engineer Intern",
    skills: ["React", "JavaScript", "TypeScript", "HTML", "CSS"],
    eligible: "B.E./B.Tech/BCA/MCA students with strong frontend fundamentals and project experience in modern web UI.",
    stipend: [12000, 28000],
  },
  {
    key: "backend-engineer",
    title: "Backend Engineer Intern",
    skills: ["Node.js", "Express", "MongoDB", "REST API", "JWT"],
    eligible: "Students from CS/IT background with strong backend fundamentals, API design understanding, and DB modeling basics.",
    stipend: [14000, 32000],
  },
  {
    key: "fullstack-engineer",
    title: "Full Stack Developer Intern",
    skills: ["React", "Node.js", "MongoDB", "JavaScript", "REST API"],
    eligible: "Candidates who can build end-to-end web modules from UI to API and deploy project features independently.",
    stipend: [15000, 35000],
  },
  {
    key: "data-analyst",
    title: "Data Analyst Intern",
    skills: ["SQL", "Excel", "Python", "Power BI", "Statistics"],
    eligible: "Students with analytical thinking and hands-on experience in querying, reporting, and dashboarding workflows.",
    stipend: [10000, 26000],
  },
  {
    key: "business-analyst",
    title: "Business Analyst Intern",
    skills: ["SQL", "Excel", "Documentation", "Stakeholder Communication", "Requirement Analysis"],
    eligible: "Students from engineering, management, or analytics streams with strong documentation and structured problem solving.",
    stipend: [11000, 25000],
  },
  {
    key: "ml-engineer",
    title: "Machine Learning Intern",
    skills: ["Python", "Pandas", "Scikit-learn", "Model Evaluation", "Feature Engineering"],
    eligible: "Students with ML coursework and practical implementation experience in supervised learning and evaluation metrics.",
    stipend: [18000, 40000],
  },
  {
    key: "nlp-engineer",
    title: "NLP Intern",
    skills: ["Python", "NLP", "Transformers", "Text Processing", "Model Fine-tuning"],
    eligible: "Candidates with interest in language models, text analytics, and applied NLP problem-solving can apply.",
    stipend: [18000, 42000],
  },
  {
    key: "uiux-designer",
    title: "UI/UX Design Intern",
    skills: ["Figma", "Wireframing", "Prototyping", "User Research", "Design Systems"],
    eligible: "Design-focused students with portfolio evidence of user-centered product design and interaction workflows.",
    stipend: [10000, 24000],
  },
  {
    key: "product-design",
    title: "Product Design Intern",
    skills: ["Figma", "Interaction Design", "Usability Testing", "Design Thinking", "Prototyping"],
    eligible: "Students who can translate product requirements into intuitive workflows, polished visual layouts, and testable prototypes.",
    stipend: [12000, 26000],
  },
  {
    key: "qa-automation",
    title: "QA Automation Intern",
    skills: ["Selenium", "Postman", "API Testing", "JavaScript", "Test Automation"],
    eligible: "Students with testing basics, defect reporting discipline, and exposure to automation frameworks are preferred.",
    stipend: [11000, 26000],
  },
  {
    key: "devops-cloud",
    title: "DevOps & Cloud Intern",
    skills: ["Docker", "Linux", "CI/CD", "AWS", "Monitoring"],
    eligible: "Candidates familiar with deployment pipelines, containerization concepts, and cloud service fundamentals can apply.",
    stipend: [15000, 32000],
  },
  {
    key: "cybersecurity",
    title: "Cybersecurity Intern",
    skills: ["Network Security", "OWASP", "Vulnerability Assessment", "SIEM", "Python"],
    eligible: "Students interested in application and network security with understanding of secure coding and risk analysis.",
    stipend: [15000, 33000],
  },
  {
    key: "digital-marketing",
    title: "Digital Marketing Intern",
    skills: ["SEO", "Google Analytics", "Content Strategy", "Performance Marketing", "Campaign Reporting"],
    eligible: "Marketing or business students with hands-on campaign execution and growth analytics understanding can apply.",
    stipend: [9000, 22000],
  },
  {
    key: "content-strategy",
    title: "Content Strategy Intern",
    skills: ["Content Writing", "SEO", "Editorial Planning", "Brand Communication", "Analytics"],
    eligible: "Candidates with strong writing quality, audience understanding, and editorial execution discipline are eligible.",
    stipend: [8000, 20000],
  },
  {
    key: "hr-operations",
    title: "HR Operations Intern",
    skills: ["Communication", "MS Excel", "Recruitment Coordination", "Documentation", "Process Management"],
    eligible: "Students from HR, management, or related fields with strong communication and process ownership can apply.",
    stipend: [8000, 18000],
  },
  {
    key: "product-management",
    title: "Product Management Intern",
    skills: ["Product Thinking", "Roadmapping", "Jira", "Data Interpretation", "Requirement Writing"],
    eligible: "Students with structured problem-solving and strong product curiosity who can work with cross-functional teams.",
    stipend: [14000, 30000],
  },
  {
    key: "mobile-android",
    title: "Android Development Intern",
    skills: ["Kotlin", "Android Studio", "REST API", "MVVM", "Git"],
    eligible: "Students with Android fundamentals and app development project experience can apply.",
    stipend: [13000, 30000],
  },
  {
    key: "mobile-flutter",
    title: "Flutter Development Intern",
    skills: ["Flutter", "Dart", "REST API", "State Management", "Firebase"],
    eligible: "Candidates who have built mobile apps using Flutter and can deliver production-ready UI modules are preferred.",
    stipend: [13000, 30000],
  },
  {
    key: "finance-analyst",
    title: "Finance Analyst Intern",
    skills: ["Financial Modeling", "Excel", "Budgeting", "Data Analysis", "Reporting"],
    eligible: "Commerce, finance, or analytics students with strong quantitative and reporting skills can apply.",
    stipend: [10000, 24000],
  },
  {
    key: "operations-analyst",
    title: "Operations Analyst Intern",
    skills: ["Process Analysis", "Excel", "SQL", "SOP Documentation", "Coordination"],
    eligible: "Students with operational thinking and ability to improve process efficiency through data-backed insights can apply.",
    stipend: [10000, 23000],
  },
];

const MODE_CYCLE = ["Hybrid", "Remote", "Onsite"];
const TYPE_CYCLE = ["Full Time", "Part Time", "Full Time", "Full Time"];
const PERKS_POOL = [
  "Certificate",
  "Letter of Recommendation",
  "Mentorship",
  "Flexible Work Hours",
  "PPO Opportunity",
  "Learning Budget",
  "Performance Bonus",
  "Networking Sessions",
  "Hands-on Live Projects",
  "Industry Workshops",
];

const SOFT_SKILLS_POOL = [
  "Problem Solving",
  "Communication",
  "Collaboration",
  "Ownership",
  "Attention to Detail",
  "Time Management",
  "Adaptability",
  "Critical Thinking",
  "Stakeholder Communication",
];

const titleWithoutIntern = (title = "") => title.replace(/\s*Intern$/i, "").trim();

const makePerks = (seed) => [
  PERKS_POOL[seed % PERKS_POOL.length],
  PERKS_POOL[(seed + 3) % PERKS_POOL.length],
  PERKS_POOL[(seed + 6) % PERKS_POOL.length],
];

const buildSkillBundle = (hardSkills = [], seed = 0) => {
  const primaryHard = Array.isArray(hardSkills) ? hardSkills.slice(0, 5) : [];
  const soft1 = SOFT_SKILLS_POOL[seed % SOFT_SKILLS_POOL.length];
  const soft2 = SOFT_SKILLS_POOL[(seed + 3) % SOFT_SKILLS_POOL.length];
  const soft3 = SOFT_SKILLS_POOL[(seed + 6) % SOFT_SKILLS_POOL.length];
  const softSkills = Array.from(new Set([soft1, soft2, soft3]));
  const combined = Array.from(new Set([...primaryHard, ...softSkills])).slice(0, 8);
  return { hardSkills: primaryHard, softSkills, combined };
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const run = async () => {
  try {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing in environment variables.");

    await mongoose.connect(process.env.MONGO_URI);

    const companies = await Company.find({}, { _id: 1, companyName: 1, industry: 1, city: 1 }).lean();
    if (!companies.length) throw new Error("No companies found. Please create company records first.");

    const internships = await Internship.find({}).sort({ createdAt: 1, _id: 1 }).lean();
    if (!internships.length) {
      console.log("No internships found.");
      process.exit(0);
    }

    const companyMap = new Map(companies.map((c) => [String(c._id), c]));
    const companyAssignmentCursor = new Map(companies.map((c) => [String(c._id), 0]));
    const usedRoleByCompany = new Map(companies.map((c) => [String(c._id), new Set()]));

    internships.forEach((internship, idx) => {
      const companyId = String(internship.company_id || "");
      if (!companyMap.has(companyId)) {
        internship.company_id = companies[idx % companies.length]._id;
      }
    });

    const operations = internships.map((internship, idx) => {
      const companyId = String(internship.company_id);
      const company = companyMap.get(companyId) || companies[idx % companies.length];

      const usedSet = usedRoleByCompany.get(companyId) || new Set();
      let cursor = companyAssignmentCursor.get(companyId) || 0;

      let role = null;
      for (let i = 0; i < ROLE_CATALOG.length; i += 1) {
        const candidate = ROLE_CATALOG[(cursor + i) % ROLE_CATALOG.length];
        if (!usedSet.has(candidate.key)) {
          role = candidate;
          cursor = (cursor + i + 1) % ROLE_CATALOG.length;
          break;
        }
      }

      if (!role) {
        role = ROLE_CATALOG[cursor % ROLE_CATALOG.length];
        cursor = (cursor + 1) % ROLE_CATALOG.length;
      }

      usedSet.add(role.key);
      usedRoleByCompany.set(companyId, usedSet);
      companyAssignmentCursor.set(companyId, cursor);

      const workmode = MODE_CYCLE[(idx + cursor) % MODE_CYCLE.length];
      const employmentType = TYPE_CYCLE[(idx + cursor) % TYPE_CYCLE.length];
      const duration = clamp(3 + ((idx + cursor) % 6), 2, 8);
      const openings = clamp(1 + ((idx + cursor) % 5), 1, 6);

      const [baseMin, baseMax] = role.stipend;
      const stipendMin = baseMin + ((idx + cursor) % 4) * 1000;
      const stipendMax = Math.max(stipendMin + 4000, baseMax + ((idx + cursor) % 4) * 1500);

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 2 + (idx % 20));
      const deadlineDate = new Date(startDate);
      deadlineDate.setDate(startDate.getDate() + 10 + ((idx + 3) % 12));

      const location = company.city || internship.location || "Bengaluru";
      const companyName = company.companyName || "Hiring Company";
      const industry = company.industry || "technology";

      const skillBundle = buildSkillBundle(role.skills, idx + cursor);
      const skills = skillBundle.combined;
      const hardSkillsText = skillBundle.hardSkills.join(", ");
      const softSkillsText = skillBundle.softSkills.join(", ");

      const about = `${companyName} is hiring a ${titleWithoutIntern(role.title)} to support live ${industry} workflows and product delivery goals. In this internship, you will work on production-oriented tasks, collaborate with engineering and business stakeholders, and contribute measurable improvements in quality, speed, or user experience. You will own scoped modules, document implementation progress, and continuously optimize your output based on mentor feedback and performance benchmarks.`;

      const whoCanApply = `${companyName} is looking for candidates for the ${titleWithoutIntern(role.title)} role. ${role.eligible} Candidates available for ${workmode.toLowerCase()} collaboration from ${location} or nearby regions, with consistent communication and practical project evidence, will be prioritized for shortlisting. Expected hard skills: ${hardSkillsText}. Expected soft skills: ${softSkillsText}.`;

      const otherReq = `Preferred from ${location} or nearby regions for smoother coordination, though ${workmode.toLowerCase()} mode candidates are also considered based on role fit. Basic professional discipline, regular reporting, and willingness to learn domain context in ${industry} are mandatory. Skill framework: hard skills (${hardSkillsText}) + soft skills (${softSkillsText}).`;

      return {
        updateOne: {
          filter: { _id: internship._id },
          update: {
            $set: {
              company_id: company._id,
              title: role.title,
              skill_req: skills,
              perks: makePerks(idx + cursor),
              employment_type: employmentType,
              workmode,
              location,
              duration,
              openings,
              starting_date: startDate,
              deadline_at: deadlineDate,
              stipend_min: stipendMin,
              stipend_max: stipendMax,
              intern_status: "ACTIVE",
              is_published: "true",
              about_work: about,
              who_can_apply: whoCanApply,
              other_req: otherReq,
            },
          },
        },
      };
    });

    const result = await Internship.bulkWrite(operations, { ordered: false });

    const finalRows = await Internship.find({}, { company_id: 1, title: 1, skill_req: 1, about_work: 1, who_can_apply: 1 }).lean();

    const companyRoleCount = new Map();
    let duplicateCompanyRole = 0;
    finalRows.forEach((row) => {
      const key = `${String(row.company_id || "na")}::${String(row.title || "").toLowerCase()}`;
      const count = (companyRoleCount.get(key) || 0) + 1;
      companyRoleCount.set(key, count);
      if (count > 1) duplicateCompanyRole += 1;
    });

    const exactAboutDuplicates = finalRows.length - new Set(finalRows.map((r) => r.about_work || "")).size;
    const exactWhoDuplicates = finalRows.length - new Set(finalRows.map((r) => r.who_can_apply || "")).size;
    const missingSoftOrHardCount = finalRows.filter((row) => {
      const list = Array.isArray(row.skill_req) ? row.skill_req : [];
      const softCount = list.filter((item) => SOFT_SKILLS_POOL.includes(item)).length;
      const hardCount = list.length - softCount;
      return softCount < 2 || hardCount < 4;
    }).length;

    console.log(`Updated internships: matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`);
    console.log(
      `Validation: duplicateCompanyRole=${duplicateCompanyRole}, exactAboutDuplicates=${exactAboutDuplicates}, exactWhoCanApplyDuplicates=${exactWhoDuplicates}, missingSoftOrHardCount=${missingSoftOrHardCount}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to rebuild internship data:", error.message);
    process.exit(1);
  }
};

run();
