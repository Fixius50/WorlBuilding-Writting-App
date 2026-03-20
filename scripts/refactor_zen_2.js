const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
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

    // bg-white/[...] -> bg-foreground/[...]
    content = content.replace(/\bbg-white\/(?:\[[^\]]+\]|\d+)\b/g, match => match.replace('bg-white', 'bg-foreground'));
    
    // border-white/[...] -> border-foreground/[...]
    content = content.replace(/\bborder-white\/(?:\[[^\]]+\]|\d+)\b/g, match => match.replace('border-white', 'border-[color:var(--divider-border)]'));
    
    // text-slate-\d+ -> text-foreground/60 (blanket replace remaining)
    content = content.replace(/\btext-slate-\d+\b/g, 'text-foreground/60');
    
    // text-white/x -> text-foreground/x
    content = content.replace(/\btext-white\/(?:\[[^\]]+\]|\d+)\b/g, match => match.replace('text-white', 'text-foreground'));

    // specific hardcoded dark backgrounds
    content = content.replace(/\bbg-\[#0d0d12\]\b/g, 'sunken-panel !bg-background');
    content = content.replace(/\bbg-\[#0a0a0c\]\b/g, 'monolithic-panel');
    content = content.replace(/\bbg-\[#111\]\b/g, 'bg-background');
    content = content.replace(/\bbg-\[#1e1e1e\]\b/g, 'monolithic-panel border-b border-[color:var(--divider-border)]');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir(srcDir, processFile);
