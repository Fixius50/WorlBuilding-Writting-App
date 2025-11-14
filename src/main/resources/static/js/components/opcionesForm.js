/**
 * Lógica reutilizable para los formularios de creación (html/opciones/*.html)
 * ¡MODIFICADO! Se elimina el 'DOMContentLoaded' para que funcione al cargarse dinámicamente.
 */

// Esta función se adjuntará a cualquier formulario que tenga el ID 'form-entidad'
const formulario = document.getElementById("form-entidad");

if (formulario) {
    formulario.addEventListener("submit", function (e) {
        e.preventDefault();
        
        // 1. Obtener los datos del formulario
        const formData = new FormData(formulario);
        const datosObjeto = Object.fromEntries(formData.entries());
        
        // 2. Obtener el 'tipo' de entidad desde el atributo data del formulario
        const tipoEntidad = formulario.dataset.tipoEntidad;
        if (!tipoEntidad) {
            alert("Error: El formulario no tiene 'data-tipo-entidad'.");
            return;
        }

        // 3. Mapear y enviar
        guardarEntidad(datosObjeto, tipoEntidad, formulario);
    });
}


/**
 * Función centralizada para guardar CUALQUIER entidad.
 * Mapea los datos del formulario al DTO plano que espera el backend.
 */
function guardarEntidad(datosObjeto, tipo, formularioElement) {
    
    // Objeto base del DTO
    const datosParaEnviar = {
        nombre: datosObjeto.nombre,
        apellidos: datosObjeto.apellidos,
        descripcion: datosObjeto.descripcion,
        tipo: tipo // ¡Clave!
    };

    // Mapeo específico basado en el tipo
    switch (tipo) {
        case "entidadindividual":
        case "entidadcolectiva":
            datosParaEnviar.estado = datosObjeto.estado;
            datosParaEnviar.origenEntidad = datosObjeto.origen;
            datosParaEnviar.comportamientoEntidad = datosObjeto.comportamiento;
            break;
        case "zona":
            datosParaEnviar.tamannoZona = datosObjeto.tamano;
            datosParaEnviar.desarrolloZona = datosObjeto.desarrollo;
            break;
        case "construccion":
            datosParaEnviar.tamannoCons = datosObjeto.tamano;
            datosParaEnviar.desarrolloCons = datosObjeto.desarrollo;
            break;
        case "efectos":
            datosParaEnviar.origenEfecto = datosObjeto.origen;
            datosParaEnviar.dureza = datosObjeto.dureza;
            datosParaEnviar.comportamientoEfecto = datosObjeto.comportamiento;
            break;
        case "interaccion":
            datosParaEnviar.direccion = datosObjeto.direccion;
            datosParaEnviar.afectados = datosObjeto.afectados;
            break;
        default:
            alert("Error: Tipo de entidad desconocido: " + tipo);
            return;
    }

    // El fetch es el mismo para todos
    fetch('/api/bd/insertar', {
        method: "POST", // Método correcto
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosParaEnviar)
    })
    .then(async res => {
        if (res.ok) {
            return res.json();
        } else {
            const errText = await res.text();
            throw new Error(errText || "Error desconocido");
        }
    })
    .then(dataGuardada => {
        alert("Datos guardados correctamente:\n" + `ID: ${dataGuardada.id}, Nombre: ${dataGuardada.nombre}`);
        if (formularioElement) {
            formularioElement.reset();
        }
    })
    .catch(err => alert("Error al guardar datos:\n" + err.message));
}