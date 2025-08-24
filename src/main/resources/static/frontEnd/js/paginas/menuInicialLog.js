// ===================== CREAR PROYECTO =====================
async function crearProyecto() {
    const nombre = document.getElementById("crearNombre").value.trim();
    const enfoque = document.getElementById("crearTipo").value.trim();

    if (!nombre || !enfoque) {
        alert("Por favor completa todos los campos.");
        return;
    }

    try {
        const response = await fetch("/api/proyectos", {
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
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const mensaje = await response.text();
        alert(mensaje);

        // Redirigir a la ventana de proyectos después de crear
        window.location.href = "/ventanaProyectos";

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
        const response = await fetch(`/api/proyectos/${encodeURIComponent(nombre)}`, {
            method: "GET"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }

        const mensaje = await response.text();
        alert(mensaje);

        // Redirigir a la ventana de proyectos al abrir
        window.location.href = "/ventanaProyectos";

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
    cerrarVentanaAbrir();
    cerrarVentanaCrear();
};

// ===================== SALIR =====================
async function salir() {
    const confirmar = confirm("¿Seguro que quieres salir de la aplicación?");
    if (!confirmar) return;

    try {
        const response = await fetch("/api/exit", {
            method: "POST"
        });

        if (!response.ok) {
            throw new Error("Error al cerrar la aplicación.");
        }

        alert("La aplicación se cerrará.");
        // Opción: puedes mostrar un mensaje o redirigir a una página de salida
        // window.location.href = "/html/salida.html";

    } catch (err) {
        console.error("Error al salir:", err);
        alert("No se pudo cerrar la aplicación: " + err.message);
    }
}