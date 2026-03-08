import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_ROOT = path.join(__dirname, 'src/main/frontend');
const NEW_ROOT = path.join(FRONTEND_ROOT, 'src');

if (!fs.existsSync(NEW_ROOT)) fs.mkdirSync(NEW_ROOT, { recursive: true });

// Mapping rule: (old relative to FRONTEND_ROOT) -> (new relative to NEW_ROOT)
const getNewSubdir = (oldRelPath) => {
    const parts = oldRelPath.split(path.sep).join('/');

    // CSS to assets
    if (parts.startsWith('css/')) return 'assets/' + parts.substring(4);
    // Public keeps conceptually, but we leave it out of src if it's static, let's just move it to public later or ignore
    if (parts.startsWith('public/')) return null; // don't process public
    if (parts === 'index.html') return null; // keep in FRONTEND_ROOT
    if (parts === 'main.jsx' || parts === 'jsx/main.jsx') return 'main.jsx';
    if (parts === 'App.jsx' || parts === 'jsx/App.jsx') return 'App.jsx';

    // JS helpers -> hooks/services/utils
    if (parts.startsWith('js/services/')) return 'services/' + parts.substring(12);
    if (parts.startsWith('js/constants/')) return 'utils/constants/' + parts.substring(13);
    if (parts.startsWith('js/libs/')) return 'utils/libs/' + parts.substring(8);
    if (parts.startsWith('js/suggestion.js') || parts.startsWith('js/TiptapExtensions.js')) return 'utils/' + parts.substring(3);

    // Context
    if (parts.startsWith('jsx/context/')) return 'context/' + parts.substring(12);
    // Locales
    if (parts.startsWith('jsx/locales/')) return 'locales/' + parts.substring(12);

    // Mappings for Features
    const featureMap = {
        'bible': 'WorldBible',
        'WorldBible': 'WorldBible',
        'dashboard': 'Dashboard',
        'editor': 'Editor',
        'entities': 'Entities',
        'Entities': 'Entities',
        'graph': 'Graph',
        'Graph': 'Graph',
        'linguistics': 'Linguistics',
        'Linguistics': 'Linguistics',
        'map': 'Maps',
        'maps': 'Maps',
        'Maps': 'Maps',
        'relationships': 'Relationships',
        'settings': 'Settings',
        'Specialized': 'Specialized',
        'Timeline': 'Timeline',
        'Trash': 'Trash',
        'writing': 'Writing',
        'Writing': 'Writing'
    };

    // Components
    if (parts.startsWith('jsx/components/')) {
        const sub = parts.substring(15); // after jsx/components/
        const subParts = sub.split('/');
        const category = subParts[0];

        if (category === 'common' || category === 'layout') {
            return 'components/' + sub; // Keep in global components
        }
        if (subParts.length === 1) { // Root components like ConfirmationModal.jsx
            return 'components/common/' + sub;
        }

        const feature = featureMap[category];
        if (feature) {
            return `features/${feature}/components/${subParts.slice(1).join('/')}`;
        }
        return 'components/' + sub; // fallback
    }

    // Pages
    if (parts.startsWith('jsx/pages/')) {
        const sub = parts.substring(10);
        const subParts = sub.split('/');
        const category = subParts[0];

        if (subParts.length === 1) { // Root pages like ProjectView.jsx, Login.jsx
            if (category === 'Settings.jsx') return 'features/Settings/pages/Settings.jsx';
            return 'pages/' + sub;
        }

        const feature = featureMap[category];
        if (feature) {
            return `features/${feature}/pages/${subParts.slice(1).join('/')}`;
        }
        return 'pages/' + sub; // fallback
    }

    // Default fallback: keep structure inside src/
    return parts;
};

// 1. Traverse and build map
const fileMap = {}; // oldAbs -> newAbs

