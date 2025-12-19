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
    const list = document.getElementById('sheets-container'); // Reutilizamos el contenedor principal
    list.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"; // Grid para cuadernos
    list.innerHTML = '<p class="text-slate-600 text-xs text-center col-span-full py-10">Cargando cuadernos...</p>';

    // Reset Breadcrumbs & Botones
    document.getElementById('breadcrumb-cuaderno').textContent = "";
    document.getElementById('breadcrumb-mundo').onclick = null;
    document.getElementById('breadcrumb-mundo').className = "text-white font-bold cursor-default";
    document.getElementById('cuaderno-titulo').textContent = "Librería";
    document.getElementById('cuaderno-desc').textContent = "Gestiona tus cuadernos de notas.";

    document.getElementById('btn-nuevo-cuaderno').classList.remove('hidden');
    document.getElementById('btn-nueva-hoja').classList.add('hidden');

    try {
        const cuadernos = await API.escritura.listarCuadernos();
        list.innerHTML = '';

        if (!cuadernos || cuadernos.length === 0) {
            list.innerHTML = `
                <div class="col-span-full flex flex-col items-center justify-center py-20 opacity-50">
                    <span class="material-symbols-outlined text-4xl mb-2 text-slate-500">folder_open</span>
                    <p class="text-sm text-slate-400">No hay cuadernos creados.</p>
                </div>
            `;
            return;
        }

        cuadernos.forEach(c => {
            const card = document.createElement('div');
            card.className = "glass-panel p-6 rounded-2xl group cursor-pointer hover:border-indigo-500/50 hover:bg-white/5 transition-all flex flex-col gap-4 relative overflow-hidden";
            card.onclick = () => seleccionarCuaderno(c);

            card.innerHTML = `
                <div class="absolute -right-4 -top-4 size-20 bg-indigo-500/10 rounded-full blur-xl group-hover:bg-indigo-500/20 transition-all"></div>
                <div class="flex items-start justify-between relative z-10">
                    <div class="size-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                        <span class="material-symbols-outlined text-2xl">book_2</span>
                    </div>
                </div>
                
                <div class="relative z-10">
                    <h3 class="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">${c.titulo}</h3>
                    <p class="text-xs text-slate-500 line-clamp-2">${c.descripcion || 'Sin descripción'}</p>
                </div>
                
                <div class="mt-auto pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 uppercase font-bold tracking-wider relative z-10">
                    <span>${new Date().toLocaleDateString()}</span> <!-- Fecha Mock -->
                    <span class="group-hover:translate-x-1 transition-transform">Entrar &rarr;</span>
                </div>
            `;
            list.appendChild(card);
        });

        activeCuaderno = null; // Reset
    } catch (e) {
        console.error(e);
        list.innerHTML = '<p class="text-red-400 text-xs text-center col-span-full">Error cargando cuadernos.</p>';
    }
}

async function seleccionarCuaderno(c) {
    activeCuaderno = c;

    // Update Header
    document.getElementById('breadcrumb-mundo').onclick = () => cargarCuadernos();
    document.getElementById('breadcrumb-mundo').className = "text-slate-400 hover:text-white cursor-pointer transition-colors";

    document.getElementById('breadcrumb-cuaderno').innerHTML = `<span class="mx-2 text-slate-600">/</span> ${c.titulo}`;
    document.getElementById('cuaderno-titulo').textContent = c.titulo;
    document.getElementById('cuaderno-desc').textContent = c.descripcion || '';

    // Buttons swap
    document.getElementById('btn-nuevo-cuaderno').classList.add('hidden');
    document.getElementById('btn-nueva-hoja').classList.remove('hidden');

    await cargarHojas(c.id);
}

async function cargarHojas(cuadernoId) {
    const list = document.getElementById('sheets-container');
    list.className = "flex flex-col gap-3"; // Layout lista para hojas
    list.innerHTML = '<div class="py-10 text-center text-slate-600 italic">Cargando paginas...</div>';

    try {
        const hojas = await API.escritura.listarHojas(cuadernoId);
        list.innerHTML = '';

        if (!hojas || hojas.length === 0) {
            list.innerHTML = `
                <div class="py-20 text-center flex flex-col items-center opacity-60">
                    <div class="size-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-600">
                        <span class="material-symbols-outlined text-2xl">post_add</span>
                    </div>
                    <p class="text-slate-500 italic">Este cuaderno está vacío.</p>
                    <button onclick="nuevaHoja()" class="text-indigo-400 text-sm font-bold mt-2 hover:underline">Crear primera hoja</button>
                </div>`;
            return;
        }

        hojas.forEach((h, idx) => {
            const card = document.createElement('div');
            card.className = 'glass-panel p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-all cursor-pointer group border border-white/5 hover:border-indigo-500/20 shadow-lg animate-fade-in-up';
            // Animation staggered delay could be added here
            card.style.animationDelay = `${idx * 0.05}s`;

            card.onclick = () => window.location.href = `escritura.html?id=${h.id}`;

            const fecha = h.fechaModificacion ? new Date(h.fechaModificacion).toLocaleDateString() : 'Recientemente';

            card.innerHTML = `
                <div class="size-10 rounded-lg bg-slate-900 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all border border-white/5">
                    <span class="material-symbols-outlined">description</span>
                </div>
                <div class="flex-1 min-w-0">
                    <h3 class="text-white font-bold truncate group-hover:text-indigo-300 transition-colors">${h.titulo || `Hoja #${h.numeroPagina}`}</h3>
                    <p class="text-xs text-slate-500 truncate">${h.contenido ? h.contenido.substring(0, 80) + '...' : 'Sin contenido aún...'}</p>
                </div>
                <div class="text-right shrink-0 hidden md:block">
                    <span class="text-[10px] uppercase font-bold text-slate-600 block mb-1">Status: Borrador</span>
                    <span class="text-[10px] text-slate-500">${fecha}</span>
                </div>
                <button class="size-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-600 hover:text-white transition-all ml-2" onclick="alert('Opciones hoja')"> <!-- TODO: Dropdown real -->
                    <span class="material-symbols-outlined text-[18px]">more_vert</span>
                </button>
            `;
            list.appendChild(card);
        });
    } catch (e) {
        console.error(e);
        list.innerHTML = '<div class="text-red-400 p-4">Error al cargar hojas.</div>';
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
