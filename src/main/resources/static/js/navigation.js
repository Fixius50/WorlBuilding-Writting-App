document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('nav-trigger');
    const menu = document.getElementById('radial-menu');
    const arrow = trigger.querySelector('.material-symbols-outlined');
    const items = document.querySelectorAll('.nav-item');

    let isOpen = false;

    // Configuration
    const radius = 140; // Distance from center
    const totalAngle = 180; // Semicircle
    const startAngle = 180; // Start at Left (9 o'clock)

    // Position items on init
    function positionItems() {
        const count = items.length;
        if (count === 0) return;

        // Spread angles: if 1 item, at 90. If more, spread evenly.
        // For N items, we have N-1 intervals? Or N slots?
        // Let's spread from 170 to 10 to keep them well within the arc.
        const effectiveStart = 170;
        const effectiveEnd = 10;
        const span = effectiveStart - effectiveEnd;
        const step = count > 1 ? span / (count - 1) : 0;

        items.forEach((item, index) => {
            // Calculate angle in degrees
            const degrees = effectiveStart - (step * index);
            // Convert to radians (0 is Right, 90 is Down, 180 is Left)
            const radians = degrees * (Math.PI / 180);

            // Calculate x, y relative to center top (0,0) of the container
            // Container is 300px wide, 150px high. Center is at 150, 0?
            // Actually CSS says radial-menu-container is centered at left:50%. 
            // So 0,0 inside it is Top-Left corner? No. 
            // Let's make items absolute relative to Top-Center of container.

            // X: cos gives -1 to 1. Times radius.
            // Y: sin gives 0 to 1 (for 0 to 180). Times radius.

            // We want absolute positioning relative to the container's center.
            // Container layout: width 300px. Center is at x=150px. Top is y=0.
            const centerX = 150;
            const centerY = 0; // Top anchor

            const x = centerX + (radius * Math.cos(radians));
            const y = centerY + (radius * Math.sin(radians));

            // Center the item itself (40px width => offset by 20)
            item.style.left = `${x - 20}px`;
            item.style.top = `${y - 20}px`;

            // Allow transitions
            item.style.transitionDelay = `${index * 0.05}s`;
        });
    }

    function toggleMenu() {
        isOpen = !isOpen;
        if (isOpen) {
            menu.classList.add('active');
            arrow.style.transform = 'rotate(180deg)';
        } else {
            menu.classList.remove('active');
            arrow.style.transform = 'rotate(0deg)';
        }
    }

    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    document.addEventListener('click', (e) => {
        if (isOpen && !menu.contains(e.target) && !trigger.contains(e.target)) {
            toggleMenu();
        }
    });

    // Run positioning
    positionItems();
});
