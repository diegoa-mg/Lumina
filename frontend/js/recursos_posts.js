const RECURSOS_PREF_KEY = 'lumina_preferencias_contenido';
const RECURSOS_PREF_DEFAULTS = {
    materias: {
        1: true,
        2: true,
        3: true,
        4: true,
        5: true,
        6: true,
        7: true,
        8: true
    },
    tipos: {
        articulo: true,
        video: true,
        recurso: true
    }
};

function escapeHtmlRecursos(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatearFechaRecursos(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function descripcionCortaRecursos(texto, limite = 125) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function obtenerNombreArchivoRecursos(ruta) {
    if (!ruta) return '';

    const nombreArchivo = decodeURIComponent(String(ruta).split('/').pop() || '');

    return nombreArchivo.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function obtenerYoutubeEmbedUrlRecursos(url) {
    if (!url) return '';

    const match = String(url).match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function etiquetaTipoRecurso(tipo) {
    const tipoNormalizado = String(tipo || '').toLowerCase();
    return typeof t === 'function'
        ? t(`tipo.${tipoNormalizado}`, t('tipo.publicacion', 'Publicación'))
        : ({ articulo: 'Artículo', video: 'Video', recurso: 'Recurso' }[tipoNormalizado] || String(tipo || ''));
}

function obtenerInicialesRecursos(nombre) {
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

function renderAvatarAutorRecursos(fotoUrl, nombre) {
    if (fotoUrl) {
        return `<img src="${escapeHtmlRecursos(fotoUrl)}" alt="${escapeHtmlRecursos(nombre)}">`;
    }

    return `<span class="autor-avatar-iniciales">${escapeHtmlRecursos(obtenerInicialesRecursos(nombre))}</span>`;
}

function cargarPreferenciasRecursos() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(RECURSOS_PREF_KEY) || '{}');

        return {
            materias: {
                ...RECURSOS_PREF_DEFAULTS.materias,
                ...(guardadas.materias || {})
            },
            tipos: {
                ...RECURSOS_PREF_DEFAULTS.tipos,
                ...(guardadas.tipos || {})
            }
        };
    } catch (error) {
        return JSON.parse(JSON.stringify(RECURSOS_PREF_DEFAULTS));
    }
}

function filtrarPostsRecursos(posts) {
    const preferencias = cargarPreferenciasRecursos();

    return posts.filter((post) => {
        if ((post.seccion || 'post') !== 'post') {
            return false;
        }

        const materiaId = String(post.categoria_id || '1');
        const tipo = post.tipo || 'articulo';

        return preferencias.materias[materiaId] !== false
            && preferencias.tipos[tipo] !== false;
    });
}

function normalizarPostRecurso(post) {
    return {
        id: Number(post.id || 0),
        titulo: post.titulo || (typeof t === 'function' ? t('meta.publicacion_sin_titulo') : 'Publicación sin título'),
        descripcion: post.descripcion || '',
        imagen: post.imagen_url || 'img/clases/clase2.webp',
        tipo: post.tipo || 'articulo',
        seccion: post.seccion || 'post',
        importante: Number(post.importante || 0) === 1,
        materia: typeof traducirMateriaLumina === 'function'
            ? (traducirMateriaLumina(post.materia || '', post.categoria_id) || (typeof t === 'function' ? t('meta.materia_sin_asignar') : 'Materia sin asignar'))
            : (post.materia || (typeof t === 'function' ? t('meta.materia_sin_asignar') : 'Materia sin asignar')),
        fecha: formatearFechaRecursos(post.fecha_creacion),
        autor: post.autor || (typeof t === 'function' ? t('meta.autor_desconocido') : 'Autor desconocido'),
        autorFoto: post.autor_foto || ''
    };
}

function renderPostRecienteRecurso(postOriginal) {
    const post = normalizarPostRecurso(postOriginal);
    const etiquetaTipo = `<span>${escapeHtmlRecursos(etiquetaTipoRecurso(post.tipo))}</span>`;
    const likes = Number(postOriginal.likes_count || 0);
    const archivoUrl = postOriginal.archivo_url || postOriginal.noticia_url || '';
    const tipoRaw = String(post.tipo || '').toLowerCase();
    const videoUrl = postOriginal.video_url || '';
    const youtubeUrl = postOriginal.youtube_url || '';
    const youtubeEmbed = obtenerYoutubeEmbedUrlRecursos(youtubeUrl);
    const media = tipoRaw === 'recurso' && archivoUrl
        ? `<div class="lumina-resource-media">
                <span class="material-symbols-outlined">description</span>
                <span>${escapeHtmlRecursos(obtenerNombreArchivoRecursos(archivoUrl) || (typeof t === 'function' ? t('meta.recurso_adjunto') : 'Recurso adjunto'))}</span>
            </div>`
        : tipoRaw === 'video' && videoUrl
            ? `<video src="${escapeHtmlRecursos(videoUrl)}" controls muted playsinline preload="metadata"></video>`
        : tipoRaw === 'video' && youtubeEmbed
            ? `<iframe src="${escapeHtmlRecursos(youtubeEmbed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${escapeHtmlRecursos(post.imagen)}" alt="${escapeHtmlRecursos(post.titulo)}">`;
    const cta = tipoRaw === 'recurso' && archivoUrl
        ? `<a class="lumina-post-cta" href="${escapeHtmlRecursos(archivoUrl)}" target="_blank" download="${escapeHtmlRecursos(obtenerNombreArchivoRecursos(archivoUrl) || 'recurso')}" data-i18n="comun.descargar">Descargar</a>`
        : `<button class="lumina-post-cta" type="button" data-i18n="comun.leer_mas">Leer más</button>`;
    const footerReacciones = `
            <div class="footer-card lumina-post-footer">
                ${cta}
                <button class="lumina-like-button" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${post.id}, 'recursos', 'like')" aria-label="${escapeHtmlRecursos(typeof t === 'function' ? t('comun.me_gusta') : 'Me gusta')}">
                    <span class="material-symbols-outlined">favorite</span>
                    <span data-like-count-for="${post.id}">${likes}</span>
                </button>
            </div>
    `;

    return `
        <article class="card-reciente reciente-slide lumina-post-card">
            <div class="lumina-post-media">
                ${media}
            </div>
            <div class="card-content lumina-post-body">
                <div class="meta-info lumina-post-topline">
                    <span class="lumina-post-badge" data-i18n="tipo.${tipoRaw}">${escapeHtmlRecursos(etiquetaTipoRecurso(post.tipo))}</span>
                    <button class="btn-icon" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${post.id}, 'recursos', 'guardado')" aria-label="${escapeHtmlRecursos(typeof t === 'function' ? t('comun.guardar') : 'Guardar')}">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4 class="lumina-post-title">${escapeHtmlRecursos(post.titulo)}</h4>
                <div class="autor-info lumina-post-author-row">
                    ${renderAvatarAutorRecursos(post.autorFoto, post.autor)}
                    <div>
                        <p class="nombre-autor lumina-post-author-name">${escapeHtmlRecursos(post.autor)}</p>
                        <p class="fecha-autor lumina-post-date" data-fecha-iso="${escapeHtmlRecursos(postOriginal.fecha_creacion || '')}" data-fecha-formato="larga">${escapeHtmlRecursos(post.fecha)}</p>
                    </div>
                </div>
                <p class="extracto lumina-post-excerpt">${escapeHtmlRecursos(descripcionCortaRecursos(post.descripcion))}</p>
                <span class="lumina-post-materia">${escapeHtmlRecursos(post.materia)}</span>
                ${footerReacciones}
                <div class="lumina-post-completo" hidden>
                    <span class="lumina-modal-badge" data-i18n="tipo.${tipoRaw}">${escapeHtmlRecursos(etiquetaTipoRecurso(post.tipo))}</span>
                    <div class="lumina-modal-titulo-row">
                        <h2 class="lumina-modal-title">${escapeHtmlRecursos(post.titulo)}</h2>
                        <div class="lumina-modal-acciones">
                            <button class="btn-icon" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${post.id}, 'recursos', 'guardado')" aria-label="${escapeHtmlRecursos(typeof t === 'function' ? t('comun.guardar') : 'Guardar')}">
                                <span class="material-symbols-outlined">bookmark</span>
                            </button>
                            <button class="lumina-like-button" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${post.id}, 'recursos', 'like')" aria-label="${escapeHtmlRecursos(typeof t === 'function' ? t('comun.me_gusta') : 'Me gusta')}">
                                <span class="material-symbols-outlined">favorite</span>
                                <span data-like-count-for="${post.id}">${likes}</span>
                            </button>
                        </div>
                    </div>
                    <p class="lumina-modal-author">${escapeHtmlRecursos(typeof t === 'function' ? t('comun.por') : 'Por')} ${escapeHtmlRecursos(post.autor)}</p>
                    <div class="lumina-modal-media">${media}</div>
                    <p class="lumina-modal-description">${escapeHtmlRecursos(postOriginal.descripcion || '')}</p>
                    <span class="lumina-modal-materia">${escapeHtmlRecursos(post.materia)}</span>
                </div>
            </div>
        </article>
    `;
}

function actualizarFlechasRecursosCarousel() {
    const viewport = document.getElementById('postsRecientesViewport');
    const prev = document.getElementById('recursosPrev');
    const next = document.getElementById('recursosNext');

    if (!viewport || !prev || !next) return;

    const maxScroll = Math.max(viewport.scrollWidth - viewport.clientWidth, 0);
    const enInicio = viewport.scrollLeft <= 4;
    const enFinal = viewport.scrollLeft >= maxScroll - 4;

    prev.classList.toggle('hidden', enInicio || maxScroll === 0);
    next.classList.toggle('hidden', enFinal || maxScroll === 0);
}

function moveRecursosCarousel(direction) {
    const viewport = document.getElementById('postsRecientesViewport');
    if (!viewport) return;

    const distancia = Math.min(680, viewport.clientWidth * 0.85);

    viewport.scrollBy({
        left: direction * distancia,
        behavior: 'smooth'
    });

    window.setTimeout(actualizarFlechasRecursosCarousel, 350);
}

async function cargarPostsEnRecursos() {
    const contenedorRecientes = document.getElementById('postsRecientes');
    const viewportRecientes = document.getElementById('postsRecientesViewport');

    if (!contenedorRecientes) return;

    contenedorRecientes.innerHTML = '';

    try {
        const respuesta = await fetch('../backend/obtener_publicaciones.php');
        const posts = await respuesta.json();

        if (!Array.isArray(posts) || posts.length === 0) {
            contenedorRecientes.innerHTML = `
                <div style="color: #6b7280;" data-i18n="recursos.sin_recientes">${typeof t === 'function' ? t('recursos.sin_recientes') : 'No hay publicaciones recientes.'}</div>
            `;
            if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedorRecientes);
            if (viewportRecientes) {
                requestAnimationFrame(actualizarFlechasRecursosCarousel);
            }
            return;
        }

        const postsFiltrados = filtrarPostsRecursos(posts);

        if (postsFiltrados.length === 0) {
            contenedorRecientes.innerHTML = `
                <div style="color: #6b7280;" data-i18n="recursos.sin_preferencias">${typeof t === 'function' ? t('recursos.sin_preferencias') : 'No hay publicaciones con tus preferencias activas.'}</div>
            `;
            if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedorRecientes);
            if (viewportRecientes) {
                requestAnimationFrame(actualizarFlechasRecursosCarousel);
            }
            return;
        }

        contenedorRecientes.innerHTML = postsFiltrados
            .map(renderPostRecienteRecurso)
            .join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedorRecientes);
        }

        if (typeof activarModalesLumina === 'function') {
            activarModalesLumina(contenedorRecientes);
        }
        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(contenedorRecientes);
        }

        if (viewportRecientes) {
            viewportRecientes.scrollLeft = 0;
        }

        if (viewportRecientes) {
            requestAnimationFrame(actualizarFlechasRecursosCarousel);
        }
    } catch (error) {
        console.error('Error cargando publicaciones en recursos:', error);
        contenedorRecientes.innerHTML = `
            <div style="color: #6b7280;" data-i18n="materia.no_se_cargaron">${typeof t === 'function' ? t('materia.no_se_cargaron') : 'No se pudieron cargar las publicaciones.'}</div>
        `;
        if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedorRecientes);
        if (viewportRecientes) {
            requestAnimationFrame(actualizarFlechasRecursosCarousel);
        }
    }
}

document.addEventListener('DOMContentLoaded', cargarPostsEnRecursos);
document.addEventListener('lumina-idioma-cambiado', cargarPostsEnRecursos);
document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('postsRecientesViewport');

    if (viewport) {
        viewport.addEventListener('scroll', actualizarFlechasRecursosCarousel, { passive: true });
    }

    window.addEventListener('resize', actualizarFlechasRecursosCarousel);
    actualizarFlechasRecursosCarousel();
});
