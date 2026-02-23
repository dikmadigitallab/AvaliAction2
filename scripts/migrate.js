import { execSync } from "child_process";

console.log("Generating Prisma client...");
execSync("npx prisma generate", { stdio: "inherit" });

console.log("Pushing schema to database...");
execSync("npx prisma db push --accept-data-loss", { stdio: "inherit" });

console.log("Migration complete!");