const walkSync = (dir, filelist = []) => {
    if (!fs.existsSync(dir)) return filelist;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (file === 'node_modules' || file === 'src') continue;
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
            walkSync(filepath, filelist);
        } else {
            filelist.push(filepath);
        }
    }
    return filelist;
};

const allFiles = walkSync(FRONTEND_ROOT)
    .filter(f => !f.startsWith(NEW_ROOT));

console.log(`Found ${allFiles.length} files to process.`);

allFiles.forEach(oldAbs => {
    const oldRel = path.relative(FRONTEND_ROOT, oldAbs).split(path.sep).join('/');
    const newSubdir = getNewSubdir(oldRel);
    if (newSubdir) {
        fileMap[oldAbs] = path.join(NEW_ROOT, newSubdir);
    }
});

// Helper to resolve an import
// currOldAbs: absolute path of current file before moving
// importPath: string in the require/import statement e.g. '../components/Button' or '@/js/algo'
const resolveImport = (currOldAbs, importPath) => {
    if (importPath.startsWith('@/')) {
        // Alias import relative to FRONTEND_ROOT
        const targetOldRel = importPath.substring(2); // e.g. jsx/components/Button
        // However, we don't know the exact file extension. Let's find it.
        const extensions = ['', '.js', '.jsx', '.css', '/index.js', '/index.jsx'];
        for (const ext of extensions) {
            const checkPath = path.join(FRONTEND_ROOT, targetOldRel + ext);
            if (fileMap[checkPath]) return fileMap[checkPath];
        }
    } else if (importPath.startsWith('.')) {
        // Relative import
        const oldDir = path.dirname(currOldAbs);
        const targetOldAbs = path.resolve(oldDir, importPath);
        const extensions = ['', '.js', '.jsx', '.css', '/index.js', '/index.jsx'];
        for (const ext of extensions) {
            const checkPath = targetOldAbs + ext;
            if (fileMap[checkPath]) return fileMap[checkPath];
        }
    }
    return null;
};

// 2. Read contents and fix imports
const updateFile = (oldAbs, newAbs) => {
    let content = fs.readFileSync(oldAbs, 'utf8');

    // Only update JS/JSX files
    if (oldAbs.endsWith('.jsx') || oldAbs.endsWith('.js')) {
        // Regex to catch imports
        const importRegex = /(import\s+.*?from\s+['"])(.*?)(['"])/g;
        const dynamicRegex = /(import\(['"])(.*?)(['"]\))/g;
        const sideEffectRegex = /(import\s+['"])(.*?)(['"])/g;

        const replacer = (match, p1, p2, p3) => {
            if (p2.startsWith('.') || p2.startsWith('@/')) {
                const targetNewAbs = resolveImport(oldAbs, p2);
                if (targetNewAbs) {
                    const newDir = path.dirname(newAbs);
                    let newRelative = path.relative(newDir, targetNewAbs).split(path.sep).join('/');
                    if (!newRelative.startsWith('.')) newRelative = './' + newRelative;

                    // Strip extensions if they weren't in the original import
                    if (!p2.endsWith('.jsx') && !p2.endsWith('.js') && !p2.endsWith('.css')) {
                        newRelative = newRelative.replace(/\.jsx$/, '').replace(/\.js$/, '');
                    }

                    return p1 + newRelative + p3;
                }
            }
            return match;
        };

        content = content.replace(importRegex, replacer);
        content = content.replace(dynamicRegex, replacer);
        content = content.replace(sideEffectRegex, replacer);
    }

    // Ensure dir exists
    const targetDir = path.dirname(newAbs);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(newAbs, content, 'utf8');
};

let processed = 0;
for (const [oldAbs, newAbs] of Object.entries(fileMap)) {
    try {
        updateFile(oldAbs, newAbs);
        processed++;
    } catch (e) {
        console.error(`Error processing ${oldAbs}:`, e);
    }
}

console.log(`Successfully migrated and updated imports for ${processed} files.`);
