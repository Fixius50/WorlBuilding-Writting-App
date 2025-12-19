document.addEventListener('DOMContentLoaded', async () => {
    // Auth Check (auth_guard runs first)
    await loadEntidades();
});

async function loadEntidades() {
    const container = document.getElementById('entities-container');
    if (!container) return;

    container.innerHTML = '<div class="col-span-full text-center py-20 text-slate-500">Consultando los registros akáshicos...</div>';

    // Mock Data for now (until EntityController is robust or if we want to seed more)
    // In a real app, Fetch from /api/entidades
    const entidades = [
        { id: 1, nombre: 'Rey Alaric', tipo: 'Personaje', desc: 'El primer monarca de la dinastía de hierro.' },
        { id: 2, nombre: 'Espada de las Sombras', tipo: 'Objeto', desc: 'Una reliquia forjada en el vacío.' },
        { id: 3, nombre: 'Bosque de los Susurros', tipo: 'Lugar', desc: 'Donde los árboles guardan secretos antiguos.' },
        { id: 4, nombre: 'La Orden del Ojo', tipo: 'Grupo', desc: 'Magos que observan el multiverso.' },
    ];

    setTimeout(() => { // Simulate network delay for effect
        container.innerHTML = '';
        entidades.forEach((ent, index) => {
            const card = document.createElement('div');
            // glass-panel already defined. animate-fade-in-up added.
            card.className = 'glass-panel p-5 rounded-xl flex flex-col gap-2 hover:bg-white/5 transition-all cursor-pointer group animate-fade-in-up';
            card.style.animationDelay = `${index * 100}ms`;

            card.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="size-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-lg">
                        ${ent.nombre.charAt(0)}
                    </div>
                    <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-slate-800 text-slate-400 border border-white/5">${ent.tipo}</span>
                </div>
                <h3 class="text-white font-bold text-lg group-hover:text-indigo-400 transition-colors mt-2">${ent.nombre}</h3>
                <p class="text-sm text-slate-400 line-clamp-2">${ent.desc}</p>
            `;
            container.appendChild(card);
        });
    }, 500);
}

function crearEntidad(e) {
    e.preventDefault();
    alert("Funcionalidad de backend pendiente de migración a SQLite.");
    document.getElementById('modal-crear').classList.add('hidden');
}
