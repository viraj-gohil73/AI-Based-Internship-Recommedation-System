const SKILL_ALIAS_ENTRIES = [
  // Node.js
  ["nodejs", "Node.js"], ["node js", "Node.js"], ["node.js", "Node.js"],
  ["node-js", "Node.js"], ["node", "Node.js"],

  // React
  ["reactjs", "React"], ["react js", "React"], ["react.js", "React"],
  ["react framework", "React"], ["reactjs developer", "React"],

  // Next.js
  ["nextjs", "Next.js"], ["next js", "Next.js"], ["next.js", "Next.js"],
  ["next framework", "Next.js"],

  // Express
  ["expressjs", "Express"], ["express js", "Express"], ["express.js", "Express"],
  ["express framework", "Express"],

  // MongoDB
  ["mongo db", "MongoDB"], ["mongodb", "MongoDB"],
  ["mongo", "MongoDB"], ["mongo-db", "MongoDB"],

  // REST API
  ["restapi", "REST API"], ["rest api", "REST API"],
  ["restful api", "REST API"], ["rest", "REST API"],

  // JavaScript
  ["js", "JavaScript"], ["javascript", "JavaScript"],
  ["js developer", "JavaScript"],

  // TypeScript
  ["ts", "TypeScript"], ["typescript", "TypeScript"],

  // Python
  ["py", "Python"], ["python3", "Python"],
  ["python developer", "Python"],

  // Java
  ["core java", "Java"], ["java8", "Java"], ["java 8", "Java"],
  ["java developer", "Java"],

  // C++
  ["cpp", "C++"], ["c plus plus", "C++"], ["c plus", "C++"],

  // C#
  ["csharp", "C#"], ["c-sharp", "C#"],

  // HTML/CSS
  ["html5", "HTML"], ["css3", "CSS"],
  ["html css", "Frontend Development"],
  ["html css js", "Frontend Development"],

  // SQL
  ["mysql", "MySQL"], ["postgres", "PostgreSQL"],
  ["postgresql", "PostgreSQL"], ["sql server", "SQL"],
  ["sql db", "SQL"],

  // Git
  ["github", "Git"], ["gitlab", "Git"],
  ["git version control", "Git"],

  // Docker
  ["docker container", "Docker"], ["dockerized", "Docker"],

  // Kubernetes
  ["k8s", "Kubernetes"], ["kubernetes cluster", "Kubernetes"],

  // AWS
  ["aws cloud", "AWS"], ["amazon web services", "AWS"],
  ["aws ec2", "AWS"], ["aws s3", "AWS"],

  // Azure
  ["ms azure", "Azure"], ["microsoft azure", "Azure"],
  ["azure cloud services", "Azure"],

  // GCP
  ["google cloud", "GCP"], ["google cloud platform", "GCP"],
  ["gcp cloud", "GCP"],

  // Firebase
  ["firebase db", "Firebase"], ["firebase firestore", "Firebase"],
  ["firebase auth", "Firebase"],

  // AI / ML
  ["ml", "Machine Learning"], ["machine learning", "Machine Learning"],
  ["ml model", "Machine Learning"],

  ["ai", "Artificial Intelligence"],
  ["artificial intelligence", "Artificial Intelligence"],
  ["ai model", "Artificial Intelligence"],

  // Data
  ["data science", "Data Science"],
  ["data analysis", "Data Analysis"],
  ["data analytics", "Data Analysis"],

  // Roles
  ["backend", "Backend Development"],
  ["backend dev", "Backend Development"],
  ["backend developer", "Backend Development"],

  ["frontend", "Frontend Development"],
  ["frontend dev", "Frontend Development"],
  ["frontend developer", "Frontend Development"],

  ["fullstack", "Full Stack"],
  ["full stack developer", "Full Stack"],

  // DevOps
  ["dev ops", "DevOps"], ["devops engineer", "DevOps"],

  // Linux
  ["unix", "Linux"], ["linux os", "Linux"],

  // Testing
  ["unit testing", "Testing"],
  ["testing automation", "Testing"],
  ["jest testing", "Jest"],

  // Tools
  ["vscode", "VS Code"],
  ["visual studio code", "VS Code"],
  ["vs code editor", "VS Code"],

  ["github","GitHub"],
  ["Github","GitHub"],

  ["git","Git"],
];

const SKILL_ALIAS_MAP = new Map(
  SKILL_ALIAS_ENTRIES.map(([alias, canonical]) => [toAliasKey(alias), canonical])
);

function toAliasKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSingleSkill(value = "") {
  const raw = String(value || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";

  const aliasKey = toAliasKey(raw);
  return SKILL_ALIAS_MAP.get(aliasKey) || raw;
}

export function normalizeSkillArray(input = []) {
  const source = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];

  const result = [];
  const seen = new Set();

  for (const item of source) {
    const normalized = normalizeSingleSkill(item);
    if (!normalized) continue;

    const dedupeKey = toAliasKey(normalized);
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    result.push(normalized);
  }

  return result;
}
