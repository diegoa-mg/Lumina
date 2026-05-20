<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" type="image/png" href="img/logo/Logo Lumina - Sin texto.png">
    <title>Lumina - Inicio</title>

    <link rel="preload" href="css/normalize.css" as="style">
    <link rel="stylesheet" href="css/normalize.css">

    <link rel="preload" href="css/base.css?v=3" as="style">
    <link rel="stylesheet" href="css/base.css?v=3">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Inter&family=Libre+Baskerville&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

    <script src="https://cdn.tailwindcss.com"></script>

    <link rel="stylesheet" href="css/recursos.css?v=4">
    <link rel="stylesheet" href="css/navbar.css?v=6">
    <link rel="stylesheet" href="css/styles.css?v=23">
    <link rel="stylesheet" href="css/comentarios_materia.css?v=4">
</head>

<body class="bg-gray-100">

<header>

    <div class="nav-bg">

        <div class="logo">
            <a href="index.html">
                <img src="img/logo/Logo Lumina (Fondo Blanco) Horizontal - Sin eslogan.png">
            </a>
        </div>

        <div class="search-container">
            <span class="search-icon material-symbols-outlined">
                search
            </span>

            <input class="search" type="search" placeholder="Buscar..." data-i18n-placeholder="nav.buscar">
        </div>

        <nav class="nav-principal">
            <a href="index.html" data-i18n="nav.inicio">Inicio</a>
            <a href="login.html" data-i18n="nav.iniciar_sesion">Iniciar Sesión</a>
        </nav>

    </div>

</header>


<!-- ================= MAIN ================= -->

<main>
    <div class="contenedor-principal">

        <div class="encabezado-pagina">
            <h1 id="materiaNombre">POO</h1>
        </div>

        <section class="materia-bloque">
            <div class="materia-bloque-header">
                <h2 data-i18n="materia.explora">Explora la clase</h2>
            </div>

            <div class="materia-filtros">
                <button class="filter-btn active" data-filter="all" type="button" data-i18n="materia.filtro_todo">Todo</button>
                <button class="filter-btn" data-filter="articulo" type="button" data-i18n="materia.filtro_articulos">Artículos</button>
                <button class="filter-btn" data-filter="video" type="button" data-i18n="materia.filtro_videos">Videos</button>
                <button class="filter-btn" data-filter="recurso" type="button" data-i18n="materia.filtro_recursos">Recursos</button>
            </div>

            <div id="contenedorPosts" class="materia-posts-grid"></div>
        </section>


        <section class="materia-bloque">
            <div class="materia-bloque-header">
                <h2 data-i18n="comentarios.titulo">Comentarios</h2>
            </div>

            <div class="comentario-form">
                <div class="comentario-avatar-form">
                    <span class="material-symbols-outlined comentario-avatar-icon">person</span>
                </div>
                <textarea id="inputComentarioMateria"
                          placeholder="Añadir comentario..." data-i18n-placeholder="comentarios.placeholder"
                          class="flex-1 bg-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                <button id="btnPublicarComentarioMateria"
                        type="button"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition"
                        data-i18n="comun.publicar">Publicar</button>
            </div>

            <div id="listaComentariosMateria" class="space-y-4"></div>
        </section>

    </div>
</main>


<!-- ================= FOOTER ================= -->

<footer class="footer">

    <section class="contenido-footer">

        <div class="footer-brand">
            <h1>Lumina</h1>
            <p data-i18n="footer.tagline">Plataforma de difusión digital académica</p>
        </div>
        <nav class="footer-links" aria-label="Enlaces del sitio" data-i18n-aria="footer.aria_enlaces">
            <div class="footer-link-group">
                <a href="index.html" data-i18n="nav.inicio">Inicio</a>
                <a href="avisos.html" data-i18n="nav.avisos">Avisos</a>
                <a href="recursos.html" data-i18n="nav.recursos">Recursos</a>
                <a href="calendario.html" data-i18n="nav.calendario">Calendario</a>
            </div>
            <div class="footer-link-group">
                <a href="materia1.php" data-i18n="footer.materia1">POO</a>
                <a href="materia2.php" data-i18n="footer.materia2">Servicios de Internet</a>
                <a href="materia3.php" data-i18n="footer.materia3">Ciclo de Vida</a>
                <a href="materia4.php" data-i18n="footer.materia4">Métodos Numéricos</a>
            </div>
            <div class="footer-link-group">
                <a href="materia5.php" data-i18n="footer.materia5">Desarrollo Emprendedor</a>
                <a href="materia6.php" data-i18n="footer.materia6">Sistemas Digitales</a>
                <a href="materia7.php" data-i18n="footer.materia7">Inglés</a>
                <a href="materia8.php" data-i18n="footer.materia8">Orientación y Tutoría</a>
            </div>
        </nav>

    </section>

    <p class="copy">© 2026 Lumina</p>

</footer>


<!-- ================= JS ================= -->

<script>

