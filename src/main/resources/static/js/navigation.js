document.addEventListener('DOMContentLoaded', () => {
    const trigger = document.getElementById('nav-trigger');
    const menu = document.getElementById('radial-menu');
    const arrow = trigger.querySelector('.material-symbols-outlined');

    let isOpen = false;

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

    // Positions for 5 items (Dashboard, Biblia, Escritura, Atlas, Timeline, Conlang -> 6 items)
    // Semicircle arc: 180 degrees downwards? 
    // Let's place them manually or calc.
    // CSS classes are cleaner for stability.
});
