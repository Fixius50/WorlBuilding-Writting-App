// Basic Drawing Logic
const canvas = document.getElementById('glyphCanvas');
const ctx = canvas.getContext('2d');
let isDrawing = false;
let startX = 0;
let startY = 0;
let lastX = 0;
let lastY = 0;
let currentMode = 'free'; // free, line, curve
let savedImageData; // For tools like line/curve to preview
const historyStack = [];
let historyStep = -1;

// Set initial style
ctx.strokeStyle = '#E0D4B4'; // Paper color
ctx.lineWidth = 15; // Thick stroke for glyphs
ctx.lineCap = 'round';
ctx.lineJoin = 'round';

// Handle Canvas Resizing
function resizeCanvas() {
    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    // Re-apply styles after resize
    ctx.strokeStyle = '#E0D4B4';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}
window.addEventListener('resize', resizeCanvas);
// Call once on load
setTimeout(resizeCanvas, 100);

function setMode(mode) {
    currentMode = mode;
    // Highlight active button
    document.querySelectorAll('[id^=btn]').forEach(b => b.classList.remove('text-primary'));
    document.querySelectorAll('[id^=btn]').forEach(b => b.classList.add('text-slate-400'));
    const btn = document.getElementById('btn' + mode.charAt(0).toUpperCase() + mode.slice(1));
    if (btn) {
        btn.classList.add('text-primary');
        btn.classList.remove('text-slate-400');
    }
}

function saveHistory() {
    // Keep stack clean if we branched off
    if (historyStep < historyStack.length - 1) {
        historyStack.length = historyStep + 1;
    }
    historyStack.push(canvas.toDataURL());
    historyStep++;
}

function undo() {
    if (historyStep > 0) {
        historyStep--;
        loadHistory(historyStack[historyStep]);
    } else if (historyStep === 0) {
        // Clear if at start
        clearCanvas();
        historyStep = -1;
    }
}

function redo() {
    if (historyStep < historyStack.length - 1) {
        historyStep++;
        loadHistory(historyStack[historyStep]);
    }
}

function loadHistory(dataUrl) {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
}

canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    [startX, startY] = [e.offsetX, e.offsetY];
    [lastX, lastY] = [startX, startY];

    // Save state before drawing if this is a new stroke
    if (currentMode === 'free') {
        ctx.beginPath();
        ctx.moveTo(startX, startY);
    } else {
        savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;

    if (currentMode === 'free') {
        draw(e.offsetX, e.offsetY);
    } else if (currentMode === 'line') {
        ctx.putImageData(savedImageData, 0, 0); // Restore to show preview
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(e.offsetX, e.offsetY);
        ctx.stroke();
    } else if (currentMode === 'curve') {
        // Simple Quad Curve preview: Use midpoint as control for visual feedback? 
        // Or drag straight line then bend?
        // Let's implement: Pull Line.
        ctx.putImageData(savedImageData, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        // Simple Bezier for visual flare, control point is mouse, end is reflected? 
        // Let's stick to Quad Curve where mouse is Control Point, end is fixed? 
        // No, standard click-drag usually defines end point.
        // Let's do simple Quad: Start, Mouse = Control, End = (Start + Mouse)? No.
        // Let's do a simple Q-Curve where you draw a line to define end, 
        // but for now simpler is better:
        // Draw a line that curves slightly towards the mouse relative to start?
        // Let's just do a Quadratic Curve where Control Point is current mouse, 
        // and End Point is the reflection or fixed distance? 
        // Actually, easiest flow: Click-Drag = Line. Release. Then Drag = Curve. Click = Finish.
        // That's complex.
        // Simpler: Mouse is Control Point. Start and End are... fixed? No.

        // Let's retry: Mode Curve = Quad Curve.
        // Start = mousedown. End = mouseup. Control = midpoint + offset?
        // Let's stick to standard "Line" behavior for now as "Curve" needs more UI/logic than 1-step.
        // I will implement a "Smooth" freehand or similar.
        // Actually, let's implement the "Curve" as a Semi-Circle arc for simplicity or just a wrapper.
        // Or: Mousedown = Start. Mousemove = End. Mouseup = FINISH line.
        // Let's skip complex curve interaction for this single turn and implement a simple curved stroke.

        // Let's just treat Curve as a "Line" with tension? 
        // I will implement "Line" tool correctly. "Curve" will be a "Smooth Freehand" or similar?
        // User asked for "alternar entre lineas, curvas"
        // Let's do: Line (straight), Curve (Quad curve with fixed control offset just to distinct it, or just freehand smoothing).
        // Let's make Curve = Quad Curve where Control point is (MouseX, MouseY) and End point is mirrored? No.
        // Let's make Curve = Draw Line, but on mouseup it bends?
        // Okay, I will implement Line. For Curve, I will assume it means "Bezier" tool which is click-start, click-end, drag-control. Too complex.
        // I will implement Curve as simply another "Line" logic but `quadraticCurveTo`.
        // Start = startX. End = current mouse. Control = (startX, mouseY)? Random flare.

        // BETTER IDEA: "Curve" tool draws a Quad curve from Start to End, using (Start.x, End.y) as control point.
        ctx.putImageData(savedImageData, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(startX, e.offsetY, e.offsetX, e.offsetY); // Corner curve
        ctx.stroke();
    }
});

canvas.addEventListener('mouseup', (e) => {
    if (isDrawing) {
        isDrawing = false;
        // Finalize for tools handled in mousemove
        if (currentMode !== 'free') {
            // Already drawn in mousemove preview
        }
        saveHistory();
    }
});
canvas.addEventListener('mouseout', () => isDrawing = false);

function draw(x, y) {
    // Only used for freehand in mousemove
    ctx.lineTo(x, y);
    ctx.stroke();
    [lastX, lastY] = [x, y];
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function vectorizeCanvas() {
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('file', blob, 'glyph.png');

        fetch('/api/conlang/vectorize', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text()) // Returns SVG path string
            .then(svgPath => {
                console.log("Vector Path:", svgPath);
                alert("Vectorizado exitosamente! (Ver consola)");
                // Store svgPath in current word object
            })
            .catch(err => console.error(err));
    });
}

// Semantic Analysis Auto-trigger
document.getElementById('lemaInput').addEventListener('blur', (e) => {
    const text = e.target.value;
    if (!text) return;

    fetch(`/api/conlang/analyze-semantics?text=${encodeURIComponent(text)}`)
        .then(res => res.json())
        .then(concepts => {
            const container = document.getElementById('semanticsTags');
            container.innerHTML = '';
            concepts.forEach(c => {
                const tag = document.createElement('span');
                tag.className = 'bg-indigo-900/50 text-indigo-200 px-2 py-0.5 rounded border border-indigo-700';
                tag.innerText = c;
                container.appendChild(tag);
            });
        });
});

// Font Generation Removed per user request

const tabs = document.querySelectorAll('button');
// Removed Font Export bindings

// Save Entity Logic
function saveConlangAsEntity() {
    const name = document.getElementById('conlangNameInput').value;
    if (!name) { alert("Por favor escribe un nombre."); return; }

    fetch('/api/conlang/save-entity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `name=${encodeURIComponent(name)}&description=${encodeURIComponent("Idioma creado en Taller")}`
    })
        .then(res => {
            if (res.ok) alert("Idioma guardado en la Biblia!");
            else alert("Error al guardar.");
        });
}

// Initialize History
// Initialize
saveHistory();
fetchStats();

function fetchStats() {
    fetch('/api/conlang/stats')
        .then(res => res.json())
        .then(data => {
            // Update UI
            // Assuming IDs: stat-words, stat-rules, stat-glyphs
            const w = document.getElementById('stat-words');
            const r = document.getElementById('stat-rules');
            const g = document.getElementById('stat-glyphs');
            if (w) w.innerText = data.words;
            if (r) r.innerText = data.rules;
            if (g) g.innerText = data.glyphs;
        })
        .catch(err => console.error("Stats Error:", err));
}

console.log("Conlangs Module Loaded (Client-Side Gen)");
