// libreria.js - Lógica para gestionar cuadernos y hojas

let activeCuaderno = null;

document.addEventListener('DOMContentLoaded', async () => {
    await inicializarLibreria();
});

async function inicializarLibreria() {
    console.log("Iniciando librería...");
    try {
        const proyecto = await API.proyectos.activo();
        console.log("Proyecto activo detectado:", proyecto);

        if (proyecto.error || !proyecto.nombreProyecto) {
            mostrarEstadoSinProyecto();
            return;
        }

        document.getElementById('breadcrumb-mundo').textContent = proyecto.nombreProyecto;
        document.getElementById('cuaderno-titulo').textContent = `Librería: ${proyecto.nombreProyecto}`;

        await cargarCuadernos();
    } catch (e) {
        console.error(e);
    }
}

async function cargarCuadernos() {
    const list = document.getElementById('notebook-list');
    list.innerHTML = '<p class="text-slate-600 text-xs text-center">Cargando...</p>';

    try {
        const cuadernos = await API.escritura.listarCuadernos();
        list.innerHTML = '';

        if (!cuadernos || cuadernos.length === 0) {
            list.innerHTML = '<p class="text-slate-600 text-xs text-center py-4">No hay cuadernos aún.</p>';
            return;
        }

        cuadernos.forEach(c => {
            const btn = document.createElement('button');
            btn.className = `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${activeCuaderno?.id === c.id ? 'bg-indigo-500/10 text-white border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`;
            btn.onclick = () => seleccionarCuaderno(c);
            btn.innerHTML = `
                <span class="material-symbols-outlined text-[20px] ${activeCuaderno?.id === c.id ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}">book</span>
                <span class="text-sm font-medium truncate">${c.titulo}</span>
            `;
            list.appendChild(btn);
        });

        if (!activeCuaderno && cuadernos.length > 0) {
            seleccionarCuaderno(cuadernos[0]);
        }
    } catch (e) {
        console.error(e);
    }
}

async function seleccionarCuaderno(c) {
    activeCuaderno = c;
    document.getElementById('breadcrumb-cuaderno').textContent = c.titulo;
    document.getElementById('cuaderno-titulo').textContent = c.titulo;
    document.getElementById('cuaderno-desc').textContent = c.descripcion || 'Sin descripción.';

    // Refresh notebook list to update active state
    await cargarCuadernos();
    await cargarHojas(c.id);
}

async function cargarHojas(cuadernoId) {
    const container = document.getElementById('sheets-container');
    container.innerHTML = '<div class="py-10 text-center text-slate-600 italic">Buscando documentos...</div>';

    try {
        const hojas = await API.escritura.listarHojas(cuadernoId);
        container.innerHTML = '';

        if (!hojas || hojas.length === 0) {
            container.innerHTML = '<div class="py-10 text-center text-slate-600">Este cuaderno está vacío. Crea tu primera hoja.</div>';
            return;
        }

        hojas.forEach((h, idx) => {
            const card = document.createElement('div');
            card.className = 'glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-indigo-500/20 shadow-lg';
            card.onclick = () => window.location.href = `escritura.html?id=${h.id}`;

            const fecha = h.fechaModificacion ? new Date(h.fechaModificacion).toLocaleDateString() : 'Recientemente';

            card.innerHTML = `
                <div class="size-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all border border-white/5">
                    <span class="material-symbols-outlined">description</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-white font-bold truncate group-hover:text-indigo-300 transition-colors">Hoja #${h.numeroPagina}</h3>
                    <p class="text-xs text-slate-500 truncate">${h.contenido ? h.contenido.substring(0, 100) : 'Sin contenido aún...'}</p>
                </div>
                <div class="text-right shrink-0">
                    <span class="text-[10px] uppercase font-bold text-slate-600 block mb-1">Status: Borrador</span>
                    <span class="text-[10px] text-slate-500">${fecha}</span>
                </div>
                <button class="size-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-white transition-all">
                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error(e);
    }
}

async function nuevaHoja() {
    if (!activeCuaderno) return;
    try {
        const res = await API.escritura.añadirHoja(activeCuaderno.id);
        if (res.id) {
            window.location.href = `escritura.html?id=${res.id}`;
        }
    } catch (e) {
        alert("Error al crear hoja: " + e);
    }
}

function abrirModalCuaderno() {
    document.getElementById('modal-cuaderno').classList.remove('hidden');
    document.getElementById('modal-cuaderno').classList.add('flex');
}

function cerrarModalCuaderno() {
    document.getElementById('modal-cuaderno').classList.add('hidden');
    document.getElementById('modal-cuaderno').classList.remove('flex');
}

async function crearNuevoCuaderno(e) {
    e.preventDefault();
    const titulo = document.getElementById('nuevo-cuaderno-titulo').value;
    const desc = document.getElementById('nuevo-cuaderno-desc').value;

    try {
        await API.escritura.crearCuaderno(titulo, desc);
        cerrarModalCuaderno();
        await cargarCuadernos();
    } catch (err) {
        alert("Error: " + err);
    }
}
function mostrarEstadoSinProyecto() {
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = `
            <div class="flex-1 flex flex-col items-center justify-center p-20 text-center animate-fade-in-up">
                <div class="size-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6 border border-indigo-500/20">
                    <span class="material-symbols-outlined text-4xl text-indigo-400">explore_off</span>
                </div>
                <h2 class="text-3xl font-black text-white mb-4">No hay un Mundo Activo</h2>
                <p class="text-slate-400 max-w-md mx-auto mb-8">
                    La Librería necesita saber en qué universo estás trabajando para mostrar tus cuadernos y relatos.
                </p>
                <a href="dashboard.html" class="glass-button px-8 py-3 flex items-center gap-2">
                    <span class="material-symbols-outlined">dashboard</span>
                    Ir al Dashboard de Mundos
                </a>
            </div>
        `;
    }
}
