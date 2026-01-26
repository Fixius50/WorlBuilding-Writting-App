/**
 * Lógica reutilizable para las plantillas de nodos (html/nodos/*.html)
 * Centraliza la función para expandir/contraer.
 */
function toggleNodeExpansion(buttonElement) {
    // 'buttonElement' es el <button class="despliegue-datos"> que fue clickeado
    const nodeExpanded = buttonElement.querySelector('.node-expanded');

    if (nodeExpanded) {
        // Alternar entre mostrar y ocultar
        if (nodeExpanded.style.display === "none" || nodeExpanded.style.display === "") {
            nodeExpanded.style.display = "flex";
        } else {
            nodeExpanded.style.display = "none";
        }
    }
}