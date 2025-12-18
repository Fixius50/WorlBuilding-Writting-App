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
            // Crear uno por defecto si no existe ninguno?
            const nuevo = await API.escritura.crearCuaderno("Mi Historia", "Cuaderno inicial");
            cuadernoId = nuevo.id;
        }
    }

    await cargarCuaderno();
    setupEditor();
});

async function cargarCuaderno() {
    hojas = await API.escritura.listarHojas(cuadernoId);
    if (hojas.length > 0) {
        mostrarHoja(0);
    }
}

function mostrarHoja(index) {
    if (index < 0 || index >= hojas.length) return;

    indiceHojaActual = index;
    const hoja = hojas[index];
    const editor = document.getElementById('editor');

    // Guardar contenido anterior antes de cambiar? (Opcional si hay autosave)
    editor.innerHTML = hoja.contenido || "";
    document.getElementById('page-number').textContent = `Hoja ${hoja.numeroPagina}`;

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
        await API.escritura.guardarHoja(hoja.id, contenido);
        hoja.contenido = contenido;
        document.getElementById('save-status').textContent = "Cambios guardados";
        setTimeout(() => {
            document.getElementById('save-status').textContent = "Autoguardado activado";
        }, 2000);
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

    // TODO: Implementar Smart References (@)
    editor.addEventListener('input', async (e) => {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const textBeforeCaret = range.startContainer.textContent.substring(0, range.startOffset);

        if (textBeforeCaret.endsWith('@')) {
            mostrarMentionDropdown(range);
        } else {
            cerrarMentionDropdown();
        }
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('#mention-dropdown')) {
            cerrarMentionDropdown();
        }
    });
}

// === Smart References (@) ===
let rangeMencion = null;

async function mostrarMentionDropdown(range) {
    rangeMencion = range.cloneRange();
    const dropdown = document.getElementById('mention-dropdown');

    // Posicionar dropdown cerca del cursor
    const rect = range.getBoundingClientRect();
    dropdown.style.display = 'block';
    dropdown.style.top = `${rect.bottom + window.scrollY}px`;
    dropdown.style.left = `${rect.left + window.scrollX}px`;

    // Cargar todas las entidades
    const datos = await API.cargarTodosLosDatos();
    const resultados = [
        ...(datos.entidadIndividual || []).map(e => ({ ...e, icon: '👤', tipo: 'entidadindividual' })),
        ...(datos.entidadColectiva || []).map(e => ({ ...e, icon: '👥', tipo: 'entidadcolectiva' })),
        ...(datos.zona || []).map(e => ({ ...e, icon: '🗺️', tipo: 'zona' })),
        ...(datos.construccion || []).map(e => ({ ...e, icon: '🏛️', tipo: 'construccion' })),
        ...(datos.efectos || []).map(e => ({ ...e, icon: '✨', tipo: 'efectos' }))
    ];

    if (resultados.length > 0) {
        // Renderizar dropdown glassmorphism
        dropdown.innerHTML = resultados.map(entidad => `
            <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group" onclick="insertarMencion('${entidad.nombre}', '${entidad.id}', '${entidad.tipo}')">
                <div class="flex items-center justify-center size-8 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-sm">${obtenerIconoEntidad(entidad.tipo)}</span>
                </div>
                <div class="flex flex-col">
                    <span class="text-sm font-medium text-slate-200 group-hover:text-white">${entidad.nombre}</span>
                    <span class="text-[10px] text-slate-500 uppercase">${entidad.tipo}</span>
                </div>
            </div>
        `).join('');

        // Opción de crear nueva
        dropdown.innerHTML += `
            <div class="h-px bg-white/10 my-1 mx-2"></div>
            <div class="mention-item flex items-center gap-3 px-3 py-2 hover:bg-white/5 cursor-pointer transition-colors group text-indigo-400" onclick="abrirModalCrearRapida()">
                <div class="flex items-center justify-center size-8 rounded-full bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors border border-indigo-500/20">
                    <span class="material-symbols-outlined text-sm">add</span>
                </div>
                <span class="text-sm font-bold group-hover:text-white">Crear Nueva Entidad...</span>
            </div>
        `;

        // Posicionar dropdown
        const rect = range.getBoundingClientRect();
        dropdown.style.top = `${rect.bottom + window.scrollY + 5}px`;
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.classList.remove('hidden');
        dropdown.classList.add('flex');
    } else {
        dropdown.classList.add('hidden');
        dropdown.classList.remove('flex');
    }
}

function cerrarMentionDropdown() {
    document.getElementById('mention-dropdown').style.display = 'none';
}

function insertarMencion(nombre, id, tipo) {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(rangeMencion);

    // Borrar el '@'
    document.execCommand('delete', false, null);

    // Insertar el link/mención
    const link = document.createElement('a');
    link.href = "#";
    link.className = 'mention-link';
    link.dataset.tipo = tipo;
    link.dataset.id = id;
    link.textContent = texto;
    link.style.color = 'var(--color-gold)';
    link.style.textDecoration = 'none';
    link.style.fontWeight = 'bold';

    const range = selection.getRangeAt(0);
    range.insertNode(link);
    range.setStartAfter(link);
    range.setEndAfter(link);
    selection.addRange(range);

    // Insertar un espacio después
    const espacio = document.createTextNode('\u00A0');
    range.insertNode(espacio);
    range.setStartAfter(espacio);
    range.setEndAfter(espacio);

    cerrarMentionDropdown();
    guardarHojaActual();
}

function abrirModalCrearRapida() {
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
