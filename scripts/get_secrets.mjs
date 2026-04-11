import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const REPO = "codec-lab/smile-secrets";

function runGhApi(filePath) {
  const result = spawnSync(
    "gh",
    ["api", `repos/${REPO}/contents/${filePath}`, "--jq", ".content"],
    { encoding: "utf8" },
  );

  if (result.error) {
    throw new Error(`Failed to execute gh for ${filePath}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(`gh api failed for ${filePath}: ${stderr || `exit code ${result.status}`}`);
  }

  return result.stdout;
}

function writeRepoFile(remotePath, localPath) {
  const base64Content = runGhApi(remotePath);
  const decoded = Buffer.from(base64Content, "base64");

  const absolutePath = path.resolve(localPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, decoded);

  console.log(`Downloaded: ${remotePath}`);
}

function main() {
  console.log(`Fetching files from ${REPO}...`);

  [".env.deploy.local", ".env.docs.local", ".env.local"].forEach((file) => {
    writeRepoFile(file, path.join("env", file));
  });

  writeRepoFile(".service-account-key.json", path.join("firebase", ".service-account-key.json"));
  writeRepoFile("get_recruitment_data.mjs", path.join("scripts", "get_recruitment_data.mjs"));

  console.log("Done.");
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
