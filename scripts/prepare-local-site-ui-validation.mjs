import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const repo = resolve(import.meta.dirname, '../../../..');
const target = '/tmp/joorchin-generated-site-validation';
rmSync(target, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
cpSync(resolve(repo, 'be/vps/generated-site'), target, { recursive: true });
cpSync(resolve(repo, 'sdks/site-ui'), resolve(target, 'local-site-ui'), { recursive: true });

const packagePath = resolve(target, 'package.json');
const pkg = JSON.parse(readFileSync(packagePath, 'utf8'));
const version = pkg.dependencies['@joorchin/site-ui'];
const localVersion = JSON.parse(readFileSync(resolve(target, 'local-site-ui/package.json'), 'utf8')).version;
if (version !== localVersion) throw new Error(`site-ui pin ${version} differs from local ${localVersion}`);
pkg.dependencies['@joorchin/site-ui'] = 'file:./local-site-ui';
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`);

const lockPath = resolve(target, 'pnpm-lock.yaml');
let lock = readFileSync(lockPath, 'utf8');
const importerPattern = /('@joorchin\/site-ui':\n\s+specifier: )[^\n]+(\n\s+version: )([^\n]+)/;
const importer = lock.match(importerPattern);
if (!importer) throw new Error('Could not find the site-ui importer lockfile entry');
const lockVersion = importer[3].match(/^[^(]+/)?.[0];
if (!lockVersion) throw new Error('Could not read the site-ui lockfile version');
lock = lock.replace(
  importerPattern,
  "$1file:./local-site-ui$2file:local-site-ui(react-dom@19.2.3(react@19.2.3))(react@19.2.3)",
);
lock = lock.replace(
  /  '@joorchin\/site-ui@[^']+':\n    resolution: \{[^\n}]*tarball: [^\n}]+\}\n    peerDependencies:\n      react: '>=18'\n      react-dom: '>=18'/,
  "  '@joorchin/site-ui@file:local-site-ui':\n    resolution: {directory: local-site-ui, type: directory}\n    peerDependencies:\n      react: '>=18'\n      react-dom: '>=18'",
);
lock = lock.replace(
  `'@joorchin/site-ui@${lockVersion}(react-dom@19.2.3(react@19.2.3))(react@19.2.3)'`,
  "'@joorchin/site-ui@file:local-site-ui(react-dom@19.2.3(react@19.2.3))(react@19.2.3)'",
);
if (
  lock.includes(`'@joorchin/site-ui@${lockVersion}`) ||
  !lock.includes('specifier: file:./local-site-ui')
) {
  throw new Error(`Could not replace the site-ui ${lockVersion} lockfile pin`);
}
writeFileSync(lockPath, lock);
