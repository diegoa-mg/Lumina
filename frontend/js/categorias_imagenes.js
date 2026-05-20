/**
 * Imágenes de categorías: mismas rutas que en recursos.html (materias 1–8 + avisos).
 * Usar en admin y en recursos para que se vean igual.
 */
window.CategoriasImagenes = {
    DEFAULT: 'img/materias/desarrolloemprendedor.webp',

    POR_ID: {
        1: 'img/materias/poo.webp',
        2: 'img/materias/serviciosinternet.avif',
        3: 'img/materias/ciclovidadesarrollosoftware.webp',
        4: 'img/materias/metodosnumericos.webp',
        5: 'img/materias/desarrolloemprendedor.webp',
        6: 'img/materias/sistemasdigitales.webp',
        7: 'img/materias/ingles.webp',
        8: 'img/materias/orientacion.avif',
        9: 'img/materias/avisos.webp',
    },

    resolver(cat) {
        if (!cat) return this.DEFAULT;
        const id = parseInt(cat.id, 10);
        const url = (cat.imagen_url || '').trim();
        const tieneImagenFija = Object.prototype.hasOwnProperty.call(this.POR_ID, id);

        // Categoría nueva (sin mapa): usar solo lo guardado en BD
        if (url && !tieneImagenFija) return url;

        // Materias 1–9: mantener fallback por ID si la BD no trae imagen.
        if (tieneImagenFija) {
            if (!url) {
                return this.POR_ID[id];
            }
        }

        if (url) return url;
        return this.POR_ID[id] || this.DEFAULT;
    },
};
