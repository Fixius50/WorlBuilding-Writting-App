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
        // Si no hay ID, intentar cargar el primero o volver atrás
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
});

async function cargarCuaderno() {
    hojas = await API.escritura.listarHojas(cuadernoId);
    if (hojas.length > 0) {
        mostrarHoja(0);
        popularSelectorPaginas();
    }
}

function popularSelectorPaginas() {
    const dropdown = document.getElementById('sheet-selector-dropdown');
    if (!dropdown) return;

    dropdown.innerHTML = hojas.map((h, i) => `
        <div class="sheet-item flex justify-between items-center group" onclick="mostrarHoja(${i}); toggleSheetSelector()">
            <span class="${i === indiceHojaActual ? 'text-indigo-400 font-bold' : 'text-slate-300'}">Hoja #${h.numeroPagina}</span>
            <span class="opacity-0 group-hover:opacity-100 uppercase font-black text-[0.6em]">Abrir</span>
        </div>
    `).join('');
}

function toggleSheetSelector() {
    const dropdown = document.getElementById('sheet-selector-dropdown');
    dropdown.classList.toggle('hidden');
    dropdown.classList.toggle('flex');
}

function mostrarHoja(index) {
    if (index < 0 || index >= hojas.length) return;

    indiceHojaActual = index;
    const hoja = hojas[index];
    const editor = document.getElementById('editor');

    // Guardar contenido anterior antes de cambiar? (Opcional si hay autosave)
    editor.innerHTML = hoja.contenido || "";

    const pageNumMarker = document.querySelector('#paper-container .absolute');
    if (pageNumMarker) pageNumMarker.textContent = `@${hoja.numeroPagina}`;

    actualizarEstadisticas();
    // Scroll al inicio
    window.scrollTo(0, 0);
}

// === Navegación ===
async function irPaginaAnterior() {
    if (indiceHojaActual > 0) {
        await guardarHojaActual();
        mostrarHoja(indiceHojaActual - 1);
    }
}

async function irPaginaSiguiente() {
    if (indiceHojaActual < hojas.length - 1) {
        await guardarHojaActual();
        mostrarHoja(indiceHojaActual + 1);
    } else {
        // Si es la última, preguntar si añadir nueva?
        if (confirm("¿Quieres añadir una hoja nueva al final?")) {
            await añadirNuevaHoja();
        }
    }
}

async function añadirNuevaHoja() {
    await guardarHojaActual();
    const nueva = await API.escritura.añadirHoja(cuadernoId);
    hojas.push(nueva);
    mostrarHoja(hojas.length - 1);
}

// === Persistencia ===
async function guardarHojaActual() {
    const hoja = hojas[indiceHojaActual];
    const contenido = document.getElementById('editor').innerHTML;

    if (hoja.contenido !== contenido) {
        document.getElementById('save-status').textContent = "Guardando...";
        document.getElementById('save-status').classList.remove('text-emerald-500');
        document.getElementById('save-status').classList.add('text-slate-400');

        await API.escritura.guardarHoja(hoja.id, contenido);
        hoja.contenido = contenido;

        document.getElementById('save-status').textContent = "Guardado";
        document.getElementById('save-status').classList.remove('text-slate-400');
        document.getElementById('save-status').classList.add('text-emerald-500');
    }
}

function setupEditor() {
    const editor = document.getElementById('editor');

    // Autoguardado cada 5 segundos si hay cambios
    clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(guardarHojaActual, 5000);

    // Manejo de atajos de teclado (Ctrl+S)
    editor.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            guardarHojaActual();
        }
    });

    // Smart References (@)
    editor.addEventListener('keyup', (e) => {
        if (e.key === '@') {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                mostrarMentionDropdown(selection.getRangeAt(0));
            }
        }
    });

    editor.addEventListener('input', () => {
        actualizarEstadisticas();
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mention-dropdown') && !e.target.closest('#btn-mention-trigger')) {
            cerrarMentionDropdown();
        }
        if (!e.target.closest('#sheet-selector-dropdown') && !e.target.closest('[onclick="toggleSheetSelector()"]')) {
            const dropdown = document.getElementById('sheet-selector-dropdown');
            if (dropdown) {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('flex');
            }
        }
    });

    // Barra flotante mención
    const btnMention = document.getElementById('btn-mention-trigger');
    if (btnMention) {
        btnMention.onclick = () => {
            editor.focus();
            // Insertar @ simulado si no existe
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const atNode = document.createTextNode('@');
            range.insertNode(atNode);
            range.setStartAfter(atNode);
            range.setEndAfter(atNode);
            mostrarMentionDropdown(range);
        };
    }
}

