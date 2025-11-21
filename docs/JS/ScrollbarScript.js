// Sélection des éléments
const scrollbar = document.querySelector('.scrollbar');
const scrollbarThumb = document.querySelector('.scrollbar-thumb');

// Variables pour le drag
let isDragging = false;
let startY;
let startThumbTop;

// Fonction pour mettre à jour la position de la scrollbar-thumb
function updateScrollbar() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollTop = window.scrollY;
    const thumbHeight = (window.innerHeight / document.documentElement.scrollHeight) * scrollbar.offsetHeight;

    // Ajuster la hauteur de la thumb
    scrollbarThumb.style.height = `${thumbHeight}px`;

    // Calculer la position de la thumb
    const thumbPosition = (scrollTop / scrollableHeight) * (scrollbar.offsetHeight - thumbHeight);
    scrollbarThumb.style.transform = `translateY(${thumbPosition}px)`;
}

// Fonction pour commencer le drag
function startDrag(event) {
    isDragging = true;
    startY = event.clientY;
    startThumbTop = parseFloat(scrollbarThumb.style.transform.replace('translateY(', '').replace('px)', '')) || 0;
    document.body.style.userSelect = 'none'; // Désactive la sélection de texte pendant le drag
}

// Fonction pour effectuer le drag
function onDrag(event) {
    if (!isDragging) return;

    const deltaY = event.clientY - startY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const thumbHeight = scrollbarThumb.offsetHeight;
    const maxThumbTop = scrollbar.offsetHeight - thumbHeight;

    // Calculer la nouvelle position de la thumb
    let newThumbTop = startThumbTop + deltaY;
    newThumbTop = Math.max(0, Math.min(newThumbTop, maxThumbTop)); // Limiter la position de la thumb

    // Mettre à jour la position de la thumb
    scrollbarThumb.style.transform = `translateY(${newThumbTop}px)`;

    // Synchroniser le défilement de la page
    const scrollTop = (newThumbTop / maxThumbTop) * scrollableHeight;
    window.scrollTo(0, scrollTop);
}

// Fonction pour arrêter le drag
function stopDrag() {
    isDragging = false;
    document.body.style.userSelect = ''; // Réactiver la sélection de texte
}

// Ajouter les écouteurs d'événements
scrollbarThumb.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', stopDrag);
window.addEventListener('scroll', updateScrollbar);
window.addEventListener('resize', updateScrollbar); // Mettre à jour la scrollbar lors du redimensionnement

// Initialiser la scrollbar au chargement
updateScrollbar();