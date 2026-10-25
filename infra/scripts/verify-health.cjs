const { execFileSync } = require("node:child_process");

function get(url) {
  return execFileSync("curl", [
    "--fail", "--silent", "--show-error", "--retry", "2", "--retry-all-errors",
    "--retry-delay", "10", "--max-time", "30", url.toString(),
  ], { encoding: "utf8", timeout: 130000 });
}

const api = JSON.parse(get(new URL("/api/health", process.env.API_BASE_URL)));
if (api.status !== "healthy" || api.services?.database !== "healthy" || api.services?.cache !== "healthy") {
  throw new Error("API, PostgreSQL or Redis is not healthy");
}
if (!process.argv.includes("--api-only")) {
  for (const route of ["/", "/settings"]) {
    const html = get(new URL(route, process.env.WEB_BASE_URL));
    if (!html.includes('id="root"') || !html.includes("/assets/")) {
      throw new Error(`Frontend route ${route} did not return the application`);
    }
  }
}
console.log("Verified deployed application health");