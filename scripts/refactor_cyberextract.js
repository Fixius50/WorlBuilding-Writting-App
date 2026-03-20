const fs = require('fs');
const path = require('path');

const linguisticsDir = path.join(__dirname, 'src', 'features', 'Linguistics');

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Eradicate neon colors
    content = content.replace(/text-\[#00E5FF\]/g, 'text-primary');
    content = content.replace(/bg-\[#00E5FF\]/g, 'bg-primary');
    content = content.replace(/border-\[#00E5FF\]/g, 'border-primary');
    content = content.replace(/from-\[#00E5FF\]/g, 'from-primary');
    content = content.replace(/stroke-\[#00E5FF\]/g, 'stroke-primary');
    
    // Handle specific hex colors in state/js logic
    content = content.replace(/'#00E5FF'/g, "'hsl(var(--primary))'");

    // Backgrounds
    content = content.replace(/bg-\[#050B0D\]/g, 'bg-background');
    content = content.replace(/bg-\[#050508\]/g, 'bg-background');
    content = content.replace(/bg-\[#1a1a20\]/g, 'bg-background');
    
    // Shadows
    content = content.replace(/shadow-\[0_0_10px_#00E5FF\]/g, 'shadow-lg shadow-primary/20');
    content = content.replace(/shadow-\[0_0_20px_rgba\(0,229,255,0\.([0-9])\)\]/g, 'shadow-xl shadow-primary/20');
    content = content.replace(/drop-shadow-\[0_0_10px_rgba\(0,229,255,0\.([0-9])\)\]/g, 'drop-shadow-md');

    // Make sure we catch opacity modifiers like bg-[#00E5FF]/10
    // Actually our previous replace got `bg-[#00E5FF]` but LEFT `/10` intact!
    // Example: `bg-[#00E5FF]/10` -> `bg-primary/10`. This is perfectly valid Tailwind and works brilliantly.

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir(linguisticsDir, processFile);
