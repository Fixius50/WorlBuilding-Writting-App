
// dashboard.js - Lógica del Dashboard

document.addEventListener('DOMContentLoaded', async () => {
    await cargarProyectos();
});

async function cargarProyectos() {
    const lista = document.getElementById('project-grid');
    if (!lista) return;

    lista.innerHTML = '<div class="text-slate-500 italic col-span-full text-center py-20">Consiguiendo fragmentos de mundos...</div>';

    try {
        const cuadernos = await API.proyectos.listar();
        lista.innerHTML = '';

        // Botón "Crear Nuevo" como tarjeta
        const creaCard = document.createElement('div');
        creaCard.className = 'group relative flex flex-col items-center justify-center aspect-[4/5] sm:aspect-[3/4] rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/50 bg-slate-900/20 hover:bg-slate-900/40 transition-all cursor-pointer overflow-hidden';
        creaCard.onclick = abrirModalProyecto;
        creaCard.innerHTML = `
            <div class="size-16 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center mb-4 transition-colors ring-1 ring-white/5 group-hover:ring-indigo-500/30 shadow-lg">
                <span class="material-symbols-outlined text-slate-400 group-hover:text-indigo-400 text-[32px] transition-colors">add</span>
            </div>
            <h3 class="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">Crear Nuevo Mundo</h3>
        `;
        lista.appendChild(creaCard);

        if (!cuadernos || cuadernos.length === 0) return;

        cuadernos.forEach((c, index) => {
            const card = document.createElement('article');
            // Added animate-fade-in-up and staggered delay
            card.className = 'group relative flex flex-col justify-end aspect-[4/5] sm:aspect-[3/4] rounded-2xl glass-panel p-5 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer animate-fade-in-up';
            card.style.animationDelay = `${(index + 1) * 100}ms`; // Stagger effect
            card.onclick = () => abrirProyecto(c.nombreProyecto);

            // Imagen aleatoria o placeholder
            const bgUrl = c.imagenUrl || `https://source.unsplash.com/random/400x500/?fantasy,landscape&sig=${c.id}`;

            card.innerHTML = `
                <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-40" style="background-image: url('${bgUrl}'); background-color: #0f172a;"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
                
                <div class="relative z-10 flex flex-col gap-2">
                    <div class="flex justify-between items-start mb-1">
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 backdrop-blur-sm">${c.tipo || 'Proyecto'}</span>
                    </div>
                    <h3 class="text-xl font-bold text-white leading-tight group-hover:text-indigo-300 transition-colors">${c.titulo || c.nombreProyecto}</h3>
                    <p class="text-sm text-slate-400 line-clamp-2">${c.descripcion || 'Sin descripción'}</p>
                    <div class="mt-3 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-white/5">
                         <div class="flex items-center gap-1 text-slate-400">
                             <span class="material-symbols-outlined text-[14px]">calendar_today</span>
                             <span>${new Date().toLocaleDateString()}</span>
                         </div>
                         <span class="text-indigo-400 font-medium">${c.genero || ''}</span>
                    </div>
                </div>
            `;
            lista.appendChild(card);
        });

    } catch (e) {
        console.error("Dashboard Load Error:", e);
        if (e.status === 401) {
            window.location.href = 'login.html';
        } else {
            lista.innerHTML = `<div class="text-red-400 col-span-full text-center py-10">
                <span class="material-symbols-outlined text-4xl mb-2">error</span>
                <p>Error al cargar mundos: ${e.message}</p>
            </div>`;
        }
    }
}

// Modal
function abrirModalProyecto() {
    document.getElementById('modal-proyecto').classList.remove('hidden');
    document.getElementById('modal-proyecto').classList.add('flex');
}

function cerrarModalProyecto() {
    document.getElementById('modal-proyecto').classList.add('hidden');
    document.getElementById('modal-proyecto').classList.remove('flex');
}

async function crearProyecto(e) {
    e.preventDefault();
    const nombre = document.getElementById('nombre-proyecto').value;
    const desc = document.getElementById('desc-proyecto').value;
    const tipo = document.getElementById('tipo-proyecto').value;
    const genero = document.getElementById('genero-proyecto').value;
    const imagen = document.getElementById('imagen-proyecto').value;

    try {
        await API.proyectos.crear(nombre, tipo, desc, genero, imagen);
        cerrarModalProyecto();
        cargarProyectos();
    } catch (err) {
        alert("Error al crear: " + err);
    }
}

async function abrirProyecto(nombre) {
    try {
        const res = await API.proyectos.abrir(nombre);
        if (res.success) {
            window.location.href = 'libreria.html';
        }
    } catch (err) {
        alert("Error al abrir proyecto: " + err);
    }
}

function manejarImagenLocal(input) {
    const file = input.files[0];
    if (file) {
        // En una app local real, idealmente guardaríamos la ruta.
        // Aquí simulamos guardando el nombre o convirtiendo a base64 ligero.
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('imagen-proyecto').value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}
