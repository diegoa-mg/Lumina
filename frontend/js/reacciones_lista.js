function escapeHtmlLista(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function resolveImageLista(ruta) {
    if (!ruta) return 'img/clases/clase2.webp';
    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('../')) return ruta;
    return ruta;
}

function formatearFechaLista(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function recorteLista(texto, limite = 120) {
    const limpio = String(texto ?? '');
    return limpio.length > limite ? `${limpio.substring(0, limite)}...` : limpio;
}

function etiquetaPublicacionLista(post) {
    if ((post.seccion || 'post') === 'aviso') {
        return post.tipo_aviso === 'plataforma' ? 'Plataforma' : 'Academico';
    }

    const etiquetas = {
        articulo: 'Artículo',
        video: 'Video',
        recurso: 'Recurso'
    };

    return etiquetas[String(post.tipo || '').toLowerCase()] || 'Publicación';
}

function obtenerNombreArchivoLista(ruta) {
    if (!ruta) return '';
    const nombre = decodeURIComponent(String(ruta).split('/').pop() || '');
    return nombre.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function obtenerYoutubeEmbedLista(url) {
    if (!url) return '';
    const match = String(url).match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function obtenerInicialesLista(nombre) {
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

function renderAvatarAutorLista(fotoUrl, nombre) {
    if (fotoUrl) {
        return `<img src="${escapeHtmlLista(fotoUrl)}" alt="${escapeHtmlLista(nombre)}">`;
    }

    return `<span class="autor-avatar-iniciales">${escapeHtmlLista(obtenerInicialesLista(nombre))}</span>`;
}

function renderPublicacionReaccionada(post) {
    const id = Number(post.id || 0);
    const titulo = escapeHtmlLista(post.titulo || 'Publicación sin título');
    const imagen = escapeHtmlLista(resolveImageLista(post.imagen_url));
    const autorNombre = post.autor || 'Autor desconocido';
    const autor = escapeHtmlLista(autorNombre);
    const autorFoto = post.autor_foto || '';
    const fecha = escapeHtmlLista(formatearFechaLista(post.fecha_creacion));
    const esAviso = (post.seccion || 'post') === 'aviso';
    const tipoRaw = esAviso ? 'aviso' : String(post.tipo || 'articulo').toLowerCase();
    const tipoTexto = escapeHtmlLista(etiquetaPublicacionLista(post));
    const materiaTexto = typeof traducirMateriaLumina === 'function'
        ? traducirMateriaLumina(post.materia || '', post.categoria_id)
        : (post.materia || '');
    const materia = escapeHtmlLista(materiaTexto);
    const extracto = escapeHtmlLista(recorteLista(post.descripcion));
    const descCompleta = escapeHtmlLista(post.descripcion || '');
    const likes = Number(post.likes_count || 0);
    const archivoUrl = post.archivo_url || post.noticia_url || '';
    const videoUrl = post.video_url || '';
    const youtubeUrl = post.youtube_url || '';
    const youtubeEmbed = obtenerYoutubeEmbedLista(youtubeUrl);

    const media = tipoRaw === 'recurso' && archivoUrl
        ? `<div class="lumina-resource-media">
                <span class="material-symbols-outlined">description</span>
                <span>${escapeHtmlLista(obtenerNombreArchivoLista(archivoUrl) || 'Recurso adjunto')}</span>
            </div>`
        : tipoRaw === 'video' && videoUrl
            ? `<video src="${escapeHtmlLista(videoUrl)}" controls muted playsinline preload="metadata"></video>`
        : tipoRaw === 'video' && youtubeEmbed
            ? `<iframe src="${escapeHtmlLista(youtubeEmbed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${imagen}" alt="${titulo}">`;

    const cta = tipoRaw === 'recurso' && archivoUrl
        ? `<a class="lumina-post-cta" href="${escapeHtmlLista(archivoUrl)}" target="_blank" download="${escapeHtmlLista(obtenerNombreArchivoLista(archivoUrl) || 'recurso')}" data-i18n="comun.descargar">Descargar</a>`
        : `<button class="lumina-post-cta" type="button" data-i18n="comun.leer_mas">Leer más</button>`;

    return `
        <article class="lumina-post-card card-reciente" data-type="${tipoRaw}">
            <div class="lumina-post-media">${media}</div>
            <div class="card-content lumina-post-body">
                <div class="meta-info lumina-post-topline">
                    <span class="lumina-post-badge">${tipoTexto}</span>
                    <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4 class="lumina-post-title">${titulo}</h4>
                <div class="autor-info lumina-post-author-row">
                    ${renderAvatarAutorLista(autorFoto, autorNombre)}
                    <div>
                        <p class="nombre-autor lumina-post-author-name">${autor}</p>
                        <p class="fecha-autor lumina-post-date" data-fecha-iso="${escapeHtmlLista(post.fecha_creacion || '')}" data-fecha-formato="larga">${fecha}</p>
                    </div>
                </div>
                <p class="extracto lumina-post-excerpt">${extracto}</p>
                ${materia ? `<span class="lumina-post-materia">${materia}</span>` : ''}
                <div class="footer-card lumina-post-footer">
                    ${cta}
                    <button class="lumina-like-button" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')" aria-label="Me gusta">
                        <span class="material-symbols-outlined">favorite</span>
                        <span data-like-count-for="${id}">${likes}</span>
                    </button>
                </div>
                <div class="lumina-post-completo" hidden>
                    <span class="lumina-modal-badge">${tipoTexto}</span>
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
                    ${materia ? `<span class="lumina-modal-materia">${materia}</span>` : ''}
                </div>
            </div>
        </article>
    `;
}

async function cargarListaReacciones() {
    const contenedor = document.querySelector('.contenedor-principal-likes');
    if (!contenedor) return;

    const tipo = contenedor.dataset.tipoReaccion || 'like';
    contenedor.innerHTML = `<div class="seccion-vacia" data-i18n="lista.cargando">${typeof t === 'function' ? t('lista.cargando') : 'Cargando publicaciones...'}</div>`;

    try {
        const respuesta = await fetch(`../backend/obtener_publicaciones_reaccionadas.php?tipo=${encodeURIComponent(tipo)}`, {
            credentials: 'include'
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.error || 'No se pudieron cargar las publicaciones');
        }

        const publicaciones = Array.isArray(resultado.publicaciones)
            ? resultado.publicaciones
            : [];

        if (publicaciones.length === 0) {
            const claveVacio = tipo === 'guardado' ? 'saved.vacio' : 'likes.vacio';
            const fallbackVacio = tipo === 'guardado'
                ? 'No tienes publicaciones guardadas.'
                : 'No tienes publicaciones con me gusta.';
            contenedor.innerHTML = `
                <div class="seccion-vacia" data-i18n="${claveVacio}">
                    ${typeof t === 'function' ? t(claveVacio, fallbackVacio) : fallbackVacio}
                </div>
            `;
            return;
        }

        contenedor.innerHTML = publicaciones
            .map(renderPublicacionReaccionada)
            .join('');

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
        console.error(error);
        contenedor.innerHTML = `<div class="seccion-vacia" data-i18n="materia.no_se_cargaron">${typeof t === 'function' ? t('materia.no_se_cargaron') : 'No se pudieron cargar las publicaciones.'}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', cargarListaReacciones);
document.addEventListener('lumina-idioma-cambiado', cargarListaReacciones);