function actualizarEstadisticas() {
    const text = document.getElementById('editor').innerText || "";
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;

    // Calcular total del cuaderno (incluyendo la hoja actual modificada en memoria)
    let totalWords = 0;
    hojas.forEach((h, i) => {
        if (i === indiceHojaActual) {
            totalWords += words;
        } else {
            const hText = h.contenido ? h.contenido.replace(/<[^>]*>/g, ' ').trim() : "";
            totalWords += hText ? hText.split(/\s+/).length : 0;
        }
    });

    const readTime = Math.ceil(totalWords / 200);

    document.getElementById('word-count').textContent = words.toLocaleString();
    document.getElementById('total-word-count').textContent = totalWords.toLocaleString();
    document.getElementById('read-time').textContent = `${readTime} min`;
}

function setupUIListeners() {
    // Toggle Notas Sidebar
    const btnToggleNotes = document.getElementById('btn-toggle-notes');
    const sidebar = document.getElementById('notes-sidebar');

    if (btnToggleNotes) {
        btnToggleNotes.onclick = () => {
            sidebar.classList.toggle('hidden');
            if (!sidebar.classList.contains('hidden')) {
                cargarNotasRapidas();
            }
        };
    }

    const btnCloseNotes = document.getElementById('btn-close-notes');
    if (btnCloseNotes) {
        btnCloseNotes.onclick = () => {
            sidebar.classList.add('hidden');
        };
    }
}

async function cargarNotasRapidas() {
    const container = document.getElementById('quick-notes-list');
    const hojaActual = hojas[indiceHojaActual];
    if (!hojaActual) return;

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
                    <button onclick="eliminarNota(${n.id})" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300">
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
    event.preventDefault();
    const input = document.getElementById('note-input');
    const contenido = input.value.trim();
    if (!contenido) return;

    const hojaActual = hojas[indiceHojaActual];
    if (!hojaActual) return;

    // Detectar línea actual
    const selection = window.getSelection();
    let linea = 1;
    if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(document.getElementById('editor'));
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const textBefore = preCaretRange.toString();
        linea = textBefore.split('\n').length;
    }

    try {
        await API.escritura.notas.crear(hojaActual.id, {
            contenido,
            linea,
            categoria: 'Lore'
        });
        input.value = '';
        cargarNotasRapidas();
    } catch (e) {
        console.error(e);
        alert("Error al guardar nota");
    }
}

async function eliminarNota(notaId) {
    if (!confirm("¿Eliminar nota?")) return;
    const hojaActual = hojas[indiceHojaActual];
    try {
        await API.escritura.notas.eliminar(hojaActual.id, notaId);
        cargarNotasRapidas();
    } catch (e) {
        console.error(e);
    }
}

// === Smart References (@) ===
let rangeMencion = null;
const CATEGORIAS_MENCION = [
    { id: 'personaje', label: '👤 Personaje', class: 'mention-personaje' },
    { id: 'entidadcolectiva', label: '👥 Grupo / Facción', class: 'mention-entidadcolectiva' },
    { id: 'zona', label: '🗺️ Lugar', class: 'mention-zona' },
    { id: 'objetos', label: '✨ Objeto / Magia', class: 'mention-objetos' }
];

async function mostrarMentionDropdown(range) {
    rangeMencion = range.cloneRange();
    const dropdown = document.getElementById('mention-dropdown');

    // Posicionar dropdown cerca del cursor
    const rect = range.getBoundingClientRect();
    dropdown.style.display = 'block';
    dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;

    // Renderizar categorías primero
    dropdown.innerHTML = `
        <div class="px-3 py-1.5 text-[9px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5 mb-1">Categorías</div>
        ${CATEGORIAS_MENCION.map(cat => `
            <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group" 
                onclick="seleccionarCategoriaMencion('${cat.id}')">
                <span class="text-sm">${cat.label}</span>
            </div>
        `).join('')}
    `;

    dropdown.classList.remove('hidden');
    dropdown.classList.add('flex');
}

