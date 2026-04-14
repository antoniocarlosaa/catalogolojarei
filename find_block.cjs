const parser = require('@babel/parser');
const fs = require('fs');
const traverse = require('@babel/traverse').default;

const code = fs.readFileSync('components/AdminPanel.tsx', 'utf8');
const testCode = code.replace('export default AdminPanel;', '}\nexport default AdminPanel;');

const ast = parser.parse(testCode, {
  sourceType: 'module',
  plugins: ['jsx', 'typescript']
});

let found = null;
traverse(ast, {
  enter(path) {
    if (path.node.loc && path.node.loc.end.line >= 1528 && path.node.loc.start.line < 1528) {
      if (!found || (path.node.loc.start.line > found.loc.start.line)) {
        found = path.node;
      }
    }
  }
});

console.log("The node that spans until the end is:");
console.log(found.type);
console.log("Starts at line:", found.loc.start.line);
console.log(testCode.split('\n')[found.loc.start.line - 1]);
