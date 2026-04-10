import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";

dotenv.config();

const ROLE_CONTENT = [
  {
    match: /(frontend|react|ui\s*developer)/i,
    about:
      "As a Frontend Developer Intern, you will build responsive, accessible, and high-performance user interfaces used by students and recruiters. You will convert designs into reusable components, integrate APIs, and improve UX quality across devices.",
    whoCanApply:
      "Students from Computer Science, IT, or related backgrounds with strong fundamentals in HTML, CSS, JavaScript, and React can apply. Candidates with portfolio projects in dashboards, authentication, and API integration are preferred.",
    otherReq:
      "Understanding of responsive design, browser behavior, and component architecture is expected. Familiarity with Git and basic testing is a plus.",
  },
  {
    match: /(backend|node|python|django|flask|fastapi|api|server)/i,
    about:
      "As a Backend Developer Intern, you will build and maintain APIs, business logic, and database flows that power platform features. You will work on validation, authentication, performance, and reliability in production-like workflows.",
    whoCanApply:
      "Students with practical backend experience using Node.js or Python stacks can apply. Applicants should understand REST APIs, database operations, and clean service-layer coding.",
    otherReq:
      "Strong problem-solving, asynchronous programming, and secure coding basics are expected. Exposure to MongoDB, SQL, and API testing tools is beneficial.",
  },
  {
    match: /(data\s*analyst|analytics|bi|power\s*bi|sql)/i,
    about:
      "As a Data Analyst Intern, you will clean and analyze data, build reports, and share insights to support product and growth decisions. You will track trends and convert raw data into clear business recommendations.",
    whoCanApply:
      "Students from engineering, statistics, business analytics, or related fields with strong SQL and analytical skills can apply. Candidates with dashboard or reporting project experience are preferred.",
    otherReq:
      "Understanding of data cleaning, KPI tracking, and storytelling through dashboards is required. Experience with Power BI or Tableau is a plus.",
  },
  {
    match: /(ai|ml|machine\s*learning|nlp)/i,
    about:
      "As an AI/ML Intern, you will support data preparation, model training, evaluation, and iterative improvements for recommendation and prediction use cases.",
    whoCanApply:
      "Students with ML project or academic experience and strong Python fundamentals can apply. Candidates should understand model validation and performance metrics.",
    otherReq:
      "Hands-on familiarity with Pandas and Scikit-learn is expected. Knowledge of experiment tracking and deployment basics is a plus.",
  },
  {
    match: /(ui\/?ux|ux|ui\s*designer|design)/i,
    about:
      "As a UI/UX Design Intern, you will create user journeys, wireframes, and high-fidelity screens for key workflows while collaborating with product and engineering teams.",
    whoCanApply:
      "Students from design, HCI, multimedia, or related fields with strong Figma skills and portfolio-driven design thinking can apply.",
    otherReq:
      "Knowledge of usability principles, typography, spacing systems, and design handoff practices is expected.",
  },
  {
    match: /(devops|cloud|sre)/i,
    about:
      "As a DevOps Intern, you will support CI/CD automation, cloud deployment practices, and infrastructure reliability for smooth software delivery.",
    whoCanApply:
      "Students interested in cloud, automation, and system reliability with Linux and scripting basics can apply.",
    otherReq:
      "Understanding of Docker, CI/CD workflows, and environment configuration is beneficial.",
  },
  {
    match: /(qa|test|automation)/i,
    about:
      "As a QA Automation Intern, you will design test scenarios, validate requirements, and automate critical regression flows for reliable releases.",
    whoCanApply:
      "Students with software testing fundamentals and basic automation scripting can apply. Candidates with API and UI test project exposure are preferred.",
    otherReq:
      "Strong attention to detail and defect documentation skills are required. Familiarity with Selenium/Postman is a plus.",
  },
  {
    match: /(marketing|seo|growth|content)/i,
    about:
      "As a Digital Marketing Intern, you will execute growth campaigns, analyze channel performance, and optimize acquisition and engagement funnels.",
    whoCanApply:
      "Students from marketing, business, or communications backgrounds with campaign and analytics interest can apply.",
    otherReq:
      "Good written communication and performance analysis skills are expected. Experience with analytics and ads tools is a plus.",
  },
];

