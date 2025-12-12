/**
 * Lógica para la página 'ventanaCreacion.html'
 */

let proyectoActivo = null;

document.addEventListener('DOMContentLoaded', () => {
    fetch('/api/proyectos/activo')
        .then(res => {
            if (!res.ok) throw new Error("No hay proyecto activo");
            return res.json();
        })
        .then(proyecto => {
            proyectoActivo = proyecto;
            // (El HTML original intentaba actualizar un 'nombre-proyecto' que no existe aquí)
            console.log("Proyecto activo:", proyecto.nombre);
        })
        .catch(err => {
            console.error(err.message);
        });
});

async function mostrarContenidoRelacionado(nombreArchivoHtml) {
    const despliegue = document.querySelector('.despliegue');
    despliegue.innerHTML = '';

    try {
        // 1. Cargar el HTML del formulario
        const respuesta = await fetch(new URL(nombreArchivoHtml, window.location.href));
        if (!respuesta.ok) {
            throw new Error('No se pudo cargar el panel: ' + nombreArchivoHtml);
        }
        const contenido = await respuesta.text();
        despliegue.innerHTML = contenido;

        // 2. ¡EL ARREGLO! Cargar el script del formulario dinámicamente
        
        // Eliminar cualquier script de formulario anterior para evitar duplicados
        const scriptViejo = document.getElementById("form-script-dinamico");
        if (scriptViejo) {
            scriptViejo.remove();
        }

        // Crear y añadir el nuevo script al final del <body>
        const scriptNuevo = document.createElement("script");
        scriptNuevo.id = "form-script-dinamico";
        // Usamos una ruta absoluta desde la raíz del sitio
        scriptNuevo.src = "/js/components/opcionesForm.js"; 
        scriptNuevo.defer = true; // Asegura que se ejecute después de que el HTML esté en su sitio
        document.body.appendChild(scriptNuevo);


    } catch (error) {
        despliegue.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
    }
}

function volverAlProyectoActual(){
    window.location.href = "../html/ventanaProyectos.html";
}

let dataFolder = null;

fetch('/api/config')
    .then(res => res.json())
    .then(config => {
        dataFolder = config.dataFolder;
        // Ahora puedes usar dataFolder en tu JS
        console.log("Ruta dataFolder:", dataFolder);
    });