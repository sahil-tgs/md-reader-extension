import { rmSync, mkdirSync, cpSync, existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

const root = import.meta.dir;
const dist = resolve(root, "dist");

const EXPORT_TARGETS = [
  "/mnt/c/Users/sahil/OneDrive/Documents/md-reader-extension",
];

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

const result = await Bun.build({
  entrypoints: [resolve(root, "src/content.ts")],
  outdir: dist,
  target: "browser",
  format: "iife",
  minify: false,
  sourcemap: "none",
  naming: "[name].js",
});

if (!result.success) {
  for (const log of result.logs) console.error(log);
  process.exit(1);
}

cpSync(resolve(root, "src/styles.css"), resolve(dist, "styles.css"));
cpSync(resolve(root, "manifest.json"), resolve(dist, "manifest.json"));
if (existsSync(resolve(root, "icons"))) {
  cpSync(resolve(root, "icons"), resolve(dist, "icons"), { recursive: true });
}

console.log("✓ built →", dist);

for (const target of EXPORT_TARGETS) {
  const parent = resolve(target, "..");
  if (!existsSync(parent) || !statSync(parent).isDirectory()) {
    console.warn(`⚠ export target parent not reachable, skipping: ${parent}`);
    continue;
  }
  if (existsSync(target)) rmSync(target, { recursive: true, force: true });
  cpSync(dist, target, { recursive: true });
  console.log("✓ exported →", target);
}
