const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8');

// Try adding '}' up to 10 times at the end before the export statement
for (let i = 0; i <= 10; i++) {
  const testCode = code.replace('export default AdminPanel;', '}'.repeat(i) + '\nexport default AdminPanel;');
  try {
    parser.parse(testCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    console.log(`Success with ${i} extra } added!`);
    break;
  } catch (err) {
    if (i === 10) console.log("Failed even after 10 } brackets added.");
  }
}
