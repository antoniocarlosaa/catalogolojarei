const parser = require('@babel/parser');
const fs = require('fs');

const codeObj = fs.readFileSync('components/AdminPanel.tsx', 'utf8').split('\n');

let low = 0;
let high = codeObj.length;
let ans = -1;

for (let i = codeObj.length; i >= 10; i--) {
  let lines = codeObj.slice(0, i);
  // append enough closing to close the outer AdminPanel.
  // The outer AdminPanel is `return ( <div1> <div2> <div3> [contents] </div></div></div> ); }; export default AdminPanel;`
  let testCode = lines.join('\n') + '\n</div></div></div></div></div></div></div></div>);};\nexport default AdminPanel;\n';
  try {
    parser.parse(testCode, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    console.log("Success at line " + i + ". Missing bracket must be after line " + i);
    break;
  } catch (err) {
    if (err.message.includes('export')) {
      // still 'import and export may only appear...' - meaning it's still swallowed
    } else {
      console.log("Error changed at line " + i + ": " + err.message);
    }
  }
}
