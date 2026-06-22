const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const runtimeDir = path.join(projectRoot, '.next-runtime');

if (!fs.existsSync(runtimeDir)) {
  process.exit(0);
}

const staleDir = path.join(projectRoot, `.next-runtime.stale.${Date.now()}`);

try {
  fs.renameSync(runtimeDir, staleDir);
  console.log(`Rotated stale Next.js runtime cache to ${path.basename(staleDir)}.`);
} catch (error) {
  console.warn('Unable to rotate .next-runtime before starting dev server.');
  console.warn(error instanceof Error ? error.message : String(error));
}
