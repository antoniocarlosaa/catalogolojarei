const fs = require('fs');
const { execSync } = require('child_process');

const content = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

// We know the error is an unclosed block, string, or JSX element.
// Let's print out the exact error from esbuild since it gives the best errors for JSX.
try {
  execSync('npx esbuild components/AdminPanel.tsx', { stdio: 'pipe' });
  console.log("No error!");
} catch (e) {
  console.log(e.stderr.toString());
}
