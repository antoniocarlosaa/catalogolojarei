const fs = require('fs');

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

// We will use a stack to keep track of {
let stack = [];
let inString = null; // can be ', ", `
let inLineComment = false;
let inBlockComment = false;
let inRegex = false;

for (let i = 0; i < code.length; i++) {
  const char = code[i];
  const nextChar = code[i+1];
  const prevChar = i > 0 ? code[i-1] : null;

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
    if (char === '\\') i++; // skip escaped char
    else if (char === inString) inString = null;
    continue;
  }

  // Not in comment, not in string
  if (char === '/' && nextChar === '/') {
    inLineComment = true; i++; continue;
  }
  if (char === '/' && nextChar === '*') {
    inBlockComment = true; i++; continue;
  }

  if (char === "'" || char === '"' || char === '`') {
    inString = char;
    continue;
  }

  // We skip regex matching for simplicity since there are not many complex regex in AdminPanel.tsx 
  // that contain unbalanced brackets. Let's assume standard brackets
  if (char === '{') {
    // line number
    const line = code.substring(0, i).split('\n').length;
    stack.push({ index: i, line });
  } else if (char === '}') {
    stack.pop();
  }
}

console.log("Unmatched { are at:");
for (const item of stack) {
  console.log("Line " + item.line + ": " + code.substring(item.index, item.index + 20).replace(/\n/g, ' '));
}
