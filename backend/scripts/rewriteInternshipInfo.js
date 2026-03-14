import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";

dotenv.config();

const ROLE_CONTENT = [
  {
    match: /(frontend|react|ui\s*developer)/i,
    about:
      "As a Frontend Developer Intern, you will work closely with product managers and designers to build responsive, accessible, and high-performance user interfaces for real features used by students and recruiters. You will convert wireframes into production-ready components, integrate backend APIs, manage UI state, and improve page performance for mobile and desktop users. The role also includes debugging UI issues, writing clean reusable components, and participating in code reviews to maintain a scalable frontend architecture.",
    whoCanApply:
      "Students from Computer Science, IT, or related backgrounds who have strong fundamentals in HTML, CSS, JavaScript, and React can apply. Candidates should be comfortable building component-based interfaces, handling asynchronous API calls, and using Git for version control. Applicants with project experience in dashboards, authentication flows, form validation, or responsive layouts will be given preference.",
    otherReq:
      "Good understanding of browser behavior, responsive design, and frontend best practices is expected. Familiarity with state management libraries, REST API integration, and basic testing concepts will be considered a strong advantage.",
  },
  {
    match: /(backend|node|api|server)/i,
    about:
      "As a Backend Developer Intern, you will design, build, and maintain secure APIs and business logic that power critical platform features. Your responsibilities include writing scalable endpoints, handling request validation, implementing authentication and authorization rules, and optimizing database operations for speed and reliability. You will collaborate with frontend and product teams to define API contracts, troubleshoot production-like issues, and improve service quality through structured coding practices.",
    whoCanApply:
      "Students with practical knowledge of backend development using Node.js, Express, or similar technologies can apply. Applicants should understand REST API design, database modeling, CRUD operations, and error handling. Candidates who have implemented auth flows, role-based access, and clean service/controller architecture in projects are preferred.",
    otherReq:
      "Strong fundamentals in data structures, asynchronous programming, and secure coding are expected. Familiarity with MongoDB indexing, logging, performance tuning, and testing APIs using tools like Postman is beneficial.",
  },
  {
    match: /(data\s*analyst|analytics|bi|power\s*bi|sql)/i,
    about:
      "As a Data Analyst Intern, you will collect, clean, and analyze internship and user activity data to generate actionable insights for growth and product decisions. You will build reports and dashboards, identify trends in application behavior, and support teams with data-backed recommendations. The role involves writing efficient SQL queries, validating data quality, and presenting findings in a clear and business-friendly format.",
    whoCanApply:
      "Students from engineering, statistics, business analytics, or related disciplines with strong analytical thinking can apply. Applicants should be confident in SQL, Excel, and basic Python for data processing, along with the ability to interpret charts and metrics. Candidates who have worked on dashboards, KPI tracking, or analysis projects will be prioritized.",
    otherReq:
      "Understanding of descriptive statistics, data cleaning workflows, and report storytelling is required. Experience with Power BI, Tableau, or equivalent visualization tools will be a plus.",
  },
  {
    match: /(ai|ml|machine\s*learning|nlp)/i,
    about:
      "As an AI/ML Intern, you will contribute to end-to-end machine learning workflows, including data preparation, feature engineering, model training, evaluation, and improvement. You will work on recommendation and prediction use cases, compare model performance, and document experiments to support iterative enhancements. The role requires close collaboration with product and engineering teams to translate business goals into measurable ML outcomes.",
    whoCanApply:
      "Students with academic or project experience in machine learning, data science, or AI-related fields can apply. Applicants should be comfortable with Python and common ML libraries, and should understand concepts such as overfitting, validation, and performance metrics. Candidates who have built ML projects involving classification, ranking, NLP, or recommendation systems are strongly preferred.",
    otherReq:
      "Hands-on familiarity with Pandas, Scikit-learn, and model evaluation techniques is expected. Knowledge of experiment tracking, model deployment basics, and data preprocessing pipelines will add significant value.",
  },
  {
    match: /(ui\/ux|ux|ui\s*designer|design)/i,
    about:
      "As a UI/UX Design Intern, you will design intuitive user journeys and interfaces for key platform workflows across student and recruiter modules. You will create wireframes, high-fidelity mockups, interactive prototypes, and collaborate with developers to ensure design intent is implemented accurately. The role also includes user research participation, feedback analysis, and iterative design improvements based on usability findings.",
    whoCanApply:
      "Students from design, HCI, multimedia, or related fields with strong visual and interaction design skills can apply. Candidates should be proficient in Figma and demonstrate a portfolio that shows end-to-end design thinking, from problem definition to final UI. Applicants with experience in mobile-first design, dashboard UX, and accessibility-aware design are preferred.",
    otherReq:
      "Knowledge of design systems, spacing/typography hierarchy, and usability principles is required. Ability to communicate design rationale and collaborate effectively with product and engineering teams is important.",
  },
  {
    match: /(devops|cloud|sre)/i,
    about:
      "As a DevOps Intern, you will support deployment automation, CI/CD pipelines, and cloud environment maintenance to ensure reliable software delivery. You will help configure build and release workflows, monitor system health, and participate in debugging infrastructure-related issues. This role focuses on improving deployment consistency, observability, and operational efficiency across services.",
    whoCanApply:
      "Students with strong interest in cloud infrastructure, automation, and system reliability can apply. Applicants should be familiar with Linux commands, basic networking concepts, scripting, and version control workflows. Candidates with project exposure to Docker, CI/CD tools, or cloud platforms such as AWS are preferred.",
    otherReq:
      "Understanding of containerization, environment management, and monitoring fundamentals is expected. Experience with GitHub Actions, Jenkins, or log/metrics tools will be a plus.",
  },
  {
    match: /(qa|test|automation)/i,
    about:
      "As a QA Automation Intern, you will ensure product quality by designing test scenarios, validating requirements, and automating critical regression flows. You will execute functional and API tests, document defects clearly, and collaborate with developers to reproduce and resolve issues quickly. The role contributes directly to release confidence, stability, and user experience consistency.",
    whoCanApply:
      "Students with software testing fundamentals and interest in quality engineering can apply. Applicants should understand test case design, bug lifecycle, and basic scripting for automation tasks. Candidates who have used tools for UI automation, API testing, and defect tracking in academic or personal projects are preferred.",
    otherReq:
      "Attention to detail, structured problem-solving, and clear documentation skills are required. Familiarity with Selenium, Postman, or equivalent testing tools will be considered an advantage.",
  },
  {
    match: /(marketing|seo|growth|content)/i,
    about:
      "As a Digital Marketing Intern, you will plan and execute growth initiatives across organic and paid channels to improve platform visibility and user engagement. You will analyze campaign performance, optimize targeting and messaging, and work with content and design teams to improve conversion outcomes. The role includes funnel analysis, experimentation, and reporting of actionable growth insights.",
    whoCanApply:
      "Students from marketing, business, communications, or related disciplines with strong interest in digital growth can apply. Applicants should understand basic concepts of SEO, paid campaigns, audience segmentation, and performance analytics. Candidates with hands-on project or internship experience in campaign execution and reporting are preferred.",
    otherReq:
      "Strong written communication, analytical mindset, and ability to interpret campaign metrics are expected. Experience with Google Analytics, ad platforms, and content planning tools will be a plus.",
  },
];

