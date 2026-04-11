import { spawnSync } from "node:child_process";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    stdio: "pipe",
    shell: process.platform === "win32",
    ...options,
  });

  if (result.error) {
    throw new Error(`Failed to run ${command}: ${result.error.message}`);
  }

  if (result.status !== 0) {
    const stderr = (result.stderr || "").trim();
    throw new Error(stderr || `${command} exited with status ${result.status}`);
  }

  return (result.stdout || "").trim();
}

function main() {
  const branch = run("git", ["rev-parse", "--abbrev-ref", "HEAD"]).toLowerCase();

  console.log(`Forcing a deploy of branch: ${branch}.`);
  console.log("Warning: this will only work if you have run 'npm run upload_config' at least once");

  const execResult = spawnSync(
    "gh",
    ["workflow", "run", "deploy.yml", "-f", `github_sha=${branch}`],
    {
      stdio: "inherit",
      shell: process.platform === "win32",
    },
  );

  if (execResult.error) {
    throw new Error(`Failed to run gh: ${execResult.error.message}`);
  }

  if (execResult.status !== 0) {
    throw new Error(`gh workflow run failed with status ${execResult.status}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