const DEFAULT_CONTENT = {
  about:
    "As an intern in this role, you will contribute to live projects, collaborate with cross-functional teams, and deliver practical outcomes with mentorship support.",
  whoCanApply:
    "Students from relevant academic backgrounds with strong learning attitude and problem-solving ability can apply.",
  otherReq:
    "Clear communication, accountability, and consistency in delivery are expected.",
};

const cleanBaseTitle = (title = "") =>
  String(title || "")
    .replace(/\s*#\d+\s*$/i, "")
    .replace(/\bdevloper\b/gi, "Developer")
    .replace(/\breactjs\b/gi, "React.js")
    .replace(/\bnodejs\b/gi, "Node.js")
    .trim();

const getTextBlob = (internship = {}) => {
  const parts = [
    internship?.title || "",
    internship?.about_work || "",
    internship?.who_can_apply || "",
    internship?.other_req || "",
    ...(Array.isArray(internship?.skill_req) ? internship.skill_req : []),
  ];
  return parts.join(" ").toLowerCase();
};

const normalizeTitle = (internship = {}) => {
  const title = cleanBaseTitle(internship?.title || "");
  const text = getTextBlob(internship);

  if (/(python|django|flask|fastapi)\b/i.test(text)) return "Python Developer Intern";
  if (/(react|next\.js|nextjs)\b/i.test(text)) return "React.js Developer Intern";
  if (/(node\.js|nodejs|express)\b/i.test(text)) return "Node.js Developer Intern";
  if (/full\s*stack/i.test(text)) return "Full Stack Developer Intern";

  if (/(data\s*analyst|analytics|power\s*bi|tableau|sql)\b/i.test(text)) return "Data Analyst Intern";
  if (/(machine\s*learning|\bai\b|\bnlp\b|scikit|tensorflow|pytorch)\b/i.test(text)) return "AI/ML Intern";
  if (/(ui\/?ux|product\s*design|figma|ux\s*designer|ui\s*designer)\b/i.test(text)) return "UI/UX Design Intern";
  if (/(qa|automation|testing|selenium)\b/i.test(text)) return "QA Automation Intern";
  if (/(devops|cloud|kubernetes|docker|aws)\b/i.test(text)) return "DevOps Intern";
  if (/(marketing|seo|growth|content)\b/i.test(text)) return "Digital Marketing Intern";

  if (/frontend\s*engineer/i.test(title)) return "React.js Developer Intern";
  if (/backend\s*engineer/i.test(title)) return "Backend Developer Intern";

  return title || "Internship Intern";
};

const pickContent = (title = "") => ROLE_CONTENT.find((item) => item.match.test(title)) || DEFAULT_CONTENT;

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const internships = await Internship.find(
      {},
      { _id: 1, title: 1, skill_req: 1, about_work: 1, who_can_apply: 1, other_req: 1 }
    ).lean();

    if (!internships.length) {
      console.log("No internship records found.");
      process.exit(0);
    }

    const operations = internships.map((internship) => {
      const nextTitle = normalizeTitle(internship);
      const content = pickContent(nextTitle);

      return {
        updateOne: {
          filter: { _id: internship._id },
          update: {
            $set: {
              title: nextTitle,
              about_work: content.about,
              who_can_apply: content.whoCanApply,
              other_req: content.otherReq,
            },
          },
        },
      };
    });

    const result = await Internship.bulkWrite(operations, { ordered: false });

    console.log(
      `Updated internships: matched=${result.matchedCount || 0}, modified=${result.modifiedCount || 0}`
    );

    process.exit(0);
  } catch (error) {
    console.error("Failed to standardize internship title and requirements:", error.message);
    process.exit(1);
  }
};

run();