const MATERIAS = {
    'materia1.php': { id: 1, nombre: 'Programación Orientada a Objetos' },
    'materia2.php': { id: 2, nombre: 'Servicios de Internet' },
    'materia3.php': { id: 3, nombre: 'Ciclo de Vida del Desarrollo de Software' },
    'materia4.php': { id: 4, nombre: 'Métodos Numéricos' },
    'materia5.php': { id: 5, nombre: 'Desarrollo Emprendedor' },
    'materia6.php': { id: 6, nombre: 'Sistemas Digitales' },
    'materia7.php': { id: 7, nombre: 'Inglés' },
    'materia8.php': { id: 8, nombre: 'Orientación y Tutoría' }
};

const archivoMateria = window.location.pathname.split('/').pop();
const materiaActual = MATERIAS[archivoMateria] || MATERIAS['materia1.php'];

function aplicarNombreMateriaActual() {
    const nombreTraducido = typeof traducirMateriaLumina === 'function'
        ? traducirMateriaLumina(materiaActual.nombre, materiaActual.id)
        : materiaActual.nombre;
    document.title = "Lumina - " + nombreTraducido;
    document.getElementById('materiaNombre').textContent = nombreTraducido;
}

aplicarNombreMateriaActual();

// ============================================
// HELPERS
// ============================================

