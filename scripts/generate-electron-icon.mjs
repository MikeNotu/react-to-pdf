import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pngToIco from "png-to-ico";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const sourcePng = path.join(projectRoot, "src", "assets", "favicon.png");
const outputDir = path.join(projectRoot, "build");
const outputPng = path.join(outputDir, "icon.png");
const outputIco = path.join(outputDir, "icon.ico");

await mkdir(outputDir, { recursive: true });

await copyFile(sourcePng, outputPng);

const pngBuffer = await readFile(sourcePng);
const icoBuffer = await pngToIco(pngBuffer);
await writeFile(outputIco, icoBuffer);

console.log("Generated Electron icons:");
console.log(`- ${outputPng}`);
console.log(`- ${outputIco}`);
