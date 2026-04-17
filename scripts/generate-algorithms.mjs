import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const BLOG_ROOT = process.cwd();
const PRIVATE_REPO_PATH =
  process.env.PRIVATE_REPO_PATH || path.join(BLOG_ROOT, "external/problem-solving");
const OUTPUT_PATH = path.join(BLOG_ROOT, "src/data/algorithms.json");

const CODE_EXTENSIONS = {
  ".java": "Java",
  ".py": "Python",
  ".cpp": "C++",
  ".cc": "C++",
  ".c": "C",
  ".js": "JavaScript",
  ".ts": "TypeScript",
  ".kt": "Kotlin",
};

const IGNORED_FILENAMES = new Set(["README.md", "memo.md"]);
const IGNORED_DIR_NAMES = new Set([
  ".git",
  ".github",
  "node_modules",
  "dist",
  "build",
  ".idea",
  ".vscode",
]);

const KNOWN_PLATFORMS = new Set(["백준", "SWEA", "프로그래머스"]);

function safeRead(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }
}

function safeStat(targetPath) {
  try {
    return fs.statSync(targetPath);
  } catch {
    return null;
  }
}

function listDirs(targetPath) {
  if (!safeStat(targetPath)?.isDirectory()) return [];
  return fs
    .readdirSync(targetPath, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !name.startsWith("."))
    .filter((name) => !IGNORED_DIR_NAMES.has(name));
}

function extractProblemInfo(folderName) {
  const match = folderName.match(/^(\d+)\.\s*(.+)$/);
  if (match) {
    return {
      problemId: match[1],
      title: match[2].trim(),
    };
  }
  return {
    problemId: null,
    title: folderName.trim(),
  };
}

function getPlatformSlug(platform) {
  const normalized = platform.trim().toLowerCase();
  if (normalized === "백준") return "boj";
  if (normalized === "swea") return "swea";
  if (normalized === "프로그래머스") return "programmers";
  return normalized.replace(/\s+/g, "-");
}

function findCodeFile(problemDir) {
  const files = fs.readdirSync(problemDir, { withFileTypes: true });
  const candidates = files
    .filter((f) => f.isFile())
    .map((f) => f.name)
    .filter((name) => {
      if (IGNORED_FILENAMES.has(name)) return false;
      if (/^input\d+\.txt$/i.test(name)) return false;
      if (/^output\d+\.txt$/i.test(name)) return false;
      const ext = path.extname(name).toLowerCase();
      return CODE_EXTENSIONS[ext];
    });

  if (!candidates.length) return null;

  candidates.sort((a, b) => a.localeCompare(b, "ko"));
  const filename = candidates[0];
  const ext = path.extname(filename).toLowerCase();

  return {
    filename,
    language: CODE_EXTENSIONS[ext] || "Unknown",
    content: safeRead(path.join(problemDir, filename)),
  };
}

function findSamples(problemDir) {
  const filenames = fs.readdirSync(problemDir);
  const inputFiles = filenames
    .filter((name) => /^input\d+\.txt$/i.test(name))
    .sort((a, b) => a.localeCompare(b, "en"));

  return inputFiles.map((inputName) => {
    const number = inputName.match(/^input(\d+)\.txt$/i)?.[1];
    const outputName = number ? `output${number}.txt` : null;

    return {
      input: safeRead(path.join(problemDir, inputName)) || "",
      output: outputName ? safeRead(path.join(problemDir, outputName)) || "" : "",
    };
  });
}

function extractFirstUrl(text) {
  if (!text) return null;
  const match = text.match(/https?:\/\/[^\s)]+/);
  return match ? match[0] : null;
}

function getLastCommitMeta(repoPath, relativePath) {
  try {
    const output = execSync(
      `git -C "${repoPath}" log -1 --format=%H%n%s%n%cI -- "${relativePath}"`,
      { encoding: "utf-8" }
    ).trim();

    if (!output) return null;
    const [hash, subject, committedAt] = output.split("\n");
    return { hash, subject, committedAt };
  } catch {
    return null;
  }
}

function parsePerformanceFromCommitMessage(message) {
  if (!message) {
    return { time: null, memory: null };
  }

  const timeMatch = message.match(/Time:\s*([^,]+?)(?:,|$)/i);
  const memoryMatch = message.match(/Memory:\s*([^,]+?)(?:\s*-BaekjoonHub|,|$)/i);

  return {
    time: timeMatch ? timeMatch[1].trim() : null,
    memory: memoryMatch ? memoryMatch[1].trim() : null,
  };
}

function walkProblems() {
  const results = [];
  const languageDirs = listDirs(PRIVATE_REPO_PATH);

  for (const language of languageDirs) {
    const languagePath = path.join(PRIVATE_REPO_PATH, language);
    const platformDirs = listDirs(languagePath).filter((name) => KNOWN_PLATFORMS.has(name));

    for (const platform of platformDirs) {
      const platformPath = path.join(languagePath, platform);
      const groupDirs = listDirs(platformPath);

      for (const group of groupDirs) {
        const groupPath = path.join(platformPath, group);
        const problemDirs = listDirs(groupPath);

        for (const problemFolder of problemDirs) {
          const problemPath = path.join(groupPath, problemFolder);
          const relativeProblemPath = path.relative(PRIVATE_REPO_PATH, problemPath);

          if (!safeStat(problemPath)?.isDirectory()) continue;

          const { problemId, title } = extractProblemInfo(problemFolder);
          const codeFile = findCodeFile(problemPath);
          const samples = findSamples(problemPath);
          const readme = safeRead(path.join(problemPath, "README.md"));
          const memo = safeRead(path.join(problemPath, "memo.md"));
          const commitMeta = getLastCommitMeta(PRIVATE_REPO_PATH, relativeProblemPath);
          const perf = parsePerformanceFromCommitMessage(commitMeta?.subject || "");

          const uid = `${getPlatformSlug(platform)}-${problemId || title
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-가-힣]/g, "")}`;

          results.push({
            uid,
            platform,
            group,
            language,
            problemId,
            title,
            committedAt: commitMeta?.committedAt || null,
            commitHash: commitMeta?.hash || null,
            commitMessage: commitMeta?.subject || null,
            sourcePath: relativeProblemPath,
            link: extractFirstUrl(readme),
            performance: {
              time: perf.time,
              memory: perf.memory,
            },
            code: codeFile
              ? {
                  filename: codeFile.filename,
                  language: codeFile.language,
                  content: codeFile.content,
                }
              : null,
            samples,
            memo: memo || null,
          });
        }
      }
    }
  }

  results.sort((a, b) => {
    const aTime = a.committedAt ? new Date(a.committedAt).getTime() : 0;
    const bTime = b.committedAt ? new Date(b.committedAt).getTime() : 0;
    return bTime - aTime;
  });

  return results;
}

function main() {
  if (!safeStat(PRIVATE_REPO_PATH)?.isDirectory()) {
    throw new Error(`Private repo path not found: ${PRIVATE_REPO_PATH}`);
  }

  const data = walkProblems();
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Generated ${data.length} problems -> ${OUTPUT_PATH}`);
}

main();
