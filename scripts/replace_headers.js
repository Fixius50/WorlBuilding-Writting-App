const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFiles(dir) {
    walkDir(dir, function(filePath) {
        if (filePath.endsWith('.tsx') || filePath.endsWith('.jsx')) {
            let content = fs.readFileSync(filePath, 'utf-8');
            let modified = false;
            
            // Reemplazar justify-between con justify-center gap-12 text-center en <header className="...">
            let newContent = content.replace(/<header className=\"([^\"]*)justify-between([^\"]*)\"/g, (match, p1, p2) => {
                modified = true;
                return `<header className="${p1}justify-center gap-12 text-center${p2}"`;
            });
            
            // Reemplazar en <header className={`... justify-between ...`}>
            newContent = newContent.replace(/<header className=\{\`([^\`]*)justify-between([^\`]*)\`\}/g, (match, p1, p2) => {
                modified = true;
                return `<header className={\`${p1}justify-center gap-12 text-center${p2}\`}`;
            });

            if (modified) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log('Updated: ' + filePath);
            }
        }
    });
}

processFiles('src/features');
processFiles('src/pages');
