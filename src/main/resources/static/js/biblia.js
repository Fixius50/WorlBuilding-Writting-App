let allData = null;
let currentFilter = 'todos';
let currentView = 'list';
let sortDirection = 'asc'; // 'asc' o 'desc'

document.addEventListener('DOMContentLoaded', async () => {
    await inicializarBiblia();
});

async function inicializarBiblia() {
    const listContainer = document.getElementById('entities-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="text-center py-20 text-slate-500 italic animate-pulse">Consultando los registros akáshicos...</div>';

    // Shortcut for modal save
    const form = document.getElementById('form-crear-entidad');
    if (form) {
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
                e.preventDefault();
                crearEntidad(new Event('submit'));
            }
        });
    }

    try {
        allData = await API.cargarTodosLosDatos();
        actualizarContadores();
        renderEntidades();
    } catch (e) {
        console.error(e);
        listContainer.innerHTML = '<div class="text-center py-20 text-red-500">Error cargando la biblia.</div>';
    }
}

function actualizarContadores() {
    if (!allData) return;

    const ind = allData.entidadIndividual.length;
    const col = allData.entidadColectiva.length;
    const zon = allData.zona.length;
    const total = ind + col + zon + allData.efectos.length;

    // Mapping for UI elements
    const elements = {
        'stat-total': total,
        'stat-personajes': ind,
        'stat-lugares': zon,
        'stat-objetos': allData.eventos.length + allData.lenguas.length // Usar stat-objetos como cajón de sastre o añadir nuevos
    };

    for (const [id, count] of Object.entries(elements)) {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    }
}

function filtrar(categoria) {
    currentFilter = categoria;
    const buttons = document.querySelectorAll('[data-cat]');
    buttons.forEach(btn => {
        if (btn.dataset.cat === categoria) {
            btn.classList.add('bg-slate-800', 'text-white', 'shadow-sm');
            btn.classList.remove('text-slate-500');
        } else {
            btn.classList.remove('bg-slate-800', 'text-white', 'shadow-sm');
            btn.classList.add('text-slate-500');
        }
    });
    renderEntidades();
}

function cambiarVista(vista) {
    currentView = vista;
    renderEntidades();

    const btnList = document.getElementById('view-list');
    const btnGrid = document.getElementById('view-grid');

    if (vista === 'grid') {
        btnGrid.classList.add('bg-indigo-500', 'text-white');
        btnGrid.classList.remove('text-slate-500');
        btnList.classList.remove('bg-indigo-500', 'text-white');
        btnList.classList.add('text-slate-500');
    } else {
        btnList.classList.add('bg-indigo-500', 'text-white');
        btnList.classList.remove('text-slate-500');
        btnGrid.classList.remove('bg-indigo-500', 'text-white');
        btnGrid.classList.add('text-slate-500');
    }
}

function toggleSort() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    const btn = document.getElementById('sort-btn');
    if (btn) {
        btn.querySelector('.material-symbols-outlined').textContent = sortDirection === 'asc' ? 'sort_by_alpha' : 'text_rotation_down';
    }
    renderEntidades();
}