const DEFAULT_CONTENT = {
  about:
    "As an intern in this role, you will contribute to live projects, collaborate with cross-functional teams, and deliver outcomes that directly impact product and user experience. You will gain exposure to real workflows, stakeholder communication, and structured execution practices. The internship is designed to build practical skills, ownership, and professional confidence through hands-on tasks and mentorship.",
  whoCanApply:
    "Students from relevant academic backgrounds who are eager to learn, can communicate clearly, and are committed to consistent delivery can apply. Candidates should demonstrate problem-solving ability, willingness to take feedback, and the discipline to work in a collaborative team environment. Prior project experience in the related domain will be considered a strong advantage.",
  otherReq:
    "Basic professional communication, accountability, and time management are expected from all applicants. Candidates should be comfortable with documentation, teamwork, and adapting to evolving project requirements.",
};

const pickContent = (title = "") => {
  const matched = ROLE_CONTENT.find((item) => item.match.test(title));
  return matched || DEFAULT_CONTENT;
};

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    const internships = await Internship.find({}, { _id: 1, title: 1 }).lean();

    if (!internships.length) {
      console.log("No internship records found.");
      process.exit(0);
    }

    const operations = internships.map((internship) => {
      const content = pickContent(internship?.title || "");
      return {
        updateOne: {
          filter: { _id: internship._id },
          update: {
            $set: {
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
    console.error("Failed to rewrite internship info:", error.message);
    process.exit(1);
  }
};

run();
