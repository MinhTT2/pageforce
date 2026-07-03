import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const mode = process.argv[2];
const validModes = new Set(["migrate-dev", "migrate-deploy"]);

if (!validModes.has(mode)) {
  console.error(
    "Usage: node scripts/guard-prisma-env.mjs <migrate-dev|migrate-deploy>",
  );
  process.exit(1);
}

const env = {
  ...readEnvFile(".env"),
  ...readEnvFile(".env.local"),
  ...process.env,
};

const pageforceEnv = env.PAGEFORCE_ENV;

if (!pageforceEnv) {
  console.error(
    "PAGEFORCE_ENV is required. Set it to development for local/dev or production for Vercel Production.",
  );
  process.exit(1);
}

if (!["development", "preview", "production"].includes(pageforceEnv)) {
  console.error(
    `PAGEFORCE_ENV must be development, preview, or production. Received: ${pageforceEnv}`,
  );
  process.exit(1);
}

if (mode === "migrate-dev" && pageforceEnv === "production") {
  console.error(
    "Refusing to run prisma migrate dev with PAGEFORCE_ENV=production. Use npm run prisma:deploy for production.",
  );
  process.exit(1);
}

if (mode === "migrate-deploy" && pageforceEnv !== "production") {
  console.warn(
    `Running prisma migrate deploy with PAGEFORCE_ENV=${pageforceEnv}. This is allowed, but production should use PAGEFORCE_ENV=production.`,
  );
}

function readEnvFile(filename) {
  const filePath = join(process.cwd(), filename);

  if (!existsSync(filePath)) {
    return {};
  }

  const result = {};
  const file = readFileSync(filePath, "utf8");

  for (const line of file.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");

    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    result[key] = value;
  }

  return result;
}