function renderEntidades() {
    const listContainer = document.getElementById('entities-list');
    const container = document.getElementById('entities-container');
    const header = document.getElementById('list-header');

    if (!listContainer || !container) return;

    // Reset Classes
    if (currentView === 'grid') {
        // Container cleanup (ensure no grid on parent)
        container.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4', 'gap-4');

        // List Container becomes the grid
        listContainer.classList.remove('space-y-3');
        listContainer.classList.add('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4', 'gap-6', 'pb-20');

        if (header) header.classList.add('hidden');
    } else {
        // List Container becomes vertical list
        listContainer.classList.remove('grid', 'grid-cols-1', 'sm:grid-cols-2', 'xl:grid-cols-4', 'gap-6', 'pb-20');
        listContainer.classList.add('space-y-3');

        if (header) header.classList.remove('hidden');
    }

    listContainer.innerHTML = '';

    let items = [];
    const labels = {
        'entidadindividual': 'Personaje',
        'entidadcolectiva': 'Colectiva',
        'zona': 'Lugar',
        'efectos': 'Objeto',
        'eventos': 'Cronología',
        'lenguas': 'Lingüística'
    };

    if (currentFilter === 'todos') {
        items = [
            ...allData.entidadIndividual.map(i => ({ ...i, tipoReal: 'entidadindividual' })),
            ...allData.entidadColectiva.map(i => ({ ...i, tipoReal: 'entidadcolectiva' })),
            ...allData.zona.map(i => ({ ...i, tipoReal: 'zona' })),
            ...allData.efectos.map(i => ({ ...i, tipoReal: 'efectos' })),
            ...allData.eventos.map(i => ({ ...i, tipoReal: 'eventos', nombre: i.titulo || i.nombre })),
            ...allData.lenguas.map(i => ({ ...i, tipoReal: 'lenguas' }))
        ];
    } else {
        items = allData[currentFilter].map(i => ({ ...i, tipoReal: currentFilter }));
        if (currentFilter === 'eventos') {
            items = items.map(i => ({ ...i, nombre: i.titulo || i.nombre }));
        }
    }

    // --- Search Logic ---
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    if (searchTerm) {
        items = items.filter(i =>
            (i.nombre || '').toLowerCase().includes(searchTerm) ||
            (i.descripcion || '').toLowerCase().includes(searchTerm) ||
            (labels[i.tipoReal] || '').toLowerCase().includes(searchTerm)
        );
    }

    // Aplicar Ordenación
    items.sort((a, b) => {
        const nomA = (a.nombre || '').toLowerCase();
        const nomB = (b.nombre || '').toLowerCase();
        if (sortDirection === 'asc') {
            return nomA.localeCompare(nomB);
        } else {
            return nomB.localeCompare(nomA);
        }
    });

    if (items.length === 0) {
        listContainer.innerHTML = '<div class="col-span-full text-center py-20 text-slate-600">No hay entidades disponibles.</div>';
        return;
    }

    items.forEach((ent, index) => {
        const itemEl = document.createElement('div');

        // Actions Handler
        const showActions = (e) => {
            e.stopPropagation();
            e.preventDefault();
            mostrarContextMenu(e, ent);
        };

        if (currentView === 'list') {
            itemEl.className = 'glass-panel p-4 rounded-2xl grid grid-cols-12 gap-4 items-center hover:bg-white/5 transition-all cursor-pointer group animate-fade-in-up border-none shadow-sm';
            itemEl.innerHTML = `
                <div class="col-span-5 flex items-center gap-4">
                    <div class="size-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-all">
                        ${ent.nombre.charAt(0)}
                    </div>
                    <div>
                        <h4 class="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">${ent.nombre}</h4>
                        <p class="text-[10px] text-slate-500 line-clamp-1">${ent.descripcion || 'Sin descripción'}</p>
                    </div>
                </div>
                <div class="col-span-2 text-center">
                    <span class="px-3 py-1 rounded-lg bg-slate-900/50 text-slate-400 text-[10px] font-bold border border-white/5">${labels[ent.tipoReal]}</span>
                </div>
                <!-- ... Tags and Status ... -->
                <div class="col-span-2 flex justify-center gap-1">
                     <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">Tag</span>
                </div>
                <div class="col-span-2 text-center flex items-center justify-center gap-2">
                    <span class="size-2 rounded-full bg-emerald-500"></span>
                    <span class="text-[10px] font-bold text-slate-400">Activo</span>
                </div>

                <div class="col-span-1 text-right relative">
                    <button class="action-btn text-slate-600 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><span class="material-symbols-outlined text-sm">more_vert</span></button>
                </div>
            `;
            const btn = itemEl.querySelector('.action-btn');
            if (btn) btn.onclick = showActions;
        } else {
            // Card View - Fixed styling
            itemEl.className = 'glass-panel p-6 rounded-3xl flex flex-col gap-4 hover:bg-white/5 transition-all cursor-pointer group animate-fade-in-up border border-white/5 hover:border-indigo-500/30 shadow-lg';
            itemEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="size-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        ${ent.nombre.charAt(0)}
                    </div>
                    <div class="flex items-center gap-2">
                         <span class="text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-lg bg-slate-900 text-slate-500 border border-white/5">${labels[ent.tipoReal]}</span>
                         <button class="action-btn text-slate-600 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"><span class="material-symbols-outlined text-sm">more_vert</span></button>
                    </div>
                </div>
                <div>
                    <h3 class="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors line-clamp-1">${ent.nombre}</h3>
                    <p class="text-xs text-slate-400 line-clamp-3 mt-1 leading-relaxed">${ent.descripcion || 'Sin descripción'}</p>
                </div>
            `;
            const btn = itemEl.querySelector('.action-btn');
            if (btn) btn.onclick = showActions;
        }
        itemEl.style.animationDelay = `${index * 30}ms`;
        listContainer.appendChild(itemEl);
    });
}

// --- Context Menu Logic ---
let contextTarget = null;
const ctxMenu = document.getElementById('context-menu');

function mostrarContextMenu(e, entidad) {
    contextTarget = entidad;

    const x = e.clientX;
    const y = e.clientY;

    // Adjust if too close to right edge
    const menuWidth = 200;
    const finalX = (x + menuWidth > window.innerWidth) ? x - menuWidth : x;

    ctxMenu.style.left = `${finalX}px`;
    ctxMenu.style.top = `${y}px`;
    ctxMenu.classList.remove('hidden');

    const closeMenu = () => {
        ctxMenu.classList.add('hidden');
        document.removeEventListener('click', closeMenu);
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

document.getElementById('ctx-duplicate').onclick = async () => {
    if (!contextTarget) return;
    const tipo = contextTarget.tipoReal;

    const copia = { ...contextTarget };
    delete copia.id;
    copia.nombre = `${copia.nombre} (Copia)`;

    if (confirm(`¿Duplicar "${contextTarget.nombre}"?`)) {
        try {
            if (tipo === 'eventos') {
                await API.timeline.crearEvento({ titulo: copia.nombre, descripcion: copia.descripcion });
            } else if (tipo === 'lenguas') {
                await API.conlang.crear({ nombre: copia.nombre, descripcion: copia.descripcion });
            } else {
                await API.bd.insertar(tipo, {
                    nombre: copia.nombre,
                    detalles: copia.descripcion, // API expects 'detalles' sometimes
                    descripcion: copia.descripcion // Or 'descripcion'
                });
            }
            inicializarBiblia();
        } catch (e) {
            alert("Error duplicando: " + e);
        }
    }
};

document.getElementById('ctx-delete').onclick = async () => {
    if (!contextTarget) return;
    if (confirm(`¿Eliminar definitivamente "${contextTarget.nombre}"?`)) {
        try {
            await API.bd.eliminar(contextTarget.tipoReal, contextTarget.id);
            inicializarBiblia();
        } catch (e) {
            alert("Error eliminando: " + e);
        }
    }
};

// Modal Functions - Global Scope
function abrirModalCrear() {
    const modal = document.getElementById('modal-crear');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
}

function cerrarModalCrear() {
    const modal = document.getElementById('modal-crear');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

function seleccionarTipo(tipo, btn) {
    document.getElementById('tipo-entidad').value = tipo;
    const cards = document.querySelectorAll('.type-card');
    cards.forEach(c => {
        c.classList.remove('active', 'border-indigo-500', 'bg-indigo-500/10');
        c.classList.add('border-white/5', 'bg-slate-900/40');
        c.querySelector('span:first-child').classList.remove('text-white');
        c.querySelector('span:first-child').classList.add('text-slate-400');
        c.querySelector('span:last-child').classList.remove('text-white');
        c.querySelector('span:last-child').classList.add('text-slate-400');
    });

    if (btn) {
        btn.classList.add('active', 'border-indigo-500', 'bg-indigo-500/10');
        btn.classList.remove('border-white/5', 'bg-slate-900/40');
        btn.querySelector('span:first-child').classList.add('text-white');
        btn.querySelector('span:first-child').classList.remove('text-slate-400');
        btn.querySelector('span:last-child').classList.add('text-white');
        btn.querySelector('span:last-child').classList.remove('text-slate-400');
    }
}

async function crearEntidad(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-entidad').value;
    const tipo = document.getElementById('tipo-entidad').value;
    const descripcion = document.getElementById('desc-entidad').value;

    try {
        if (tipo === 'eventos') {
            await API.timeline.crearEvento({ titulo: nombre, descripcion });
        } else if (tipo === 'lenguas') {
            await API.conlang.crear({ nombre, descripcion });
        } else {
            await API.bd.insertar(tipo, { nombre, detalles: descripcion });
        }

        cerrarModalCrear();
        const form = document.getElementById('form-crear-entidad');
        if (form) form.reset();
        await inicializarBiblia();
    } catch (err) {
        alert("Error al guardar entidad: " + err);
    }
}
