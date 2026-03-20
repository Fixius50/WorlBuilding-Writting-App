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

    // Remove inline styles for dividers and panel borders, append tailwind class
    // This is tricky because style={{ borderColor: 'var(--divider-border)' }} needs to be removed
    // AND we must ensure 'border-foreground/10' is added to className.
    // Instead of complex AST parsing, we can do simple string replacements if formatted predictably:

    // 1. Convert border-[color:var(...)]
    content = content.replace(/border-\[color:var\(--divider-border\)\]/g, 'border-foreground/10');
    content = content.replace(/border-\[color:var\(--panel-border\)\]/g, 'border-foreground/40');
    content = content.replace(/border-\[color:var\(--sunken-border\)\]/g, 'border-foreground/20');

    // 2. Remove style={{ borderColor: ... }} entirely
    // The previous tailwind class 'border-b', 'border-t' are already in className!
    // We just strip the inline style and rely on standard `border-border` from base layered index.css,
    // OR inject border-foreground/10 manually. Let's just strip the style and add border-foreground/10.
    
    // We can replace the exact style string and we assume the parent tag handles default border-color via Tailwind,
    // wait, if we just remove the style=... then Tailwind's default `border-border` will take over.
    // If that's too subtle, let's inject border-foreground/10 into the class.
    
    // To be safe, just replace the literal strings
    content = content.replace(/style=\{\{\s*borderColor:\s*'var\(--divider-border\)'\s*\}\}/g, '');
    content = content.replace(/style=\{\{\s*borderColor:\s*'var\(--panel-border\)'\s*\}\}/g, '');
    
    // To ensure the borders have color, we'll replace className="... border-b ..." with "border-b border-foreground/10"
    // But since it's hard to parse, we can just let @layer base { * { @apply border-foreground/10 } } handle the default!
    // Wait, by default `border-border` is used. We can change `border` in tailwind config to match divider-border!

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir(srcDir, processFile);

// Also modify index.css to match Zen specs
const cssPath = path.join(__dirname, 'src', 'assets', 'index.css');
if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    
    // Remove the * {} block with inline vars
    css = css.replace(/\/\*[\s\S]*?Configuración de Bordes[\s\S]*?\* \{\s*--panel-border:[^}]+\s*\}/, '');
    
    // Update monolithic-panel
    css = css.replace(/border-color:\s*var\(--panel-border\);/g, '@apply border-foreground/40;');
    
    // Update sunken-panel
    css = css.replace(/border-color:\s*var\(--sunken-border\);/g, '@apply border-foreground/20;');
    css = css.replace(/box-shadow:\s*inset[^;]+;/, 'box-shadow: inset 0 2px 10px hsl(var(--foreground) / 0.1);');

    fs.writeFileSync(cssPath, css, 'utf8');
}
