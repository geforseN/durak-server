import { execSync as execSync_ } from "child_process";
import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

main();

function main() {
  try {
    const envFile = ".env.development";
    const exampleEnvFile = ".env.example.development";
    const prismaClientPath = path.join("node_modules", "@prisma", "client");
    const prismaSchemaPath = "prisma/schema.prisma";
    const schemaHashFile = "prisma/schema.prisma.hash";

    createEnvFile(envFile, exampleEnvFile);
    upDockerCompose(envFile);
    installDependencies();
    generatePrismaClient(prismaClientPath);
    syncDatabase(prismaSchemaPath, schemaHashFile);
    startServer(envFile, () => {
      console.log("\nDevelopment server stopped by signal.");
      downDockerCompose();
    });
  } catch (error) {
    console.error("Dev script failed", { error });
    process.exitCode = 1;
  }
}

function createEnvFile(envFile: string, envFileToCopy: string) {
  if (!fs.existsSync(envFile)) {
    console.log(`Creating ${envFile} from example...`);
    fs.copyFileSync(envFileToCopy, envFile);
  } else {
    console.log(`${envFile} already exists.`);
  }
}

function upDockerCompose(envFile: string) {
  console.log("Starting Docker containers...");
  execSync(`docker compose --env-file ${envFile} up -d`);
}

function downDockerCompose() {
  console.log("Stopping Docker containers...");
  execSync("docker compose down");
}


function installDependencies() {
  if (!fs.existsSync("node_modules")) {
    console.log("Installing dependencies...");
    execSync("pnpm install");
  } else {
    console.log("Dependencies are already installed.");
  }
}

function generatePrismaClient(prismaClientPath: string) {
  if (!fs.existsSync(prismaClientPath)) {
    console.log("Prisma client is missing. Generating Prisma client...");
    execSync("pnpm exec prisma generate");
  } else {
    console.log("Prisma client is already generated.");
  }
}

function syncDatabase(schemaPath: string, hashFile: string) {
  const currentSchemaHash = getFileHash(schemaPath);
  const previousSchemaHash = fs.existsSync(hashFile)
    ? fs.readFileSync(hashFile, "utf8")
    : null;
  if (currentSchemaHash !== previousSchemaHash) {
    console.log("Schema has changed. Syncing database...");
    const envVariables = `DATABASE_URL=${process.env.DATABASE_URL} DIRECT_URL=${process.env.DIRECT_URL}`;
    execSync(`${envVariables} pnpm exec prisma db push`);
    fs.writeFileSync(hashFile, currentSchemaHash, "utf8");
  } else {
    console.log("Schema has not changed. Skipping database sync.");
  }
}

function startServer(envFile: string, onGracefulClose?: () => void) {
  console.log("Starting the development server...");
  try {
    execSync(
      `pnpm exec tsx watch --clear-screen=false --env-file=${envFile} src/main.ts`,
    );
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("signal" in error) ||
      typeof error.signal !== "string"
    ) {
      throw error;
    }
    if (!["SIGINT", "SIGTERM"].includes(error.signal)) {
      throw error;
    }
    onGracefulClose?.();
  }
}

function execSync(command: string, options: object = {}): void {
  execSync_(command, { stdio: "inherit", ...options });
}

function getFileHash(filePath: string): string {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return crypto.createHash("sha256").update(fileContent).digest("hex");
}
