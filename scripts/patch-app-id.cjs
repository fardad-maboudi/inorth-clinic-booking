const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../src/api/joorchin.js');
let content = fs.readFileSync(filePath, 'utf8');

const target = 'const APP_ID = import.meta.env.VITE_APP_ID;';
const replacement = 'const APP_ID = (import.meta.env.VITE_APP_ID && import.meta.env.VITE_APP_ID !== "test-id") ? import.meta.env.VITE_APP_ID : "6ae869523c5af491ed8a859b";';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully patched APP_ID in joorchin.js');
} else {
  console.log('Target not found in joorchin.js');
}
