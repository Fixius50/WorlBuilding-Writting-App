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

    // Erradicar grandes redondeos hardcodeados ignorando botones completamente redondos si se pudiera,
    // pero como Zen Theme requiere picos afilados, eliminaremos todo menos rounded-full (que suele ser avatars o badges redondos).
    // rounded-xl (0.75rem), rounded-2xl (1rem), rounded-3xl (1.5rem), rounded-[32px], rounded-[2rem], rounded-[2.5rem]
    // Reemplazar por rounded-none
    
    content = content.replace(/\brounded-(?:xl|2xl|3xl|lg|md|sm)\b/g, 'rounded-none');
    content = content.replace(/\brounded-\[[0-9]+px\]\b/g, 'rounded-none');
    content = content.replace(/\brounded-\[[0-9.]+rem\]\b/g, 'rounded-none');
    // We intentionally ignore `rounded-full` as it ruins user profile avatars, color circles, and toggle pills.
    // Also change `rounded` without size suffixes as it defaults to `var(--radius)` which is 0 anyway, but leaving it is harmless.

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
    }
}

walkDir(srcDir, processFile);
