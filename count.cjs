const fs = require('fs');
const content = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

let braces = 0;
let parens = 0;
let brackets = 0;
let inString = false;
let stringChar = '';
let inTemplate = false;
let inLineComment = false;
let inBlockComment = false;

for (let i = 0; i < content.length; i++) {
  const char = content[i];
  const nextChar = content[i + 1];

  if (inLineComment) {
    if (char === '\n') inLineComment = false;
    continue;
  }
  if (inBlockComment) {
    if (char === '*' && nextChar === '/') {
      inBlockComment = false;
      i++;
    }
    continue;
  }
  if (inString) {
    if (char === '\\') { i++; continue; }
    if (char === stringChar) inString = false;
    continue;
  }
  if (inTemplate) {
    if (char === '\\') { i++; continue; }
    if (char === '$' && nextChar === '{') {
      braces++;
      i++;
      continue; // Note: doesn't handle nested templates well, but simple heuristic might work
    }
    if (char === '`') inTemplate = false;
    continue;
  }

  if (char === '/' && nextChar === '/') { inLineComment = true; i++; continue; }
  if (char === '/' && nextChar === '*') { inBlockComment = true; i++; continue; }
  if (char === '"' || char === "'") { inString = true; stringChar = char; continue; }
  if (char === '`') { inTemplate = true; continue; }

  if (char === '{') braces++;
  else if (char === '}') braces--;
  else if (char === '(') parens++;
  else if (char === ')') parens--;
  else if (char === '[') brackets++;
  else if (char === ']') brackets--;

  if (braces < 0) {
    console.log(`Extra } at index ${i}`);
    break;
  }
}

console.log(`Final count - Braces: ${braces}, Parens: ${parens}, Brackets: ${brackets}`);
