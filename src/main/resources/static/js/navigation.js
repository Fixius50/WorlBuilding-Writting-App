document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('nav-trigger');
    const menu = document.getElementById('radial-menu');
    const items = document.querySelectorAll('.nav-item');

    let isOpen = false;

    // Configuration
    const radius = 260; // Slightly more distance
    const startAngle = 175; // More left
    const endAngle = 5;    // More right

    // Position items on init
    function positionItems() {
        const count = items.length;
        if (count === 0) return;

        // Spread angles: if 1 item, at 90. If more, spread evenly.
        // For N items, we have N-1 intervals? Or N slots?
        // Let's spread from 170 to 10 to keep them well within the arc.
        const span = startAngle - endAngle;
        const step = count > 1 ? span / (count - 1) : 0;

        items.forEach((item, index) => {
            // Calculate angle in degrees
            const degrees = startAngle - (step * index);
            // Convert to radians (0 is Right, 90 is Down, 180 is Left)
            const radians = degrees * (Math.PI / 180);

            // Calculate x, y relative to center top (0,0) of the container
            // Container layout: width 600px. Center is at x=300px. Top is y=0.
            const centerX = 300;
            const centerY = 40; // Mayor margen superior (offset) para que no toquen el borde

            const x = centerX + (radius * Math.cos(radians));
            const y = centerY + (radius * 0.35 * Math.sin(radians)); // Curvatura ligeramente más baja

            // Center the item itself (48px width => offset by 24)
            item.style.left = `${x - 24}px`;
            item.style.top = `${y - 24}px`;

            // Allow transitions
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    }

    function showMenu() {
        isOpen = true;
        menu.classList.add('active');
    }

    function hideMenu() {
        isOpen = false;
        menu.classList.remove('active');
    }

    // Hover logic
    trigger.addEventListener('mouseenter', showMenu);

    // Close when leaving the menu container
    menu.addEventListener('mouseleave', hideMenu);

    // Also close if clicking outside (backup)
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

            const noProject = proyecto.error || !proyecto.nombreProyecto;

            items.forEach(item => {
                const isDependent = projectDependentPages.some(page => item.href.includes(page));

                if (noProject && isDependent) {
                    item.classList.add('opacity-40');
                    item.title = "Selecciona un mundo en el Dashboard primero";
                    item.dataset.disabled = "true";

                    // Prevent click
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

    // Run positioning
    positionItems();
    updateMenuStatus();
});
