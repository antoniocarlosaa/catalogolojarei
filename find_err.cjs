const { execSync } = require('child_process');
const fs = require('fs');

let lines = fs.readFileSync('components/AdminPanel.tsx', 'utf8').split('\n');

for (let i = 1520; i > 200; i -= 10) {
  const code = lines.slice(0, i).join('\n') + '\n</div></div></div></div></div>);};\nexport default AdminPanel;\n';
  fs.writeFileSync('temp.tsx', code);
  try {
    execSync('npx esbuild temp.tsx', { stdio: 'pipe' });
    console.log("Success at " + i + ". So the error is after line " + i);
    break;
  } catch (e) {
    if (!e.stderr.toString().includes("import' and 'export'")) {
       console.log("Other error at line", i, e.stderr.toString().split('\n')[0]);
    }
  }
}
