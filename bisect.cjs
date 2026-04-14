const parser = require('@babel/parser');
const fs = require('fs');

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8').split('\n');

for (let lineNum = 1400; lineNum >= 50; lineNum -= 50) {
  const testCode = code.slice(0, lineNum).join('\n') + '\n</div></div></div></div></div>);};\nexport default AdminPanel;';
  try {
    parser.parse(testCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    console.log(`Success when slicing at line ${lineNum}! Missing bracket must be AFTER line ${lineNum}`);
    break;
  } catch (err) {
    if (err.message.includes('export')) {
      // still broken
    } else {
       console.log(`At line ${lineNum}, other error: ` + err.message);
    }
  }
}
