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

    // Pattern 1: Panels that have bg-foreground/X and a border
    content = content.replace(/bg-foreground\/\d+\s+border\s+border-foreground\/\d+/g, 'monolithic-panel');
    content = content.replace(/bg-background\/\d+\s+border\s+border-foreground\/\d+/g, 'monolithic-panel');
    content = content.replace(/bg-\[#[0-9a-fA-F]+\]\s+border\s+border-foreground\/\d+/g, 'monolithic-panel');

    // Pattern 2: Replace stray border-foreground/X with semantic variables
    // border-foreground/5 usually meant extremely subtle divider
    content = content.replace(/\bborder-foreground\/5\b/g, 'border-[color:var(--divider-border)]');
    // border-foreground/10, /20 usually meant panel borders or active inputs
    content = content.replace(/\bborder-foreground\/10\b/g, 'border-[color:var(--panel-border)]');
    content = content.replace(/\bborder-foreground\/20\b/g, 'border-[color:var(--panel-border)]');
    content = content.replace(/\bborder-foreground\/30\b/g, 'border-[color:var(--panel-border)]');

    // Pattern 3: Old slate borders
    content = content.replace(/\bborder-slate-\d+\b/g, 'border-[color:var(--divider-border)]');
    
    // Convert stray bg-slate to standard foreground modes
    content = content.replace(/\bbg-slate-\d+\/\d+\b/g, 'bg-foreground/5');
    content = content.replace(/\bbg-slate-\d+\b/g, 'bg-foreground/5');

    // Convert old text-slate
    content = content.replace(/\btext-slate-\d+\/\d+\b/g, 'text-foreground/60');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir(srcDir, processFile);
