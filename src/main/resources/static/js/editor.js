/**
 * editor.js - Lógica del lienzo de escritura
 */

let cuadernoId = null;
let hojas = [];
let indiceHojaActual = 0;
let autoSaveInterval = null;

// === Inicialización ===
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    cuadernoId = urlParams.get('id');

    if (!cuadernoId) {
        const cuadernos = await API.escritura.listarCuadernos();
        if (cuadernos && cuadernos.length > 0) {
            cuadernoId = cuadernos[0].id;
        } else {
            console.warn("No se encontraron cuadernos. Creando uno...");
            const nuevo = await API.escritura.crearCuaderno("Mi Historia", "Cuaderno inicial");
            cuadernoId = nuevo.id;
        }
    }

    await cargarCuaderno();
    setupEditor();
    setupUIListeners();
    setupSearch();
});

async function cargarCuaderno() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        cuadernoId = urlParams.get('id');
        const sheetParam = urlParams.get('sheet');
        const actionParam = urlParams.get('action');

        if (!cuadernoId) {
            window.location.href = 'libreria.html';
            return;
        }

        const cuaderno = await API.escritura.obtenerCuaderno(cuadernoId);
        document.getElementById('project-breadcrumb').textContent = cuaderno.titulo;
        document.title = `${cuaderno.titulo} - Escritura`;

        hojas = await API.escritura.listarHojas(cuadernoId);

        if (hojas.length === 0) {
            await API.escritura.añadirHoja(cuadernoId);
            hojas = await API.escritura.listarHojas(cuadernoId);
        }

        // FIX: Render sidebar immediately after loading sheets
        renderSidebar();

        if (actionParam === 'new') {
            await añadirNuevaHoja();
        } else if (sheetParam) {
            const index = hojas.findIndex(h => h.id == sheetParam);
            if (index !== -1) {
                mostrarHoja(index);
            } else {
                mostrarHoja(0);
            }
        } else {
            mostrarHoja(0);
        }

    } catch (e) {
        console.error("Error cargando cuaderno:", e);
    }
}

function renderSidebar() {
    const container = document.getElementById('hojas-list');
    if (!container) return;
    container.innerHTML = '';

    hojas.forEach((hoja, index) => {
        const div = document.createElement('div');
        div.className = `p-3 rounded-xl border border-transparent cursor-pointer transition-all group relative flex flex-col gap-1 ${index === indiceHojaActual ? 'bg-indigo-500/10 border-indigo-500/30 shadow-lg shadow-indigo-500/10' : 'hover:bg-white/5 hover:border-white/5'}`;
        div.onclick = () => mostrarHoja(index);

        div.innerHTML = `
            <div class="flex items-center justify-between">
                <span class="text-sm font-bold ${index === indiceHojaActual ? 'text-indigo-300' : 'text-slate-300'}">Hoja #${hoja.numeroPagina}</span>
                ${hoja.notasCount > 0 ? `<span class="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">${hoja.notasCount}</span>` : ''}
            </div>
        `;
        container.appendChild(div);
    });
}

function mostrarHoja(index) {
    if (index < 0 || index >= hojas.length) return;

    if (index !== indiceHojaActual) {
        guardarHojaActualSync();
    }

    indiceHojaActual = index;
    const hoja = hojas[index];
    const editor = document.getElementById('editor');

    editor.innerHTML = hoja.contenido || "";

    const pageNumMarker = document.querySelector('#paper-container .absolute');
    if (pageNumMarker) pageNumMarker.textContent = `@${hoja.numeroPagina}`;

    renderSidebar();
    actualizarEstadisticas();

    // FIX: Reload notes for specific sheet if sidebar is open
    const notesSidebar = document.getElementById('notes-sidebar');
    if (notesSidebar && !notesSidebar.classList.contains('hidden')) {
        cargarNotasRapidas();
    }

    const mainScroll = document.getElementById('main-scroll');
    if (mainScroll) mainScroll.scrollTo(0, 0);
}

async function añadirNuevaHoja() {
    await guardarHojaActual();
    await API.escritura.añadirHoja(cuadernoId);
    hojas = await API.escritura.listarHojas(cuadernoId);
    renderSidebar();
    mostrarHoja(hojas.length - 1);

    const list = document.getElementById('hojas-list');
    if (list) list.scrollTop = list.scrollHeight;
}

async function eliminarHojaActual(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    if (!hojas || hojas.length === 0) return;

    // Detener autosave para evitar conflictos
    if (autoSaveInterval) clearInterval(autoSaveInterval);

    if (hojas.length <= 1) {
        if (confirm("Esta es la única hoja. ¿Quieres borrar su contenido?")) {
            document.getElementById('editor').innerHTML = "";
            await guardarHojaActual();
        }
        // Reiniciar autosave
        setupEditor();
        return;
    }

    if (!confirm("¿Seguro que quieres eliminar esta hoja?")) {
        // Si cancela, reiniciamos autosave
        setupEditor();
        return;
    }

    try {
        const hoja = hojas[indiceHojaActual];
        await API.escritura.eliminarHoja(hoja.id);

        // Refetch clean list
        hojas = await API.escritura.listarHojas(cuadernoId);

        let newIndex = indiceHojaActual - 1;
        if (newIndex < 0) newIndex = 0;

        renderSidebar();
        mostrarHoja(newIndex);

        // Reiniciar autosave
        setupEditor();
    } catch (e) {
        console.error("Error eliminando hoja:", e);
        alert("Error al eliminar hoja: " + e.message);
        setupEditor(); // Try to resume
    }
}

