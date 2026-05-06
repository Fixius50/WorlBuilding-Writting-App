const fs = require('fs');
const path = require('path');

const baseDir = 'C:\\Users\\rober\\Desktop\\Proyectos propios\\WorldbuildingApp\\frontend\\src';

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const replacements = [
    { search: /backdrop-blur-[a-z0-9-]+/g, replace: '' },
    { search: /GlassPanel/g, replace: 'MonolithicPanel' },
    { search: /@atoms\/GlassPanel/g, replace: '@atoms/MonolithicPanel' },
    { search: /bg-black\/40/g, replace: 'bg-background' },
    { search: /bg-white\/[0-9]+/g, replace: 'bg-background' },
    { search: /bg-white\/\[0\.[0-9]+\]/g, replace: 'bg-background' }
];

walkDir(baseDir, (filePath) => {
    if (filePath.endsWith('.tsx') || filePath.endsWith('.css') || filePath.endsWith('.ts')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let originalContent = content;
        
        replacements.forEach(r => {
            content = content.replace(r.search, r.replace);
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated: ${filePath}`);
        }
    }
});
