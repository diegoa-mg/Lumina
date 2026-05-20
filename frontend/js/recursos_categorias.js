/**
 * Carga las categorías desde la BD y las muestra en recursos.html
 */
(function () {
    const grid = document.getElementById('categorias-recursos-grid');
    if (!grid) return;

    const imgHelper = window.CategoriasImagenes;
    const IMAGEN_DEFAULT = imgHelper ? imgHelper.DEFAULT : 'img/materias/desarrolloemprendedor.webp';

    const ENLACE_POR_ID = {
        1: 'materia1.php',
        2: 'materia2.php',
        3: 'materia3.php',
        4: 'materia4.php',
        5: 'materia5.php',
        6: 'materia6.php',
        7: 'materia7.php',
        8: 'materia8.php',
        9: 'avisos.html',
    };

    const OVERLAY_COLORS = [
        'bg-blue-900/80',
        'bg-indigo-900/80',
        'bg-cyan-900/80',
        'bg-slate-900/80',
    ];

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text ?? '';
        return div.innerHTML;
    }

    function imagenCategoria(cat) {
        return imgHelper ? imgHelper.resolver(cat) : IMAGEN_DEFAULT;
    }

    function enlaceCategoria(id) {
        return ENLACE_POR_ID[id] || `materia.php?categoria_id=${id}`;
    }

    function crearTarjeta(cat, index) {
        const img = imagenCategoria(cat);
        const href = enlaceCategoria(cat.id);
        const overlay = OVERLAY_COLORS[index % OVERLAY_COLORS.length];
        const nombreTraducido = typeof traducirMateriaLumina === 'function'
            ? traducirMateriaLumina(cat.nombre_categoria, cat.id)
            : cat.nombre_categoria;
        const nombre = escapeHtml(nombreTraducido);
        const verContenido = typeof t === 'function' ? t('comun.ver_contenido') : 'Ver contenido';

        const card = document.createElement('div');
        card.className = 'materia-card group relative h-40 sm:h-64 w-full overflow-hidden rounded-2xl bg-gray-200 shadow-lg cursor-pointer';
        card.innerHTML = `
            <img src="${escapeHtml(img)}" alt="${nombre}" class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" onerror="this.src='${IMAGEN_DEFAULT}'">
            <a href="${escapeHtml(href)}" class="materia-overlay absolute inset-0 flex flex-col items-center justify-center ${overlay} opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 class="text-white text-xl font-black text-center px-4 transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                    ${nombre}
                </h3>
                <div class="mt-2 w-12 h-1 bg-white rounded-full"></div>
                <p class="text-white/80 text-xs mt-3 font-semibold uppercase tracking-widest">${escapeHtml(verContenido)}</p>
            </a>
        `;
        card.addEventListener('click', () => {
            window.location.href = href;
        });
        return card;
    }

    async function cargarCategoriasRecursos() {
        grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">${typeof t === 'function' ? t('recursos.cargando_materias') : 'Cargando materias...'}</p>`;
        try {
            const response = await fetch('../backend/obtener_categorias.php');
            const data = await response.json();
            if (!data.ok || !Array.isArray(data.categorias)) {
                throw new Error(data.mensaje || (typeof t === 'function' ? t('recursos.no_categorias') : 'No se pudieron cargar las categorías'));
            }
            grid.innerHTML = '';
            const categoriasMaterias = data.categorias.filter((cat) => Number(cat.id) !== 9);

            if (categoriasMaterias.length === 0) {
                grid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-12">${typeof t === 'function' ? t('recursos.sin_categorias') : 'No hay categorías disponibles.'}</p>`;
                return;
            }
            categoriasMaterias.forEach((cat, index) => {
                grid.appendChild(crearTarjeta(cat, index));
            });
        } catch (error) {
            console.error(error);
            grid.innerHTML = `<p class="col-span-full text-center text-red-500 py-12">${typeof t === 'function' ? t('recursos.error_categorias') : 'Error al cargar las categorías.'}</p>`;
        }
    }

    document.addEventListener('DOMContentLoaded', cargarCategoriasRecursos);
    document.addEventListener('lumina-idioma-cambiado', cargarCategoriasRecursos);
})();
