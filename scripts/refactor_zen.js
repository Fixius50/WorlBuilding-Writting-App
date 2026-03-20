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

    // Replace text-white -> text-foreground
    content = content.replace(/\btext-white\b/g, 'text-foreground');
    // text-slate-* -> text-foreground/60
    content = content.replace(/\btext-slate-[3456]00\b/g, 'text-foreground/60');
    // text-red-* -> text-destructive
    content = content.replace(/\btext-red-500\b/g, 'text-destructive');
    // border-white/x -> border-foreground/x
    content = content.replace(/\bborder-white\/(\d+)\b/g, 'border-foreground/$1');
    // bg-white/x -> bg-foreground/x
    content = content.replace(/\bbg-white\/(\d+)\b/g, 'bg-foreground/$1');
    // bg-black/x -> bg-background/x
    content = content.replace(/\bbg-black\/(\d+)\b/g, 'bg-background/$1');
    // remove backdrop-blur-*
    content = content.replace(/\bbackdrop-blur(?:-[a-z0-9]+)?\b/g, '');
    // glass-border -> border-[color:var(--divider-border)]
    content = content.replace(/\bborder-glass-border\b/g, 'border-[color:var(--divider-border)]');
    // bg-surface-dark -> monolithic-panel
    content = content.replace(/\bbg-surface-dark\b/g, 'monolithic-panel');
    // bg-surface-light -> sunken-panel
    content = content.replace(/\bbg-surface-light\b/g, 'sunken-panel');
    // bg-[#0d0d12] or similar dark hexes -> bg-background
    content = content.replace(/\bbg-\[#[0-9a-fA-F]{6}\]\b/g, 'bg-background');
    content = content.replace(/\bbg-background-dark\b/g, 'bg-background');

    // clean up duplicate spaces caused by removing backdrop-blur
    content = content.replace(/  +/g, ' ');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated:', filePath);
    }
}

console.log('Starting refactor script...');
walkDir(srcDir, processFile);
console.log('Done.');
