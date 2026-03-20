const fs = require('fs');

const path = 'c:\\Users\\rober\\Desktop\\Proyectos propios\\WorldbuildingApp\\src\\features\\Settings\\pages\\Settings.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace card sections
content = content.replace(/bg-background\/20 border border-foreground\/5/g, 'monolithic-panel');

// Replace sunken items
content = content.replace(/border-foreground\/5 bg-background\/20/g, 'sunken-panel');
content = content.replace(/bg-background\/20 border border-foreground\/10/g, 'sunken-panel border-foreground/10');
content = content.replace(/bg-background\/40 rounded-2xl border border-foreground\/5 shadow-inner/g, 'sunken-panel rounded-2xl');
content = content.replace(/className="bg-background\/20 text-foreground"/g, 'className="text-foreground"'); // options in select inherit bg

fs.writeFileSync(path, content, 'utf8');
