/**
 * Imágenes de categorías: mismas rutas que en recursos.html (materias 1–8 + avisos).
 * Usar en admin y en recursos para que se vean igual.
 */
window.CategoriasImagenes = {
    DEFAULT: 'img/materias/DEMPRENDEDOR.webp',

    POR_ID: {
        1: 'img/materias/POO1.webp',
        2: 'img/materias/INTERNETS.avif',
        3: 'img/materias/DSOFTWARE.webp',
        4: 'img/materias/MNUMERICOS.webp',
        5: 'img/materias/DESARROLLO.webp',
        6: 'img/materias/SISTEMAS.webp',
        7: 'img/materias/INGLES.webp',
        8: 'img/materias/ORIENTACION.avif',
        9: 'img/materias/DEMPRENDEDOR.webp',
    },

    resolver(cat) {
        if (!cat) return this.DEFAULT;
        const id = parseInt(cat.id, 10);
        const url = (cat.imagen_url || '').trim();
        const tieneImagenFija = Object.prototype.hasOwnProperty.call(this.POR_ID, id);

        // Categoría nueva (sin mapa): usar solo lo guardado en BD
        if (url && !tieneImagenFija) return url;

        // Materias 1–9: imagen de recursos; ignorar placeholder genérico en BD
        if (tieneImagenFija) {
            if (!url || url.includes('DEMPRENDEDOR')) {
                return this.POR_ID[id];
            }
        }

        if (url) return url;
        return this.POR_ID[id] || this.DEFAULT;
    },
};
