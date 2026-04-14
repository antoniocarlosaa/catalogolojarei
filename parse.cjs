const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

try {
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript']
  });
  console.log("No syntax error found by babel!");
} catch (err) {
  console.log("Syntax Error at line", err.loc.line, "col", err.loc.column);
  console.log("Message:", err.message);
}