async function seleccionarCategoriaMencion(tipo) {
    const dropdown = document.getElementById('mention-dropdown');
    const datos = await API.cargarTodosLosDatos();
    const resultados = (datos[tipo] || []).map(e => ({ ...e, tipo }));

    if (resultados.length > 0) {
        dropdown.innerHTML = `
            <div class="px-3 py-1.5 text-[9px] font-black uppercase text-indigo-400 tracking-widest border-b border-white/5 mb-1 flex items-center gap-2">
                <span class="material-symbols-outlined text-xs" onclick="mostrarMentionDropdown(rangeMencion)">arrow_back</span>
                Resultados
            </div>
            ${resultados.map(entidad => `
                <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group" 
                    onclick="insertarMencion('${entidad.nombre}', '${entidad.id}', '${entidad.tipo}')">
                    <div class="flex items-center justify-center size-8 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/20">
                        <span class="material-symbols-outlined text-sm">${obtenerIconoEntidad(entidad.tipo)}</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm font-medium text-slate-200 group-hover:text-white">${entidad.nombre}</span>
                    </div>
                </div>
            `).join('')}
            <div class="h-px bg-white/10 my-1 mx-2"></div>
            <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group text-emerald-400" onclick="abrirModalCrearRapida('${tipo}')">
                <span class="material-symbols-outlined text-sm">add</span>
                <span class="text-xs font-bold">Crear nuevo...</span>
            </div>
        `;
    } else {
        dropdown.innerHTML = `
            <div class="px-3 py-6 text-center text-xs text-slate-500 italic">No hay entidades en esta categoría.</div>
            <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group text-emerald-400" onclick="abrirModalCrearRapida('${tipo}')">
                <span class="material-symbols-outlined text-sm">add</span>
                <span class="text-xs font-bold">Crear la primera...</span>
            </div>
        `;
    }
}

function cerrarMentionDropdown() {
    const dropdown = document.getElementById('mention-dropdown');
    if (dropdown) {
        dropdown.style.display = 'none';
        dropdown.classList.add('hidden');
        dropdown.classList.remove('flex');
    }
}

function insertarMencion(nombre, id, tipo) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeMencion);

    // Borrar el '@'
    document.execCommand('delete', false, null);

    // Insertar el pill estilizado
    const span = document.createElement('span');
    span.className = `mention-pill mention-${tipo.toLowerCase()} cursor-default select-all`;
    span.dataset.tipo = tipo;
    span.dataset.id = id;
    span.textContent = nombre;
    span.contentEditable = "false";

    const range = selection.getRangeAt(0);
    range.insertNode(span);

    // Mover caret después del pill
    range.setStartAfter(span);
    range.setEndAfter(span);
    selection.removeAllRanges();
    selection.addRange(range);

    // Insertar espacio invisible para poder seguir escribiendo normal
    const space = document.createTextNode('\u00A0');
    range.insertNode(space);
    range.setStartAfter(space);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    cerrarMentionDropdown();
    guardarHojaActual();
}

function abrirModalCrearRapida(tipoPreseleccionado = null) {
    if (tipoPreseleccionado) {
        document.getElementById('entidad-tipo-select').value = tipoPreseleccionado;
    }
    document.getElementById('modal-crear').classList.add('active');
    document.getElementById('entidad-nombre').focus();
    cerrarMentionDropdown();
}

function cerrarModalCrear() {
    document.getElementById('modal-crear').classList.remove('active');
}

async function guardarEntidadRapida(event) {
    event.preventDefault();
    const tipo = document.getElementById('entidad-tipo-select').value;
    const nombre = document.getElementById('entidad-nombre').value;
    const descripcion = document.getElementById('entidad-descripcion').value;

    const datos = {
        tipoEntidad: tipo,
        nombre: nombre,
        descripcion: descripcion,
        esNodo: false
    };

    try {
        const res = await API.bd.insertar(tipo, datos);
        if (res.error) {
            alert("Error: " + res.error);
            return;
        }

        // Obtener la entidad recién creada (asumimos que la API devuelve los datos o podemos re-listar)
        // Por ahora, forzamos un insert manual con los datos que tenemos
        const iconMap = {
            'entidadindividual': '👤',
            'entidadcolectiva': '👥',
            'zona': '🗺️',
            'construccion': '🏛️',
            'efectos': '✨'
        };

        insertarMencion(`${iconMap[tipo]} ${nombre}`, tipo, res.id || 0);
        cerrarModalCrear();
        document.getElementById('form-crear-rapida').reset();
    } catch (error) {
        console.error("Error en creación rápida:", error);
        alert("Error al crear entidad");
    }
}

function obtenerIconoEntidad(tipo) {
    const iconMap = {
        'entidadindividual': 'person',
        'entidadcolectiva': 'groups',
        'zona': 'map',
        'construccion': 'castle',
        'efectos': 'auto_awesome',
        'personaje': 'person', // Compatibilidad
        'lugar': 'map'
    };
    return iconMap[tipo.toLowerCase()] || 'help';
}
