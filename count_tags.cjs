const fs = require('fs');

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

const openTags = [];
let regex = /<\s*([a-zA-Z0-9]+)[^>]*>/g;
let match;
while ((match = regex.exec(code)) !== null) {
  // ignore self-closing tags
  if (match[0].endsWith('/>')) continue;
  // ignore br, hr, img, input
  if (['br', 'hr', 'img', 'input'].includes(match[1].toLowerCase())) continue;
  openTags.push({ tag: match[1], index: match.index });
}

let closeRegex = /<\/\s*([a-zA-Z0-9]+)\s*>/g;
const closeTags = [];
while ((match = closeRegex.exec(code)) !== null) {
  closeTags.push({ tag: match[1], index: match.index });
}

// Now match them linearly since they are nested. Wait, a simple count is easier:
let counts = {};
for (let t of openTags) counts[t.tag] = (counts[t.tag] || 0) + 1;
for (let t of closeTags) counts[t.tag] = (counts[t.tag] || 0) - 1;

for (let tag in counts) {
  if (counts[tag] !== 0) {
    console.log(`Tag <${tag}> balance: ${counts[tag]}`);
  }
}