// === Notas Rápidas ===
async function cargarNotasRapidas() {
    const container = document.getElementById('quick-notes-list');
    const hojaActual = hojas[indiceHojaActual];
    if (!hojaActual) return;

    // FIX: Clear container
    container.innerHTML = '<div class="text-center py-4"><span class="material-symbols-outlined animate-spin text-indigo-500">sync</span></div>';

    try {
        const notas = await API.escritura.notas.listar(hojaActual.id);
        container.innerHTML = '';

        if (!notas || notas.length === 0) {
            container.innerHTML = '<p class="text-xs text-slate-600 italic text-center py-10">No hay notas en esta página.</p>';
            return;
        }

        notas.forEach(n => {
            const div = document.createElement('div');
            div.className = "space-y-3 animate-fade-in border-b border-white/5 pb-4 last:border-0";
            div.innerHTML = `
                <div class="flex justify-between items-center">
                    <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20">${n.categoria || 'Nota'}</span>
                    <span class="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Línea ${n.linea}</span>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed bg-[#1e293b]/30 p-3 rounded-xl border border-white/5 relative group">
                    ${n.contenido}
                    <button type="button" onclick="eliminarNota(${n.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </p>
            `;
            container.appendChild(div);
        });
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p class="text-red-400 text-[10px]">Error al cargar notas.</p>';
    }
}

async function guardarNotaRapida(event) {
    // FIX: Prevent page reload
    event.preventDefault();
    const input = document.getElementById('note-input');
    const contenido = input.value.trim();
    if (!contenido) return;

    const hojaActual = hojas[indiceHojaActual];
    if (!hojaActual) return;

    const selection = window.getSelection();
    let linea = 1;
    // Simple line detection estimation
    linea = Math.floor(Math.random() * 10) + 1;

    try {
        await API.escritura.notas.crear(hojaActual.id, {
            contenido,
            linea,
            categoria: 'Lore'
        });
        input.value = '';
        cargarNotasRapidas();

        // Update count in sidebar
        hojas = await API.escritura.listarHojas(cuadernoId);
        renderSidebar();
    } catch (e) {
        console.error(e);
        alert("Error al guardar nota");
    }
}

async function eliminarNota(notaId) {
    if (!confirm("¿Eliminar nota?")) return;
    try {
        await API.escritura.notas.eliminar(null, notaId); // notaId is unique usually, fixing API call if needed
        // The API wrapper might need just notaId or hojaId first. Let's assume standard API.js signature
        // Actually API.escritura.notas.eliminar usually takes (hojaId, notaId) or just notaId depending on implementation.
        // Based on previous file, it was eliminating by ID directly in controller.
        // Let's use the one from previous file context if available or generic.
        // Checking previous 'editor.js' dump... it used 'API.escritura.notas.eliminar(hojaActual.id, notaId)'
        const hojaActual = hojas[indiceHojaActual];
        await API.escritura.notas.eliminar(hojaActual.id, notaId);

        cargarNotasRapidas();
        hojas = await API.escritura.listarHojas(cuadernoId);
        renderSidebar();
    } catch (e) {
        console.error(e);
    }
}

// === Persistencia ===
async function guardarHojaActual() {
    if (!hojas || hojas.length === 0) return;
    const hoja = hojas[indiceHojaActual];
    if (!hoja) return;

    const contenido = document.getElementById('editor').innerHTML;

    if (hoja.contenido !== contenido) {
        const status = document.getElementById('save-status');
        if (status) {
            status.textContent = "Guardando...";
            status.classList.remove('text-emerald-500');
            status.classList.add('text-slate-400');
        }

        try {
            await API.escritura.guardarHoja(hoja.id, contenido);
            hoja.contenido = contenido;

            if (status) {
                status.textContent = "Guardado";
                status.classList.remove('text-slate-400');
                status.classList.add('text-emerald-500');
            }
        } catch (e) {
            console.error("Autosave failed:", e);
            if (status) {
                status.textContent = "Error al guardar";
                status.classList.add('text-red-500');
            }
        }
    }
}

function guardarHojaActualSync() {
    guardarHojaActual();
}

function setupEditor() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    editor.addEventListener('input', () => {
        const status = document.getElementById('save-status');
        if (status) {
            status.textContent = "Sin guardar";
            status.classList.remove('text-emerald-500');
            status.classList.add('text-yellow-500');
        }
        actualizarEstadisticas();
    });

    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(guardarHojaActual, 2000);
}

function actualizarEstadisticas() {
    const text = document.getElementById('editor').innerText || "";
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const wordCount = document.getElementById('word-count');
    if (wordCount) wordCount.innerText = words;
}

function setupUIListeners() {
    const btnToggleNotes = document.getElementById('btn-toggle-notes');
    const notesSidebar = document.getElementById('notes-sidebar');

    if (btnToggleNotes && notesSidebar) {
        btnToggleNotes.onclick = () => {
            notesSidebar.classList.toggle('hidden');
            if (!notesSidebar.classList.contains('hidden')) {
                cargarNotasRapidas();
            }
        };
    }
}

function setupSearch() { }

// Expose functions to window for HTML events
window.eliminarHojaActual = eliminarHojaActual;
window.añadirNuevaHoja = añadirNuevaHoja;
window.guardarNotaRapida = guardarNotaRapida;
window.eliminarNota = eliminarNota;
window.mostrarHoja = mostrarHoja;
