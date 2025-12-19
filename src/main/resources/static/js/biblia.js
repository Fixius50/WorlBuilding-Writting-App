let allData = null;
let currentFilter = 'todos';
let currentView = 'list';

document.addEventListener('DOMContentLoaded', async () => {
    await inicializarBiblia();
});

async function inicializarBiblia() {
    const listContainer = document.getElementById('entities-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div class="text-center py-20 text-slate-500 italic animate-pulse">Consultando los registros akáshicos...</div>';

    // Shortcut for modal save
    document.getElementById('form-crear-entidad').addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            crearEntidad(new Event('submit'));
        }
    });

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
        'stat-objetos': allData.efectos.length
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
    const container = document.getElementById('entities-container');
    const header = document.getElementById('list-header');
    const btnList = document.getElementById('view-list');
    const btnGrid = document.getElementById('view-grid');

    if (vista === 'grid') {
        container.classList.remove('view-list', 'space-y-3');
        container.classList.add('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-6');
        header.classList.add('hidden');
        btnGrid.classList.add('bg-indigo-500', 'text-white');
        btnGrid.classList.remove('text-slate-500');
        btnList.classList.remove('bg-indigo-500', 'text-white');
        btnList.classList.add('text-slate-500');
    } else {
        container.classList.add('view-list', 'space-y-3');
        container.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3', 'xl:grid-cols-4', 'gap-6');
        header.classList.remove('hidden');
        btnList.classList.add('bg-indigo-500', 'text-white');
        btnList.classList.remove('text-slate-500');
        btnGrid.classList.remove('bg-indigo-500', 'text-white');
        btnGrid.classList.add('text-slate-500');
    }
    renderEntidades();
}

function renderEntidades() {
    const listContainer = document.getElementById('entities-list');
    listContainer.innerHTML = '';

    let items = [];
    const labels = {
        'entidadindividual': 'Personaje',
        'entidadcolectiva': 'Colectiva',
        'zona': 'Lugar',
        'efectos': 'Objeto'
    };

    if (currentFilter === 'todos') {
        items = [
            ...allData.entidadIndividual.map(i => ({ ...i, tipoReal: 'entidadindividual' })),
            ...allData.entidadColectiva.map(i => ({ ...i, tipoReal: 'entidadcolectiva' })),
            ...allData.zona.map(i => ({ ...i, tipoReal: 'zona' })),
            ...allData.efectos.map(i => ({ ...i, tipoReal: 'efectos' }))
        ];
    } else {
        items = allData[currentFilter].map(i => ({ ...i, tipoReal: currentFilter }));
    }

    if (items.length === 0) {
        listContainer.innerHTML = '<div class="text-center py-20 text-slate-600">No hay entidades disponibles.</div>';
        return;
    }

    items.forEach((ent, index) => {
        const itemEl = document.createElement('div');
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
                <div class="col-span-2 flex justify-center gap-1">
                    <span class="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[9px] font-bold">Tag</span>
                </div>
                <div class="col-span-2 text-center flex items-center justify-center gap-2">
                    <span class="size-2 rounded-full bg-emerald-500"></span>
                    <span class="text-[10px] font-bold text-slate-400">Activo</span>
                </div>
                <div class="col-span-1 text-right">
                    <button class="text-slate-600 hover:text-white"><span class="material-symbols-outlined text-sm">more_vert</span></button>
                </div>
            `;
        } else {
            itemEl.className = 'glass-panel p-6 rounded-3xl flex flex-col gap-4 hover:bg-white/5 transition-all cursor-pointer group animate-fade-in-up border border-white/5 hover:border-indigo-500/30 shadow-lg';
            itemEl.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="size-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xl border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                        ${ent.nombre.charAt(0)}
                    </div>
                    <span class="text-[9px] uppercase font-black tracking-widest px-2 py-1 rounded-lg bg-slate-900 text-slate-500 border border-white/5">${labels[ent.tipoReal]}</span>
                </div>
                <div>
                    <h3 class="text-white font-bold text-lg group-hover:text-indigo-300 transition-colors">${ent.nombre}</h3>
                    <p class="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">${ent.descripcion || 'Sin descripción'}</p>
                </div>
            `;
        }
        itemEl.style.animationDelay = `${index * 30}ms`;
        listContainer.appendChild(itemEl);
    });
}

// Modal Functions
function abrirModalCrear() {
    const modal = document.getElementById('modal-crear');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalCrear() {
    const modal = document.getElementById('modal-crear');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
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

    btn.classList.add('active', 'border-indigo-500', 'bg-indigo-500/10');
    btn.classList.remove('border-white/5', 'bg-slate-900/40');
    btn.querySelector('span:first-child').classList.add('text-white');
    btn.querySelector('span:first-child').classList.remove('text-slate-400');
    btn.querySelector('span:last-child').classList.add('text-white');
    btn.querySelector('span:last-child').classList.remove('text-slate-400');
}

async function crearEntidad(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-entidad').value;
    const tipo = document.getElementById('tipo-entidad').value;
    const descripcion = document.getElementById('desc-entidad').value;

    try {
        await API.bd.insertar(tipo, { nombre, descripcion });
        cerrarModalCrear();
        document.getElementById('form-crear-entidad').reset();
        await inicializarBiblia();
    } catch (err) {
        alert("Error al guardar entidad: " + err);
    }
}
