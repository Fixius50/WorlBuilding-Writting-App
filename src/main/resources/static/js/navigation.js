document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('nav-trigger');
    const menu = document.getElementById('radial-menu');
    const items = document.querySelectorAll('.nav-item');

    if (!trigger || !menu) return; // Exit if not in page

    let isOpen = false;

    function showMenu() {
        isOpen = true;
        menu.classList.add('active');
    }

    function hideMenu() {
        isOpen = false;
        menu.classList.remove('active');
    }

    // Hover logic on trigger
    trigger.addEventListener('mouseenter', showMenu);

    // Maintain open while mouse is in menu
    menu.addEventListener('mouseenter', showMenu);
    menu.addEventListener('mouseleave', hideMenu);

    // Also close if clicking outside
    document.addEventListener('click', (e) => {
        if (isOpen && !menu.contains(e.target) && !trigger.contains(e.target)) {
            hideMenu();
        }
    });

    // Check for active project to update UI
    async function updateMenuStatus() {
        try {
            const proyecto = await API.proyectos.activo();
            const projectDependentPages = [
                'libreria.html',
                'biblia.html',
                'timeline.html',
                'atlas.html',
                'conlang.html'
            ];

            const noProject = !proyecto || proyecto.error || !proyecto.nombreProyecto;

            items.forEach(item => {
                const isDependent = projectDependentPages.some(page => item.href.includes(page));
                const isCurrentPage = window.location.pathname.includes(item.getAttribute('href').split('/').pop());

                if (isCurrentPage) item.classList.add('active');

                if (noProject && isDependent) {
                    item.classList.add('opacity-40');
                    item.title = "Selecciona un mundo en el Dashboard primero";
                    item.dataset.disabled = "true";

                    item.onclick = (e) => {
                        e.preventDefault();
                        alert("⚠️ Acción requerida: Debes abrir un mundo desde el Dashboard para acceder a esta sección.");
                    };
                } else {
                    item.classList.remove('opacity-40');
                    item.dataset.disabled = "false";
                    item.onclick = null;
                }
            });
        } catch (e) {
            console.error("Error updating menu status:", e);
        }
    }

    updateMenuStatus();
});
