document.addEventListener('DOMContentLoaded', async () => {
    initScrubber();
    loadEventsForTimeline();
});

let currentEvents = [];
let currentRelations = [];

async function loadEventsForTimeline() {
    const sidebar = document.getElementById('sidebar-events');
    if (sidebar) sidebar.innerHTML = '<div class="text-center text-slate-500 py-10 text-xs">Cargando...</div>';

    try {
        // Parallel Fetch
        const [eventsRes, relationsRes] = await Promise.all([
            fetch('/api/timeline/eventos'),
            fetch('/api/timeline/relaciones')
        ]);

        if (eventsRes.ok) currentEvents = await eventsRes.json();
        if (relationsRes.ok) currentRelations = await relationsRes.json();

        renderEvents();
    } catch (e) {
        console.error(e);
        if (sidebar) sidebar.innerHTML = '<div class="text-red-400 text-xs p-4">Error cargando hilos del destino.</div>';
    }
}

function renderEvents() {
    const canvas = document.getElementById('canvas-content');
    const sidebar = document.getElementById('sidebar-events');
    const events = currentEvents || [];
    const relations = currentRelations || [];

    if (!canvas) return;

    // Reset Canvas
    canvas.innerHTML = '';

    // Add central line
    const line = document.createElement('div');
    line.className = 'timeline-line';
    canvas.appendChild(line);

    // SVG Layer
    const svgNS = "http://www.w3.org/2000/svg";
    const svgLayer = document.createElementNS(svgNS, "svg");
    svgLayer.setAttribute("class", "absolute top-0 left-0 w-full h-full pointer-events-none z-0");
    svgLayer.setAttribute("id", "timeline-svg");
    canvas.appendChild(svgLayer);

    if (sidebar) sidebar.innerHTML = '';

    let maxY = 0;

    // Render Events (Dots)
    events.forEach((evt, index) => {
        const yPos = 100 + (index * 150);
        if (yPos > maxY) maxY = yPos;

        const dot = document.createElement('div');
        dot.id = `dot-${evt.id}`;
        dot.className = 'event-dot';
        dot.style.top = `${yPos}px`;
        canvas.appendChild(dot);

        // Pill
        const pill = document.createElement('div');
        pill.className = 'event-pill animate-fade-in-up';
        pill.style.top = `${yPos - 15}px`;
        pill.style.left = index % 2 === 0 ? '55%' : '15%';
        pill.innerHTML = `
            <p class="text-[10px] text-indigo-400 font-bold mb-1">${evt.fechaInGame || '???'}</p>
            <h4 class="text-xs font-bold text-white">${evt.titulo}</h4>
        `;
        canvas.appendChild(pill);

        // Sidebar
        if (sidebar) {
            const card = document.createElement('div');
            card.className = `timeline-event-card ${index === 0 ? 'active' : ''}`;
            card.innerHTML = `
                <p class="text-[10px] text-slate-500 mb-1">${evt.fechaInGame || '???'}</p>
                <h4 class="text-sm font-bold text-white mb-2">${evt.titulo}</h4>
            `;
            sidebar.appendChild(card);
        }
    });

    // Render Relationships (Loops) using DOM positions
    relations.forEach(rel => {
        const sourceDot = document.getElementById(`dot-${rel.eventoOrigenId}`);
        const targetDot = document.getElementById(`dot-${rel.eventoDestinoId}`);

        if (sourceDot && targetDot) {
            // Calculate precise centers relative to canvas
            const startX = sourceDot.offsetLeft + (sourceDot.offsetWidth / 2);
            const startY = sourceDot.offsetTop + (sourceDot.offsetHeight / 2);

            const endX = targetDot.offsetLeft + (targetDot.offsetWidth / 2);
            const endY = targetDot.offsetTop + (targetDot.offsetHeight / 2);

            const path = document.createElementNS(svgNS, "path");

            let controlX;
            if (startY > endY) {
                // Backward Loop -> Curve Left
                controlX = startX - 300;
            } else {
                // Forward link -> Curve Right
                controlX = startX + 300;
            }

            const d = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;

            path.setAttribute("d", d);
            path.setAttribute("fill", "none");
            path.setAttribute("stroke", "#a855f7"); // Purple
            path.setAttribute("stroke-width", "2");
            path.setAttribute("stroke-dasharray", "8,8"); // Dashed
            path.classList.add("animate-pulse");

            svgLayer.appendChild(path);

            // Circle at target
            const circle = document.createElementNS(svgNS, "circle");
            circle.setAttribute("cx", endX);
            circle.setAttribute("cy", endY);
            circle.setAttribute("r", "4");
            circle.setAttribute("fill", "#a855f7");
            svgLayer.appendChild(circle);
        }
    });

    if (maxY > 0) {
        canvas.style.minHeight = `${maxY + 300}px`;
    }
}

function initScrubber() {
    const track = document.querySelector('.scrubber-track');
    const handle = document.querySelector('.scrubber-handle');
    if (!track || !handle) return;
    track.addEventListener('click', (e) => {
        const rect = track.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        handle.style.left = `${pct}%`;
    });
}
