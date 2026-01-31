const fs = require('fs');
const path = require('path');

const searchStr = "Sold Vehicles Count";
const rootDir = "c:\\Users\\REI DAS MOTOS SLZ\\Downloads\\rei-das-motos---luxury-catalog\\catalogoreidasmotos";

function searchDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === '.git' || file === 'dist') continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            searchDir(fullPath);
        } else {
            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (content.toLowerCase().includes(searchStr.toLowerCase())) {
                    console.log(`FOUND IN: ${fullPath}`);
                    const lines = content.split('\n');
                    lines.forEach((line, i) => {
                        if (line.toLowerCase().includes(searchStr.toLowerCase())) {
                            console.log(`  Line ${i + 1}: ${line.trim()}`);
                        }
                    });
                }
            } catch (e) {
                // ignore binary
            }
        }
    }
}

console.log("Starting search...");
searchDir(rootDir);
console.log("Search complete.");
