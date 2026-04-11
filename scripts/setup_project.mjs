import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`${command} exited with status ${result.status}`);
  }
}

function installHook(hookName) {
  const hooksDir = path.join(".git", "hooks");
  const hookPath = path.join(hooksDir, hookName);
  const hookContent = "#!/bin/sh\nnode scripts/generate_git_env.mjs\n";

  fs.mkdirSync(hooksDir, { recursive: true });
  fs.writeFileSync(hookPath, hookContent, "utf8");
}

function main() {
  console.log("Installing dependencies");
  run("npm", ["install"]);

  console.log("Installing local git hooks");
  installHook("post-commit");
  installHook("post-checkout");

  run("node", ["scripts/generate_git_env.mjs"]);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
