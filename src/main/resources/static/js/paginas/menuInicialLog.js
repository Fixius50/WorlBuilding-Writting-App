// ===================== CREAR PROYECTO =====================
async function crearProyecto() {
    const nombre = document.getElementById("crearNombre").value.trim();
    const enfoque = document.getElementById("crearTipo").value.trim();

    if (!nombre || !enfoque) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        const response = await fetch("/api/proyectos/crear", { // <-- ¡URL CORREGIDA!
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams({
                nombre: nombre,
                enfoque: enfoque
            })
        });

        // El backend ahora responde con JSON, tanto para éxito como para error
        if (!response.ok) {
            // Si la respuesta es un error (404, 500, 409, etc.)
            const errorData = await response.json(); // Lee el JSON de error
            throw new Error(errorData.error || `Error ${response.status}`);
        }

        // Si la respuesta es OK (200)
        const data = await response.json(); // Lee el JSON de éxito
        alert(data.message); // Muestra el mensaje de éxito del backend

        // Redirigir a la ventana de proyectos
        window.location.href = `/html/ventanaProyectos.html`;

    } catch (err) {
        // err.message ahora contendrá el error de JSON.parse O el error del backend
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
        const response = await fetch(`/api/proyectos/${encodeURIComponent(nombre)}`, {
            method: "GET"
        });

        // El backend ahora responde con JSON
        if (!response.ok) {
            const errorData = await response.json(); // Lee el JSON de error
            throw new Error(errorData.error || `Error ${response.status}`);
        }

        const data = await response.json(); // Lee el JSON de éxito
        alert(data.message); // Muestra el mensaje de éxito del backend

        // Redirigir a la ventana de proyectos
        window.location.href = `/html/ventanaProyectos.html`;

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
    // Por defecto, mostrar la ventana de ABRIR
    abrirVentanaAbrir();
    // Ocultar la de crear
    cerrarVentanaCrear();
};

// ===================== SALIR =====================
async function salir() {
    // No usar alert() o confirm()
    console.log("Intentando salir...");

    try {
        await fetch("/api/exit", {
            method: "POST"
        });
        
        // Ocultar la app y mostrar un mensaje de despedida
        document.body.innerHTML = "<h1 style='color: white; text-align: center; margin-top: 50px;'>Has salido de la aplicación. Puedes cerrar esta pestaña.</h1>";

    } catch (err) {
        console.error("Error al salir:", err);
        alert("No se pudo contactar al servidor para cerrar: " + err.message);
    }
}