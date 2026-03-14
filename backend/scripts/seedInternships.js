import dotenv from "dotenv";
import mongoose from "mongoose";
import Internship from "../models/Internship.js";

dotenv.config();

const seedInternships = [
  {
    title: "Frontend Developer Intern",
    skill_req: ["React", "JavaScript", "CSS", "HTML"],
    perks: ["Certificate", "Flexible Hours", "Letter of Recommendation"],
    employment_type: "Part Time",
    workmode: "Remote",
    location: "Bengaluru",
    duration: 3,
    openings: 2,
    starting_date: new Date("2026-03-15"),
    deadline_at: new Date("2026-03-20"),
    stipend_min: 12000,
    stipend_max: 18000,
    intern_status: "ACTIVE",
    is_published: "true",
    about_work: "Build responsive UI components and integrate REST APIs.",
    who_can_apply: "Students in CS/IT with frontend project experience.",
    other_req: "Good understanding of Git and component-based architecture.",
  },
  {
    title: "Backend Node.js Intern",
    skill_req: ["Node.js", "Express", "MongoDB", "REST API"],
    perks: ["Certificate", "Mentorship", "PPO Opportunity"],
    employment_type: "Full Time",
    workmode: "Hybrid",
    location: "Pune",
    duration: 6,
    openings: 3,
    starting_date: new Date("2026-03-18"),
    deadline_at: new Date("2026-03-24"),
    stipend_min: 15000,
    stipend_max: 25000,
    intern_status: "ACTIVE",
    is_published: "true",
    about_work: "Develop APIs, optimize queries, and maintain backend services.",
    who_can_apply: "Students familiar with JavaScript and database fundamentals.",
    other_req: "Knowledge of JWT authentication is preferred.",
  },
  {
    title: "Data Analyst Intern",
    skill_req: ["Python", "SQL", "Excel", "Power BI"],
    perks: ["Certificate", "Performance Bonus", "Learning Budget"],
    employment_type: "Part Time",
    workmode: "Onsite",
    location: "Ahmedabad",
    duration: 4,
    openings: 2,
    starting_date: new Date("2026-03-22"),
    deadline_at: new Date("2026-03-27"),
    stipend_min: 10000,
    stipend_max: 16000,
    intern_status: "ACTIVE",
    is_published: "true",
    about_work: "Analyze hiring and engagement data to generate actionable reports.",
    who_can_apply: "Students from any stream with strong analytical skills.",
    other_req: "Basic statistics and dashboarding experience required.",
  },
  {
    title: "AI/ML Intern",
    skill_req: ["Python", "Machine Learning", "Pandas", "Scikit-learn"],
    perks: ["Research Exposure", "Certificate", "Mentorship"],
    employment_type: "Full Time",
    workmode: "Remote",
    location: "Hyderabad",
    duration: 5,
    openings: 1,
    starting_date: new Date("2026-03-25"),
    deadline_at: new Date("2026-03-30"),
    stipend_min: 18000,
    stipend_max: 30000,
    intern_status: "ACTIVE",
    is_published: "true",
    about_work: "Train and evaluate recommendation models for internship matching.",
    who_can_apply: "Students with ML coursework and practical model-building experience.",
    other_req: "Experience with model evaluation metrics is mandatory.",
  },
  {
    title: "UI/UX Design Intern",
    skill_req: ["Figma", "Wireframing", "Prototyping", "User Research"],
    perks: ["Certificate", "Portfolio Projects", "Flexible Hours"],
    employment_type: "Part Time",
    workmode: "Hybrid",
    location: "Mumbai",
    duration: 3,
    openings: 2,
    starting_date: new Date("2026-03-16"),
    deadline_at: new Date("2026-03-21"),
    stipend_min: 11000,
    stipend_max: 17000,
    intern_status: "ACTIVE",
    is_published: "true",
    about_work: "Design user flows and prototypes for student and recruiter dashboards.",
    who_can_apply: "Students in design or related fields with Figma portfolio.",
    other_req: "Ability to conduct quick usability tests is a plus.",
  },
];

const run = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in environment variables.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    await Internship.insertMany(seedInternships);

    console.log("Inserted 5 internship records successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed internships:", error.message);
    process.exit(1);
  }
};

run();