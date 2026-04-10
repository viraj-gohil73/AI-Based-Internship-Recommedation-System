const SKILL_ALIAS_ENTRIES = [
  ["nodejs", "Node.js"], ["node js", "Node.js"], ["node.js", "Node.js"], ["node-js", "Node.js"], ["node", "Node.js"],
  ["reactjs", "React"], ["react js", "React"], ["react.js", "React"], ["react framework", "React"], ["reactjs developer", "React"],
  ["angularjs", "Angular"], ["angular js", "Angular"], ["angular.js", "Angular"], ["angular framework", "Angular"], ["angular developer", "Angular"],
  ["nextjs", "Next.js"], ["next js", "Next.js"], ["next.js", "Next.js"], ["next framework", "Next.js"],
  ["expressjs", "Express"], ["express js", "Express"], ["express.js", "Express"], ["express framework", "Express"],
  ["mongo db", "MongoDB"], ["mongodb", "MongoDB"], ["mongo", "MongoDB"], ["mongo-db", "MongoDB"],
  ["restapi", "REST API"], ["rest api", "REST API"], ["restful api", "REST API"], ["rest", "REST API"],
  ["js", "JavaScript"], ["javascript", "JavaScript"], ["js developer", "JavaScript"],
  ["ts", "TypeScript"], ["typescript", "TypeScript"],
  ["py", "Python"], ["python3", "Python"], ["python developer", "Python"],
  ["core java", "Java"], ["java8", "Java"], ["java 8", "Java"], ["java developer", "Java"],
  ["cpp", "C++"], ["c plus plus", "C++"], ["c plus", "C++"],
  ["csharp", "C#"], ["c-sharp", "C#"],
  ["html5", "HTML"], ["css3", "CSS"], ["html css", "Frontend Development"], ["html css js", "Frontend Development"],
  ["mysql", "MySQL"], ["postgres", "PostgreSQL"], ["postgresql", "PostgreSQL"], ["sql server", "SQL"], ["sql db", "SQL"],
  ["gitlab", "Git"], ["git version control", "Git"], ["git", "Git"], ["github", "GitHub"],
  ["docker container", "Docker"], ["dockerized", "Docker"],
  ["k8s", "Kubernetes"], ["kubernetes cluster", "Kubernetes"],
  ["aws cloud", "AWS"], ["amazon web services", "AWS"], ["aws ec2", "AWS"], ["aws s3", "AWS"],
  ["ms azure", "Azure"], ["microsoft azure", "Azure"], ["azure cloud services", "Azure"],
  ["google cloud", "GCP"], ["google cloud platform", "GCP"], ["gcp cloud", "GCP"],
  ["firebase db", "Firebase"], ["firebase firestore", "Firebase"], ["firebase auth", "Firebase"],
  ["ml", "Machine Learning"], ["machine learning", "Machine Learning"], ["ml model", "Machine Learning"],
  ["ai", "Artificial Intelligence"], ["artificial intelligence", "Artificial Intelligence"], ["ai model", "Artificial Intelligence"],
  ["data science", "Data Science"], ["data analysis", "Data Analysis"], ["data analytics", "Data Analysis"],
  ["backend", "Backend Development"], ["backend dev", "Backend Development"], ["backend developer", "Backend Development"],
  ["frontend", "Frontend Development"], ["frontend dev", "Frontend Development"], ["frontend developer", "Frontend Development"],
  ["fullstack", "Full Stack"], ["full stack developer", "Full Stack"],
  ["dev ops", "DevOps"], ["devops engineer", "DevOps"],
  ["unix", "Linux"], ["linux os", "Linux"],
  ["unit testing", "Testing"], ["testing automation", "Testing"], ["jest testing", "Jest"],
  ["vscode", "VS Code"], ["visual studio code", "VS Code"], ["vs code editor", "VS Code"],
];

function toAliasKey(value = "") {
  return String(value || "")
    .toLowerCase()
    .replace(/[._-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const SKILL_ALIAS_MAP = new Map(
  SKILL_ALIAS_ENTRIES.map(([alias, canonical]) => [toAliasKey(alias), canonical])
);

function normalizeSingleSkill(value = "") {
  const raw = String(value || "").replace(/\s+/g, " ").trim();
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

