document.addEventListener('DOMContentLoaded', () => {
    // Animations for dictionary list
    const list = document.getElementById('diccionario-list');
    if (list) {
        const items = list.querySelectorAll('div'); // Assuming static items present
        items.forEach((item, index) => {
            item.classList.add('animate-fade-in-up');
            item.style.animationDelay = `${index * 100}ms`;
        });
    }
});
