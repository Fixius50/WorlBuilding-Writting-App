// ===================== CREAR PROYECTO =====================
async function crearProyecto() {
    const nombre = document.getElementById("crearNombre").value.trim();
    const enfoque = document.getElementById("crearTipo").value.trim();

    if (!nombre || !enfoque) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        // --- ¡CORRECCIÓN AQUÍ! ---
        // La URL correcta es "/api/proyectos/crear"
        const response = await fetch("/api/proyectos/crear", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                nombre: nombre,
                enfoque: enfoque
            })
        });

        if (!response.ok) {
            // El backend ahora devuelve un JSON en caso de error, así que lo parseamos
            const errorData = await response.json();
            throw new Error(errorData.message || "Error desconocido del servidor");
        }

        const mensaje = await response.text();
        alert(mensaje);

        // Redirigir a la ventana de proyectos (esto está bien)
        window.location.href = `html/ventanaProyectos.html`;

    } catch (err) {
        console.error("Error al crear proyecto:", err);
        alert("Error al crear el proyecto: " + err.message);
    }
}

// ===================== ABRIR PROYECTO =====================
async function abrirProyecto() {
    const nombre = document.getElementById("abrirNombre").value.trim();

    if (!nombre) {
        alert("Por favor ingresa un nombre de proyecto.");
        return;
    }

    try {
        // Esta URL está bien porque el controlador tiene un @GetMapping("/{nombre}")
        const response = await fetch(`/api/proyectos/${encodeURIComponent(nombre)}`, {
            method: "GET"
        });

        if (!response.ok) {
            const errorData = await response.json(); // Asumimos JSON para errores
            throw new Error(errorData.message || "Proyecto no encontrado");
        }

        // El backend devuelve un JSON con {nombre, enfoque} al abrir
        const proyecto = await response.json();
        alert(`Proyecto '${proyecto.nombre}' abierto correctamente.`);

        // Redirigir
        window.location.href = `html/ventanaProyectos.html`;

    } catch (err) {
        console.error("Error al abrir proyecto:", err);
        alert("Error al abrir el proyecto: " + err.message);
    }
}

// ===================== VENTANAS (mostrar/ocultar formularios) =====================
function abrirVentanaCreacion() {
    document.getElementById("crear").style.display = "flex";
    document.getElementById("abrir").style.display = "none";
}

function cerrarVentanaCrear() {
    document.getElementById("crear").style.display = "none";
}

function abrirVentanaAbrir() {
    document.getElementById("abrir").style.display = "flex";
    document.getElementById("crear").style.display = "none";
}

function cerrarVentanaAbrir() {
    document.getElementById("abrir").style.display = "none";
}

// ===================== AL CARGAR LA PÁGINA =====================
window.onload = () => {
    // Inicia con la pestaña "Abrir" visible por defecto
    abrirVentanaAbrir();
    document.getElementById("crear").style.display = "none";
};

// ===================== SALIR =====================
async function salir() {
    // No usamos confirm() porque puede ser bloqueado por el navegador
    // Sería mejor tener un modal de confirmación, pero por ahora:
    console.log("Intento de salida");

    try {
        await fetch("/api/exit", {
            method: "POST"
        });
        
        // No podemos fiarnos del alert, ya que la app podría cerrarse antes
        // Mostramos un mensaje de despedida en la página
        document.body.innerHTML = "<h1>Cerrando la aplicación...</h1>";
        
        // Damos tiempo al navegador para que muestre el mensaje antes de que se cierre
        setTimeout(() => {
           // (El servidor se está apagando)
        }, 500);

    } catch (err) {
        console.error("Error al salir:", err);
        alert("No se pudo contactar al servidor para cerrar: " + err.message);
    }
}