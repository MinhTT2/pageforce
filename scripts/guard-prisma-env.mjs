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

const pageforgeEnv = env.PAGEFORGE_ENV;

if (!pageforgeEnv) {
  console.error(
    "PAGEFORGE_ENV is required. Set it to development for local/dev or production for Vercel Production.",
  );
  process.exit(1);
}

if (!["development", "preview", "production"].includes(pageforgeEnv)) {
  console.error(
    `PAGEFORGE_ENV must be development, preview, or production. Received: ${pageforgeEnv}`,
  );
  process.exit(1);
}

if (mode === "migrate-dev" && pageforgeEnv === "production") {
  console.error(
    "Refusing to run prisma migrate dev with PAGEFORGE_ENV=production. Use npm run prisma:deploy for production.",
  );
  process.exit(1);
}

if (mode === "migrate-deploy" && pageforgeEnv !== "production") {
  console.warn(
    `Running prisma migrate deploy with PAGEFORGE_ENV=${pageforgeEnv}. This is allowed, but production should use PAGEFORGE_ENV=production.`,
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
