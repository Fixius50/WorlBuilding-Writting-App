/**
 * Lógica para la página 'ventanaProyectos.html'
 */

let nombreProyectoGlobal = null;
let infiniteMap = null;
let projectDataLoader = null;

function abrirVentanaCreacion() {
    if (nombreProyectoGlobal) {
        window.location.href = `/html/ventanaCreacion.html?proyecto=${encodeURIComponent(nombreProyectoGlobal)}`;
    }
}

function abrirVentanaAjustes() {
    if (nombreProyectoGlobal) {
        window.location.href = `/html/ventanaAjustes.html?proyecto=${encodeURIComponent(nombreProyectoGlobal)}`;
    }
}

function abrirVentanaMenuInicial() {
    if (nombreProyectoGlobal) {
        window.location.href = `../menuInicialLog.html`;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Primero obtenemos el proyecto activo
        const resProyecto = await fetch('/api/proyectos/activo');
        console.log('Respuesta del servidor (proyecto activo):', resProyecto.status);
        
        if (!resProyecto.ok) {
            throw new Error("No hay proyecto activo");
        }

        const proyecto = await resProyecto.json();
        console.log('Datos del proyecto:', proyecto);

        // Guardamos el nombre del proyecto y actualizamos la UI
        nombreProyectoGlobal = proyecto.nombre;
        document.getElementById("nombre-proyecto").textContent = `${proyecto.nombre} ( -${proyecto.enfoque}- )`;

        // Luego cargamos la configuración
        const resConfig = await fetch('/api/config');
        const config = await resConfig.json();
        console.log('Configuración cargada:', config);

        // Inicializamos el mapa y el cargador de datos solo si tenemos un proyecto activo
        initializeInfiniteMap();
        
        // Esperamos un momento antes de inicializar el cargador de datos
        setTimeout(() => {
            initializeProjectDataLoader();
            // Cargamos los datos del proyecto
            if (projectDataLoader) {
                projectDataLoader.loadProjectData().then(() => {
                    console.log('Datos del proyecto cargados correctamente');
                }).catch(error => {
                    console.error('Error al cargar datos del proyecto:', error);
                });
            }
        }, 500);

    } catch (error) {
        console.error('Error al inicializar la página:', error);
        document.getElementById("nombre-proyecto").textContent = "Sin proyecto activo";
        // Aún así inicializamos el mapa para poder mostrar la interfaz
        initializeInfiniteMap();
    }
});

// ===== FUNCIONES DEL MAPA INFINITO =====

function initializeInfiniteMap() {
    // Esperar a que el DOM esté completamente cargado
    setTimeout(() => {
        const container = document.getElementById('infinite-map-container');
        if (container) {
            infiniteMap = new InfiniteMap('infinite-map-container', {
                gridSize: 100,
                gridColor: '#e0e0e0',
                gridOpacity: 0.3,
                backgroundColor: '#f8f9fa',
                zoomLevel: 1,
                minZoom: 0.1,
                maxZoom: 5,
                showCoordinates: true,
                coordinateColor: '#666'
            });
            
            console.log('🗺️ Mapa infinito cargado en ventana de proyectos');
            
            // Cargar marcadores de ejemplo después de un breve delay
            setTimeout(() => {
                loadProjectMarkers();
            }, 500);
        } else {
            console.error('❌ Contenedor del mapa no encontrado');
        }
    }, 100);
}

function resetMapView() {
    if (infiniteMap) {
        infiniteMap.resetView();
    }
}

function zoomInMap() {
    if (infiniteMap) {
        infiniteMap.zoomIn();
    }
}

function zoomOutMap() {
    if (infiniteMap) {
        infiniteMap.zoomOut();
    }
}

function toggleCoordinates() {
    if (infiniteMap) {
        infiniteMap.config.showCoordinates = !infiniteMap.config.showCoordinates;
        infiniteMap.render();
    }
}


// ===== FUNCIONES DEL CARGADOR DE DATOS =====

function initializeProjectDataLoader() {
    projectDataLoader = new ProjectDataLoader();
    
    // Cargar datos del proyecto después de un breve delay
    setTimeout(() => {
        projectDataLoader.loadProjectData();
    }, 500);
    
    console.log('📦 Cargador de datos del proyecto inicializado');
}

// Función para recargar datos del proyecto
function reloadProjectData() {
    if (!projectDataLoader) return;
    
    const reloadBtn = document.querySelector('.reload-btn');
    if (reloadBtn) {
        reloadBtn.classList.add('loading');
    }
    
    projectDataLoader.reload().then(() => {
        if (reloadBtn) {
            reloadBtn.classList.remove('loading');
        }
    }).catch(() => {
        if (reloadBtn) {
            reloadBtn.classList.remove('loading');
        }
    });
}

// Función para cargar marcadores desde el proyecto (ahora usa datos reales)
function loadProjectMarkers() {
    if (!nombreProyectoGlobal || !projectDataLoader) return;
    
    // Los marcadores se cargarán automáticamente cuando se arrastren elementos
    console.log('📍 Los marcadores se cargarán al arrastrar elementos al mapa');
}