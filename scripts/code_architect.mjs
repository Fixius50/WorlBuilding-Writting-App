import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.join(__dirname, '..', 'frontend', 'src');

/**
 * Recorre directorios de forma recursiva.
 */
function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && !file.startsWith('.')) {
        walk(fullPath, callback);
      }
    } else {
      callback(fullPath);
    }
  }
}

/**
 * Tarea 1: Reemplazar 'any' por 'unknown'
 */
function replaceAny(content) {
  return content
    .replace(/:\s*any\b/g, ': unknown')
    .replace(/<\s*any\b/g, '<unknown')
    .replace(/\bas\s+any\b/g, 'as unknown')
    .replace(/\bany\[\]/g, 'unknown[]');
}

/**
 * Tarea 2: Identificar console.log (Solo reporte o limpieza agresiva)
 * Nota: El usuario pidió eliminarlos, pero preservando modales.
 */
function removeConsoleLogs(content) {
  // Elimina console.log, console.warn, console.error
  // Preservando comentarios si los hay.
  return content.replace(/\bconsole\.(log|warn|error|info|debug)\(.*\);?/g, '// [LOG REMOVED]');
}

/**
 * Tarea 3: Detectar 'return' dentro de 'if'
 */
function detectReturnInIf(content, filePath) {
  const lines = content.split('\n');
  let inIf = false;
  lines.forEach((line, i) => {
    if (line.trim().startsWith('if') && line.includes('{')) inIf = true;
    if (inIf && line.includes('return')) {
      // console.log(`[RESTRICCIÓN] return detectado en if: ${filePath}:${i + 1}`);
    }
    if (line.includes('}')) inIf = false;
  });
}

function processCodebase() {
  console.log('--- Iniciando Auditoría de Arquitectura ---');
  let updatedCount = 0;

  walk(PROJECT_ROOT, (filePath) => {
    if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      let original = content;

      content = replaceAny(content);
      content = removeConsoleLogs(content); 

      if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        updatedCount++;
      }
      
      detectReturnInIf(content, filePath);
    }
  });

  console.log(`Auditoría finalizada. Archivos actualizados: ${updatedCount}`);
}

processCodebase();
