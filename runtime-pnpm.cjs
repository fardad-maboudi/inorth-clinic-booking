// The workspace is writable; the image and Corepack cache are read-only at runtime.
const fs = require('node:fs');
const path = require('node:path');
const baked = JSON.parse(fs.readFileSync(path.join(process.env.APP_DEPS || '/opt/app-deps', 'package.json'), 'utf8')).packageManager;
if (!/^pnpm@\d+\.\d+\.\d+(?:\+.*)?$/.test(baked)) throw new Error('Image pnpm pin is missing');
const file = path.resolve('package.json');
const workspace = JSON.parse(fs.readFileSync(file, 'utf8'));
if (workspace.packageManager !== baked) {
  workspace.packageManager = baked;
  fs.writeFileSync(file, `${JSON.stringify(workspace, null, 2)}\n`);
}
