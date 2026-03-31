import fs from 'fs';
import path from 'path';

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

let count = 0;
walkDir('./src', function(filePath) {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Replace: ": any", ":any", "<any", "as any"
    let newContent = content
      .replace(/:\s*any\b/g, ': unknown')
      .replace(/<\s*any\b/g, '<unknown')
      .replace(/\bas\s+any\bd/g, 'as unknown');
    
    // Fallback for just "any" as a type but not breaking variable names
    // It's safer to just run this and see
    newContent = newContent.replace(/\bany\[\]/g, 'unknown[]');

    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      count++;
    }
  }
});
console.log(`Archivos actualizados: ${count}`);
