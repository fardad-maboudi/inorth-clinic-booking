const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../vite.config.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Ensure loadEnv is imported
if (!content.includes('loadEnv')) {
  content = content.replace(
    'import { defineConfig } from "vite";',
    'import { defineConfig, loadEnv } from "vite";'
  );
}

// 2. Use mode in defineConfig
content = content.replace(
  'defineConfig(async ({ command }) => {',
  'defineConfig(async ({ command, mode }) => {\n  const env = loadEnv(mode, process.cwd(), "");'
);

// 3. Fix appId and targetServerUrl
content = content.replace(
  'const appId =\n    process.env.VITE_APP_ID || process.env.MODAL_SANDBOX_ID || "test-id";',
  'const appId = env.VITE_APP_ID || process.env.VITE_APP_ID || process.env.MODAL_SANDBOX_ID || "test-id";\n  const targetServerUrl = env.VITE_JOORCHIN_SERVER_URL || process.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.site";'
);
// Also handle CRLF if present
content = content.replace(
  'const appId =\r\n    process.env.VITE_APP_ID || process.env.MODAL_SANDBOX_ID || "test-id";',
  'const appId = env.VITE_APP_ID || process.env.VITE_APP_ID || process.env.MODAL_SANDBOX_ID || "test-id";\r\n  const targetServerUrl = env.VITE_JOORCHIN_SERVER_URL || process.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.site";'
);

// 4. Update proxy target
content = content.replace(
  "target: process.env.VITE_JOORCHIN_SERVER_URL || 'https://api.joorchin.ai'",
  "target: targetServerUrl"
);
content = content.replace(
  'target: process.env.VITE_JOORCHIN_SERVER_URL || "https://api.joorchin.ai"',
  "target: targetServerUrl"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully updated vite.config.js');
