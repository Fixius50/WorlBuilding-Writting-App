import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const srcRoot = path.join(projectRoot, "src");
const reportPath = path.join(
  projectRoot,
  "reports",
  "architecture-guard-report.json",
);
const strictMode = process.argv.includes("--strict");

const deepImportRegex =
  /^@features\/([^/]+)\/(components|hooks|pages|application|domain|store)\/.+/;
const importRegex = /from\s+["']([^"']+)["']/g;

const allowCrossFeatureDeep = [
  /^@features\/App\/store\/useAppStore$/,
  /^@features\/Shell\/store\/useRightPanelStore$/,
];

const violations = [];

const toPosix = (value) => value.replace(/\\/g, "/");

const isTsFile = (fileName) =>
  fileName.endsWith(".ts") || fileName.endsWith(".tsx");

const readAllFiles = (dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readAllFiles(fullPath));
    } else if (entry.isFile() && isTsFile(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
};

const addViolation = (
  kind,
  filePath,
  importerFeature,
  importedPath,
  message,
) => {
  violations.push({
    kind,
    file: toPosix(path.relative(projectRoot, filePath)),
    importerFeature,
    importedPath,
    message,
  });
};

const files = readAllFiles(srcRoot);

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const rel = toPosix(path.relative(srcRoot, file));
  const featureMatch = rel.match(/^features\/([^/]+)\//);
  const importerFeature = featureMatch ? featureMatch[1] : null;
  const inShared = rel.startsWith("features/Shared/");
  const inSharedAdapters = rel.startsWith("features/Shared/adapters/");

  let match;
  while ((match = importRegex.exec(raw)) !== null) {
    const target = match[1];

    if (target.startsWith("@features/")) {
      const deepMatch = target.match(deepImportRegex);

      if (deepMatch) {
        const importedFeature = deepMatch[1];
        const allowedByFeature =
          importerFeature !== null && importerFeature === importedFeature;
        const allowedBySharedAdapter = inSharedAdapters;
        const allowedByExplicitRule = allowCrossFeatureDeep.some((rule) =>
          rule.test(target),
        );

        if (
          !allowedByFeature &&
          !allowedBySharedAdapter &&
          !allowedByExplicitRule
        ) {
          addViolation(
            "CROSS_FEATURE_DEEP_IMPORT",
            file,
            importerFeature,
            target,
            "Import profundo entre features. Usa API publica del modulo destino (index.ts).",
          );
        }
      }

      if (
        inShared &&
        !inSharedAdapters &&
        !target.startsWith("@features/Shared/")
      ) {
        addViolation(
          "SHARED_KERNEL_DEPENDS_ON_FEATURE",
          file,
          importerFeature,
          target,
          "Shared kernel no debe depender de features de negocio; mover a Shared/adapters o abstraer en Shared puro.",
        );
      }
    }
  }
}

const grouped = violations.reduce((acc, current) => {
  const key = current.kind;
  acc[key] = (acc[key] || 0) + 1;
  return acc;
}, {});

const report = {
  generatedAt: new Date().toISOString(),
  strictMode,
  totals: {
    filesScanned: files.length,
    violations: violations.length,
  },
  byKind: grouped,
  violations,
};

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

console.log(
  "Architecture guard report generated:",
  toPosix(path.relative(projectRoot, reportPath)),
);
console.log("Files scanned:", files.length);
console.log("Violations:", violations.length);

for (const [kind, total] of Object.entries(grouped)) {
  console.log(`- ${kind}: ${total}`);
}

if (strictMode && violations.length > 0) {
  process.exit(1);
}
