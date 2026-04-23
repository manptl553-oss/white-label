#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

const packageJson = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "package.json"), "utf-8"));
const peerDeps = packageJson.peerDependencies || {};

console.log("\n🔍 Checking required peer dependencies...\n");

const missingDeps = [];

for (const dep in peerDeps) {
  try {
    require.resolve(dep);
  } catch (e) {
    missingDeps.push(`${dep}@${peerDeps[dep]}`);
  }
}

if (missingDeps.length === 0) {
  console.log("✅ All peer dependencies are installed.\n");
  process.exit(0);
}

console.log(`📦 Installing missing peer dependencies:\n   → ${missingDeps.join("\n   → ")}\n`);

try {
  execSync(`npm install ${missingDeps.join(" ")} --save-dev`, { stdio: "inherit" });
  console.log("\n✅ Peer dependencies installed successfully!\n");
} catch (err) {
  console.error("\n❌ Failed to install peer dependencies automatically.");
  console.error("Please run this manually:\n");
  console.error(`npm install ${missingDeps.join(" ")} --save-dev\n`);
}