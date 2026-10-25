const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");

if (process.platform !== "linux") throw new Error("Build production dependencies on Linux");
const root = path.resolve(__dirname, "../..");
const destination = path.resolve(process.env.DEPLOY_ARTIFACT_DIR ?? "");
if (!process.env.DEPLOY_ARTIFACT_DIR || fs.existsSync(destination)) {
  throw new Error("DEPLOY_ARTIFACT_DIR must name a new staging directory");
}
const staging = fs.mkdtempSync(path.join(os.tmpdir(), "simsimplay-api-"));
const entries = [
  "package.json",
  "package-lock.json",
  "services/shared/package.json",
  "services/shared/dist",
  "services/simsimplay-api/package.json",
  "services/simsimplay-api/dist",
  "services/simsimplay-web/package.json",
  "infra/migrations",
];
for (const entry of entries) {
  const target = path.join(staging, entry);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.cpSync(path.join(root, entry), target, { recursive: true });
}
execFileSync("npm", ["ci", "--omit=dev", "--workspace=services/shared", "--workspace=services/simsimplay-api", "--include-workspace-root"], {
  cwd: staging,
  stdio: "inherit",
});
const sharedLink = path.join(staging, "node_modules/@simsimplay/shared");
fs.rmSync(sharedLink, { force: true, recursive: true });
fs.cpSync(path.join(staging, "services/shared"), sharedLink, { recursive: true });
fs.rmSync(path.join(staging, "node_modules/@simsimplay/api"), { force: true, recursive: true });
execFileSync(process.execPath, [path.join(__dirname, "verify-artifact.cjs"), staging], { stdio: "inherit" });
fs.rmSync(path.join(staging, "node_modules/.bin"), { force: true, recursive: true });
fs.mkdirSync(destination, { recursive: true });
execFileSync("zip", ["-q", "-r", path.join(destination, "api.zip"), "."], { cwd: staging, stdio: "inherit" });
console.log("Production API package verified");