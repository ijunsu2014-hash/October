const path = require("node:path");
const { spawn } = require("node:child_process");

async function verify() {
  const directory = path.resolve(process.argv[2]);
  const runtime = spawn(process.execPath, ["services/simsimplay-api/dist/main.js"], {
    cwd: directory,
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: "3039",
      JWT_SECRET: "artifact-verification-only-not-a-production-secret",
      AZURE_USE_MANAGED_IDENTITY: "false",
      REDIS_URL: "redis://127.0.0.1:6379",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await new Promise((resolve, reject) => {
      let output = "";
      let checking = false;
      const timer = setTimeout(() => reject(new Error("Packaged API startup timed out")), 30000);
      const fail = (error) => { clearTimeout(timer); reject(error); };
      runtime.once("error", fail);
      runtime.once("exit", (code) => fail(new Error(`Packaged API exited before verification: ${code}`)));
      runtime.stderr.on("data", (chunk) => { output = (output + chunk.toString()).slice(-8000); });
      runtime.stdout.on("data", async (chunk) => {
        output = (output + chunk.toString()).slice(-8000);
        if (checking || !output.includes("simsimplay-api listening")) return;
        checking = true;
        try {
          const response = await fetch("http://127.0.0.1:3039/api/auth/me", { signal: AbortSignal.timeout(10000) });
          if (response.status !== 401) throw new Error(`Expected authenticated API route, got ${response.status}`);
          clearTimeout(timer);
          resolve();
        } catch (error) { fail(error); }
      });
    });
  } finally {
    runtime.kill("SIGTERM");
  }
}

verify().catch((error) => { console.error(error.message); process.exitCode = 1; });