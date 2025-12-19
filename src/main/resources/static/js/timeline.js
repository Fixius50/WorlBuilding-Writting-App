document.addEventListener('DOMContentLoaded', async () => {
    // Check Auth
    // (Existing auth_guard runs first)

    // Load Universes for the current timeline view
    // For now, hardcode project ID or get from URL params if available.
    // If not, fetch for the first project of the user? 
    // Let's assume we are viewing a specific project: ?id=1
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id') || 1; // Default to Seeder Project

    await loadMultiverse(projectId);
});

async function loadMultiverse(projectId) {
    const sidebar = document.querySelector('aside .overflow-y-auto');
    if (!sidebar) return;

    sidebar.innerHTML = '<div class="text-slate-500 text-xs p-4">Cargando multiverso...</div>';

    try {
        // Fetch Universes
        const universes = await fetch(`/api/multiverso/cuaderno/${projectId}`).then(r => r.json());

        sidebar.innerHTML = '';

        if (universes.length === 0) {
            sidebar.innerHTML = '<div class="text-slate-500 text-xs p-4">Sin universos.</div>';
            return;
        }

        // Render Universes and their Timelines in the Sidebar
        for (const u of universes) {
            const uDiv = document.createElement('div');
            uDiv.className = 'mb-4';
            uDiv.innerHTML = `
                <div class="px-4 py-2 text-xs font-bold text-indigo-400 uppercase tracking-wider flex justify-between items-center group cursor-pointer hover:bg-white/5 rounded-lg mx-2 transition-colors">
                    ${u.nombre}
                    <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100">expand_more</span>
                </div>
                <div class="space-y-1 mt-1 pl-2" id="lines-universe-${u.id}"></div>
            `;
            sidebar.appendChild(uDiv);

            // Fetch Timelines for this Universe
            const lines = await fetch(`/api/timeline/lineas/universo/${u.id}`).then(r => r.json());
            const linesContainer = uDiv.querySelector(`#lines-universe-${u.id}`);

            lines.forEach(l => {
                const lItem = document.createElement('div');
                lItem.className = 'p-3 mx-2 hover:bg-white/5 border border-transparent rounded-lg cursor-pointer transition-colors group relative';
                lItem.innerHTML = `
                    <h3 class="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">${l.nombre}</h3>
                    <div class="flex justify-between mt-1 text-xs text-slate-500">
                        <span class="events-count-badge">Ver eventos</span>
                    </div>
                `;
                lItem.onclick = () => loadEventsForTimeline(l.id, l.nombre);
                linesContainer.appendChild(lItem);
            });
        }
    } catch (e) {
        console.error("Error loading multiverse:", e);
        sidebar.innerHTML = '<div class="text-red-400 text-xs p-4">Error de conexión.</div>';
    }
}

async function loadEventsForTimeline(lineaId, lineaNombre) {
    const container = document.getElementById('timeline-events');
    const title = document.querySelector('header h2') || document.getElementById('timeline-title');

    if (title) title.textContent = `Cronología: ${lineaNombre}`;

    container.innerHTML = '<div class="text-center text-slate-500 py-20">Cargando hilos del destino...</div>';

    try {
        const events = await fetch(`/api/timeline/linea/${lineaId}/eventos`).then(r => r.json());
        container.innerHTML = '';

        if (events.length === 0) {
            container.innerHTML = '<div class="text-center text-slate-500 py-20">Línea temporal vacía. <br> <span class="text-xs">Añade eventos para comenzar.</span></div>';
            return;
        }

        events.forEach((evt, index) => {
            const isLeft = index % 2 === 0;
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between group w-full';

            // Animation class handled by CSS now (animate-fade-in-up)
            item.style.animationDelay = `${index * 100}ms`;
            item.classList.add('animate-fade-in-up');

            item.innerHTML = `
                <div class="w-5/12 text-right pr-8 ${!isLeft ? 'opacity-0' : ''}">
                    ${isLeft ? renderEventCard(evt) : ''}
                </div>
                
                <div class="absolute left-1/2 -translate-x-1/2 size-4 rounded-full bg-slate-950 border-2 ${isLeft ? 'border-indigo-500 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'border-slate-600'} z-10 group-hover:scale-125 transition-all cursor-pointer"></div>
                
                <div class="w-5/12 pl-8 ${isLeft ? 'opacity-0' : ''}">
                    ${!isLeft ? renderEventCard(evt) : ''}
                </div>
            `;
            container.appendChild(item);
        });

    } catch (e) {
        console.error(e);
        container.innerHTML = '<div class="text-center text-red-400 py-20">Error al leer los astros.</div>';
    }
}

function renderEventCard(evt) {
    return `
        <div class="hover:bg-white/5 p-4 rounded-xl transition-all border border-transparent hover:border-white/5 cursor-pointer">
            <h3 class="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">${evt.titulo}</h3>
            <p class="text-sm text-slate-400 mt-2 line-clamp-3">${evt.descripcion}</p>
            <div class="mt-2 text-xs text-indigo-300 font-mono bg-indigo-500/10 inline-block px-2 py-1 rounded border border-indigo-500/20">${evt.fechaInGame}</div>
        </div>
    `;
}