function escapeHtmlMat(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getAutorFallback(nombre) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || 'Autor')}&background=2D50D1&color=fff`;
}

function resolverFotoAutor(fotoUrl, nombre) {
    if (!fotoUrl) return getAutorFallback(nombre);
    if (/^(https?:)?\/\//.test(fotoUrl) || fotoUrl.startsWith('data:image')) return fotoUrl;
    return fotoUrl.replace(/^(\.\.\/)+/, '').replace(/^frontend\//, '');
}

function formatearFechaMat(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function recorteMat(texto, limite = 120) {
    const limpio = String(texto ?? '');
    return limpio.length > limite ? `${limpio.substring(0, limite)}...` : limpio;
}

function etiquetaTipoMat(tipo) {
    const tt = (k, f) => (typeof t === 'function' ? t(k, f) : f);
    const claves = { articulo: 'tipo.articulo', video: 'tipo.video', recurso: 'tipo.recurso' };
    const fallback = { articulo: 'Artículo', video: 'Video', recurso: 'Recurso' };
    const key = String(tipo || '').toLowerCase();
    if (claves[key]) return tt(claves[key], fallback[key]);
    return tt('tipo.publicacion', 'Publicación');
}

function obtenerNombreArchivoMat(ruta) {
    if (!ruta) return '';
    const nombre = decodeURIComponent(String(ruta).split('/').pop() || '');
    return nombre.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function obtenerYoutubeEmbedMat(url) {
    if (!url) return '';
    const match = String(url).match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function obtenerInicialesMat(nombre) {
    const partes = String(nombre || 'Usuario').trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return 'U';
    return partes.slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('');
}

function renderAvatarAutorMat(fotoUrl, nombre) {
    if (fotoUrl) {
        return `<img src="${escapeHtmlMat(fotoUrl)}" alt="${escapeHtmlMat(nombre)}">`;
    }
    return `<span class="autor-avatar-iniciales">${escapeHtmlMat(obtenerInicialesMat(nombre))}</span>`;
}



// ============================================
// RENDER DE TARJETA (estilo inicio / recursos)
// ============================================

function renderPostMateria(post) {
    const id = Number(post.id || 0);
    const titulo = escapeHtmlMat(post.titulo || 'Publicación sin título');
    const imagen = escapeHtmlMat(post.imagen_url || 'img/default-post.jpg');
    const autorNombre = post.autor || 'Autor desconocido';
    const autor = escapeHtmlMat(autorNombre);
    const autorFoto = post.autor_foto || '';
    const fecha = escapeHtmlMat(formatearFechaMat(post.fecha_creacion));
    const tipoRaw = String(post.tipo || 'articulo').toLowerCase();
    const tipo = escapeHtmlMat(etiquetaTipoMat(tipoRaw));
    const materiaTexto = typeof traducirMateriaLumina === 'function'
        ? traducirMateriaLumina(post.materia || materiaActual.nombre, post.categoria_id || materiaActual.id)
        : (post.materia || materiaActual.nombre);
    const materia = escapeHtmlMat(materiaTexto);
    const extracto = escapeHtmlMat(recorteMat(post.descripcion));
    const descCompleta = escapeHtmlMat(post.descripcion || '');
    const likes = Number(post.likes_count || 0);
    const archivoUrl = post.archivo_url || post.noticia_url || '';
    const videoUrl = post.video_url || '';
    const youtubeUrl = post.youtube_url || '';
    const youtubeEmbed = obtenerYoutubeEmbedMat(youtubeUrl);

    const media = tipoRaw === 'recurso' && archivoUrl
        ? `<div class="lumina-resource-media">
                <span class="material-symbols-outlined">description</span>
                <span>${escapeHtmlMat(obtenerNombreArchivoMat(archivoUrl) || 'Recurso adjunto')}</span>
            </div>`
        : tipoRaw === 'video' && videoUrl
            ? `<video src="${escapeHtmlMat(videoUrl)}" controls muted playsinline preload="metadata"></video>`
        : tipoRaw === 'video' && youtubeEmbed
            ? `<iframe src="${escapeHtmlMat(youtubeEmbed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${imagen}" alt="${titulo}">`;

    const cta = tipoRaw === 'recurso' && archivoUrl
        ? `<a class="lumina-post-cta" href="${escapeHtmlMat(archivoUrl)}" target="_blank" download="${escapeHtmlMat(obtenerNombreArchivoMat(archivoUrl) || 'recurso')}" data-i18n="comun.descargar">Descargar</a>`
        : `<button class="lumina-post-cta" type="button" data-i18n="comun.leer_mas">Leer más</button>`;

    return `
        <article class="lumina-post-card card-reciente" data-type="${tipoRaw}">
            <div class="lumina-post-media">
                ${media}
            </div>
            <div class="card-content lumina-post-body">
                <div class="meta-info lumina-post-topline">
                    <span class="lumina-post-badge" data-i18n="tipo.${tipoRaw}">${tipo}</span>
                    <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4 class="lumina-post-title">${titulo}</h4>
                <div class="autor-info lumina-post-author-row">
                    ${renderAvatarAutorMat(autorFoto, autorNombre)}
                    <div>
                        <p class="nombre-autor lumina-post-author-name">${autor}</p>
                        <p class="fecha-autor lumina-post-date" data-fecha-iso="${escapeHtmlMat(post.fecha_creacion || '')}" data-fecha-formato="larga">${fecha}</p>
                    </div>
                </div>
                <p class="extracto lumina-post-excerpt">${extracto}</p>
                <span class="lumina-post-materia">${materia}</span>
                <div class="footer-card lumina-post-footer">
                    ${cta}
                    <button class="lumina-like-button" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')" aria-label="Me gusta">
                        <span class="material-symbols-outlined">favorite</span>
                        <span data-like-count-for="${id}">${likes}</span>
                    </button>
                </div>
                <div class="lumina-post-completo" hidden>
                    <span class="lumina-modal-badge" data-i18n="tipo.${tipoRaw}">${tipo}</span>
                    <div class="lumina-modal-titulo-row">
                        <h2 class="lumina-modal-title">${titulo}</h2>
                        <div class="lumina-modal-acciones">
                            <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')" aria-label="Guardar">
                                <span class="material-symbols-outlined">bookmark</span>
                            </button>
                            <button class="lumina-like-button" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')" aria-label="Me gusta">
                                <span class="material-symbols-outlined">favorite</span>
                                <span data-like-count-for="${id}">${likes}</span>
                            </button>
                        </div>
                    </div>
                    <p class="lumina-modal-author">Por ${autor}</p>
                    <div class="lumina-modal-media">${media}</div>
                    <p class="lumina-modal-description">${descCompleta}</p>
                    <span class="lumina-modal-materia">${materia}</span>
                </div>
            </div>
        </article>
    `;
}


// ============================================
// CARGAR PUBLICACIONES
// ============================================

async function cargarPublicaciones() {
    const contenedor = document.getElementById('contenedorPosts');

    try {
        const respuesta = await fetch(`../backend/obtener_publicaciones.php?categoria_id=${materiaActual.id}`);
        const posts = await respuesta.json();

        const publicaciones = Array.isArray(posts)
            ? posts.filter((p) => p.status === 'publicado')
            : [];

        if (publicaciones.length === 0) {
            contenedor.innerHTML = '<div class="materia-vacio">' + (typeof t === 'function' ? t('materia.sin_publicaciones') : 'No hay publicaciones aún') + '</div>';
            return;
        }

        contenedor.innerHTML = publicaciones.map(renderPostMateria).join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedor);
        }
        if (typeof activarModalesLumina === 'function') {
            activarModalesLumina(contenedor);
        }
        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(contenedor);
        }
    } catch (error) {
        console.error("Error cargando publicaciones:", error);
        contenedor.innerHTML = '<div class="materia-vacio">' + (typeof t === 'function' ? t('materia.no_se_cargaron') : 'No se pudieron cargar las publicaciones.') + '</div>';
    }
}


// ============================================
// FILTROS
// ============================================

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("filter-btn")) return;

    document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
    e.target.classList.add("active");

    const filter = e.target.dataset.filter;
    document.querySelectorAll(".lumina-post-card").forEach((card) => {
        card.style.display = (filter === "all" || card.dataset.type === filter) ? "" : "none";
    });
});


// ============================================
// INICIAR
// ============================================

document.addEventListener("DOMContentLoaded", () => {
    aplicarNombreMateriaActual();
    cargarPublicaciones();
});

document.addEventListener('lumina-idioma-cambiado', () => {
    aplicarNombreMateriaActual();
    cargarPublicaciones();
});

</script>

<script src="js/i18n.js?v=10"></script>
    <script src="js/auth.js?v=10"></script>
<script src="js/menu_ui.js?v=5"></script>
<script src="js/reacciones.js?v=4"></script>
<script src="js/lumina_modal_post.js?v=4"></script>
<script src="js/comentarios_materia.js?v=4"></script>

</body>
</html>
