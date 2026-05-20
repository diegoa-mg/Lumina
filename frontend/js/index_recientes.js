// Publicaciones recientes del inicio: muestra los últimos posts publicados.

function escapeHtmlRecientes(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatearFechaRecientes(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function recorteRecientes(texto, limite = 120) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function obtenerNombreArchivoRecientes(ruta) {
    if (!ruta) return '';

    const nombreArchivo = decodeURIComponent(String(ruta).split('/').pop() || '');

    return nombreArchivo.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function obtenerYoutubeEmbedUrlRecientes(url) {
    if (!url) return '';

    const match = String(url).match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function etiquetaTipoRecientes(tipo) {
    const tipoNormalizado = String(tipo || '').toLowerCase();
    return typeof t === 'function'
        ? t(`tipo.${tipoNormalizado}`, t('tipo.publicacion', 'Publicación'))
        : ({ articulo: 'Artículo', video: 'Video', recurso: 'Recurso' }[tipoNormalizado] || 'Publicación');
}

function obtenerInicialesRecientes(nombre) {
    const partes = String(nombre || 'Usuario')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) return 'U';

    return partes
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join('');
}

function renderAvatarAutorRecientes(fotoUrl, nombre) {
    if (fotoUrl) {
        return `<img src="${escapeHtmlRecientes(fotoUrl)}" alt="${escapeHtmlRecientes(nombre)}">`;
    }

    return `<span class="autor-avatar-iniciales">${escapeHtmlRecientes(obtenerInicialesRecientes(nombre))}</span>`;
}

function renderCardReciente(post) {
    const id = Number(post.id || 0);
    const titulo = escapeHtmlRecientes(post.titulo || (typeof t === 'function' ? t('meta.publicacion_sin_titulo') : 'Publicación sin título'));
    const imagen = escapeHtmlRecientes(post.imagen_url || 'img/clases/clase2.webp');
    const autorNombre = post.autor || (typeof t === 'function' ? t('meta.autor_desconocido') : 'Autor desconocido');
    const autor = escapeHtmlRecientes(autorNombre);
    const autorFoto = post.autor_foto || '';
    const fecha = escapeHtmlRecientes(formatearFechaRecientes(post.fecha_creacion));
    const tipo = escapeHtmlRecientes(etiquetaTipoRecientes(post.tipo));
    const materiaTexto = typeof traducirMateriaLumina === 'function'
        ? traducirMateriaLumina(post.materia || '', post.categoria_id)
        : (post.materia || (typeof t === 'function' ? t('meta.materia_sin_asignar') : 'Materia sin asignar'));
    const materia = escapeHtmlRecientes(materiaTexto || (typeof t === 'function' ? t('meta.materia_sin_asignar') : 'Materia sin asignar'));
    const extracto = escapeHtmlRecientes(recorteRecientes(post.descripcion));
    const likes = Number(post.likes_count || 0);
    const archivoUrl = post.archivo_url || post.noticia_url || '';
    const tipoRaw = String(post.tipo || '').toLowerCase();
    const videoUrl = post.video_url || '';
    const youtubeUrl = post.youtube_url || '';
    const youtubeEmbed = obtenerYoutubeEmbedUrlRecientes(youtubeUrl);
    const media = tipoRaw === 'recurso' && archivoUrl
        ? `<div class="lumina-resource-media">
                <span class="material-symbols-outlined">description</span>
                <span>${escapeHtmlRecientes(obtenerNombreArchivoRecientes(archivoUrl) || (typeof t === 'function' ? t('meta.recurso_adjunto') : 'Recurso adjunto'))}</span>
            </div>`
        : tipoRaw === 'video' && videoUrl
            ? `<video src="${escapeHtmlRecientes(videoUrl)}" controls muted playsinline preload="metadata"></video>`
        : tipoRaw === 'video' && youtubeEmbed
            ? `<iframe src="${escapeHtmlRecientes(youtubeEmbed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${imagen}" alt="${titulo}">`;
    const cta = tipoRaw === 'recurso' && archivoUrl
        ? `<a class="lumina-post-cta" href="${escapeHtmlRecientes(archivoUrl)}" target="_blank" download="${escapeHtmlRecientes(obtenerNombreArchivoRecientes(archivoUrl) || 'recurso')}" data-i18n="comun.descargar">Descargar</a>`
        : `<button class="lumina-post-cta" type="button" data-i18n="comun.leer_mas">Leer más</button>`;

    return `
        <article class="card-reciente lumina-post-card">
            <div class="lumina-post-media">
                ${media}
            </div>
            <div class="card-content lumina-post-body">
                <div class="lumina-post-topline">
                    <span class="lumina-post-badge" data-i18n="tipo.${tipoRaw}">${tipo}</span>
                    <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')" aria-label="${escapeHtmlRecientes(typeof t === 'function' ? t('comun.guardar') : 'Guardar')}">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4 class="lumina-post-title">${titulo}</h4>
                <div class="autor-info lumina-post-author-row">
                    ${renderAvatarAutorRecientes(autorFoto, autorNombre)}
                    <div>
                        <p class="nombre-autor lumina-post-author-name">${autor}</p>
                        <p class="fecha-autor lumina-post-date" data-fecha-iso="${escapeHtmlRecientes(post.fecha_creacion || '')}" data-fecha-formato="larga">${fecha}</p>
                    </div>
                </div>
                <p class="extracto lumina-post-excerpt">${extracto}</p>
                <span class="lumina-post-materia">${materia}</span>
                <div class="footer-card lumina-post-footer">
                    ${cta}
                    <button class="lumina-like-button" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')" aria-label="${escapeHtmlRecientes(typeof t === 'function' ? t('comun.me_gusta') : 'Me gusta')}">
                        <span class="material-symbols-outlined">favorite</span>
                        <span data-like-count-for="${id}">${likes}</span>
                    </button>
                </div>
                <div class="lumina-post-completo" hidden>
                    <span class="lumina-modal-badge" data-i18n="tipo.${tipoRaw}">${tipo}</span>
                    <div class="lumina-modal-titulo-row">
                        <h2 class="lumina-modal-title">${titulo}</h2>
                        <div class="lumina-modal-acciones">
                            <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')" aria-label="${escapeHtmlRecientes(typeof t === 'function' ? t('comun.guardar') : 'Guardar')}">
                                <span class="material-symbols-outlined">bookmark</span>
                            </button>
                            <button class="lumina-like-button" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')" aria-label="${escapeHtmlRecientes(typeof t === 'function' ? t('comun.me_gusta') : 'Me gusta')}">
                                <span class="material-symbols-outlined">favorite</span>
                                <span data-like-count-for="${id}">${likes}</span>
                            </button>
                        </div>
                    </div>
                    <p class="lumina-modal-author">${escapeHtmlRecientes(typeof t === 'function' ? t('comun.por') : 'Por')} ${autor}</p>
                    <div class="lumina-modal-media">${media}</div>
                    <p class="lumina-modal-description">${escapeHtmlRecientes(post.descripcion || '')}</p>
                    <span class="lumina-modal-materia">${materia}</span>
                </div>
            </div>
        </article>
    `;
}

async function cargarPostsRecientesIndex() {
    const contenedor = document.getElementById('postsRecientesIndex');
    if (!contenedor) return;

    // Sin sesión la sección está oculta; evitamos la petición innecesaria.
    if (document.documentElement.classList.contains('sin-sesion')) return;

    try {
        const respuesta = await fetch('../backend/obtener_publicaciones.php?seccion=post');
        const posts = await respuesta.json();

        const recientes = Array.isArray(posts)
            ? posts.filter((post) => (post.seccion || 'post') === 'post').slice(0, 3)
            : [];

        if (recientes.length === 0) {
            contenedor.innerHTML = `<p style="color:#6b7280;" data-i18n="inicio.sin_recientes">${typeof t === 'function' ? t('inicio.sin_recientes') : 'Aún no hay publicaciones recientes.'}</p>`;
            return;
        }

        contenedor.innerHTML = recientes.map(renderCardReciente).join('');

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
        console.error('Error cargando publicaciones recientes:', error);
        contenedor.innerHTML = `<p style="color:#6b7280;" data-i18n="inicio.no_recientes">${typeof t === 'function' ? t('inicio.no_recientes') : 'No se pudieron cargar las publicaciones.'}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarPostsRecientesIndex);
document.addEventListener('lumina-idioma-cambiado', cargarPostsRecientesIndex);
