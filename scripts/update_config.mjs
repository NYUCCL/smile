import fs from "node:fs";
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

function parseRepoPath(url) {
  const sshMatch = url.match(/^[^@]+@[^:]+:([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (sshMatch) {
    return `${sshMatch[1]}/${sshMatch[2]}`;
  }

  const httpMatch = url.match(/^[a-z]+:\/\/[^/]+\/([^/]+)\/([^/]+?)(?:\.git)?$/i);
  if (httpMatch) {
    return `${httpMatch[1]}/${httpMatch[2]}`;
  }

  throw new Error(`Could not parse repository URL: ${url}`);
}

function runGh(args) {
  const result = spawnSync("gh", args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });

  if (result.error) {
    throw new Error(`Failed to run gh: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`gh command failed with status ${result.status}`);
  }
}

function main() {
  const url = run("git", ["config", "--get", "remote.origin.url"]);
  const repoPath = parseRepoPath(url);

  const appConfig = fs.readFileSync("env/.env.local", "utf8");
  const encoded = Buffer.from(appConfig, "utf8").toString("base64");

  runGh(["secret", "set", "SECRET_APP_CONFIG", "--body", encoded, "--repo", repoPath]);

  if (repoPath.toLowerCase() === "nyuccl/smile") {
    runGh(["secret", "set", "-f", "env/.env.docs.local"]);
  }

  runGh(["secret", "set", "-f", "env/.env.deploy.local", "--repo", repoPath]);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
