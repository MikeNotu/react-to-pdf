import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { rcedit } from "rcedit";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

if (process.platform !== "win32") {
  console.log("Skipping EXE icon patch: only needed on Windows.");
  process.exit(0);
}

const packageJsonPath = path.join(projectRoot, "package.json");
const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
const outputDir = packageJson.build?.directories?.output ?? "release";
const productName = packageJson.build?.productName ?? "app";

const exePath = path.join(projectRoot, outputDir, "win-unpacked", `${productName}.exe`);
const iconPath = path.join(projectRoot, "build", "icon.ico");

await access(exePath);
await access(iconPath);

await rcedit(exePath, {
  icon: iconPath,
});

console.log(`Patched EXE icon: ${exePath}`);
