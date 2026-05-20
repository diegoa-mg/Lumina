const INDEX_PREF_KEY = 'lumina_preferencias_contenido';
const INDEX_PREF_DEFAULTS = {
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

let postsImportantesIndex = [];
let postImportanteActualIndex = 0;

function escapeHtmlIndex(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatearFechaIndex(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' });
}

function descripcionCortaIndex(texto, limite = 220) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function obtenerNombreArchivoIndex(ruta) {
    if (!ruta) return '';

    const nombreArchivo = decodeURIComponent(String(ruta).split('/').pop() || '');

    return nombreArchivo.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function obtenerYoutubeEmbedUrlIndex(url) {
    if (!url) return '';

    const match = String(url).match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : '';
}

function etiquetaTipoIndex(tipo) {
    const etiquetas = {
        articulo: 'Artículo',
        video: 'Video',
        recurso: 'Recurso'
    };

    return etiquetas[String(tipo || '').toLowerCase()] || String(tipo || '');
}

function obtenerInicialesIndex(nombre) {
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

function renderAvatarAutorIndex(fotoUrl, nombre) {
    if (fotoUrl) {
        return `<img src="${escapeHtmlIndex(fotoUrl)}" alt="${escapeHtmlIndex(nombre)}">`;
    }

    return `<span class="autor-avatar-iniciales">${escapeHtmlIndex(obtenerInicialesIndex(nombre))}</span>`;
}

function cargarPreferenciasIndex() {
    try {
        const guardadas = JSON.parse(localStorage.getItem(INDEX_PREF_KEY) || '{}');

        return {
            materias: {
                ...INDEX_PREF_DEFAULTS.materias,
                ...(guardadas.materias || {})
            },
            tipos: {
                ...INDEX_PREF_DEFAULTS.tipos,
                ...(guardadas.tipos || {})
            }
        };
    } catch (error) {
        return JSON.parse(JSON.stringify(INDEX_PREF_DEFAULTS));
    }
}

function filtrarPostsIndex(posts) {
    const preferencias = cargarPreferenciasIndex();

    return posts.filter((post) => {
        const materiaId = String(post.categoria_id || '1');
        const tipo = post.tipo || 'articulo';

        return preferencias.materias[materiaId] !== false
            && preferencias.tipos[tipo] !== false;
    });
}

function normalizarPostIndex(post) {
    return {
        id: Number(post.id || 0),
        titulo: post.titulo || 'Publicacion sin titulo',
        descripcion: post.descripcion || '',
        imagen: post.imagen_url || 'img/clases/clase2.webp',
        tipo: post.tipo || 'articulo',
        seccion: post.seccion || 'post',
        materia: typeof traducirMateriaLumina === 'function'
            ? (traducirMateriaLumina(post.materia || '', post.categoria_id) || (typeof t === 'function' ? t('meta.materia_sin_asignar') : 'Materia sin asignar'))
            : (post.materia || 'Materia sin asignar'),
        fecha: formatearFechaIndex(post.fecha_creacion),
        fechaIso: post.fecha_creacion || '',
        autor: post.autor || 'Autor desconocido',
        autorFoto: post.autor_foto || '',
        archivoUrl: post.archivo_url || post.noticia_url || '',
        videoUrl: post.video_url || '',
        youtubeUrl: post.youtube_url || '',
        likes: Number(post.likes_count || 0)
    };
}

function renderPostImportanteIndex(postOriginal) {
    const post = normalizarPostIndex(postOriginal);
    const etiquetaTipo = post.seccion === 'aviso'
        ? '<span></span>'
        : `<span>${escapeHtmlIndex(etiquetaTipoIndex(post.tipo))}</span>`;
    const materia = post.seccion === 'aviso'
        ? ''
        : `<span class="lumina-post-materia">${escapeHtmlIndex(post.materia)}</span>`;
    const youtubeEmbed = obtenerYoutubeEmbedUrlIndex(post.youtubeUrl);
    const media = post.tipo === 'recurso' && post.archivoUrl
        ? `<div class="lumina-resource-media">
                <span class="material-symbols-outlined">description</span>
                <span>${escapeHtmlIndex(obtenerNombreArchivoIndex(post.archivoUrl) || 'Recurso adjunto')}</span>
            </div>`
        : post.tipo === 'video' && post.videoUrl
            ? `<video src="${escapeHtmlIndex(post.videoUrl)}" controls muted playsinline preload="metadata"></video>`
        : post.tipo === 'video' && youtubeEmbed
            ? `<iframe src="${escapeHtmlIndex(youtubeEmbed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`
        : `<img src="${escapeHtmlIndex(post.imagen)}" alt="${escapeHtmlIndex(post.titulo)}">`;
    return `
        <div class="img-container-big lumina-post-media">
            ${media}
        </div>
        <div class="info-container-big">
            <div>
                <div class="meta-info">
                    ${etiquetaTipo}
                </div>
                <h3 style="font-size: 2.2rem; margin-bottom: 15px;">${escapeHtmlIndex(post.titulo)}</h3>
                <div class="autor-info">
                    ${renderAvatarAutorIndex(post.autorFoto, post.autor)}
                    <div>
                        <p style="font-weight: bold; margin: 0;">${escapeHtmlIndex(post.autor)}</p>
                        <p style="color: #6b7280; font-size: 1.1rem; margin: 0;" data-fecha-iso="${escapeHtmlIndex(post.fechaIso)}" data-fecha-formato="larga">${escapeHtmlIndex(post.fecha)}</p>
                    </div>
                </div>
                <p style="line-height: 1.6; color: #4b5563;">${escapeHtmlIndex(descripcionCortaIndex(post.descripcion))}</p>
                ${materia}
            </div>
        </div>
    `;
}

async function cargarImportanteIndex() {
    const contenedor = document.getElementById('postImportanteIndex');
    if (!contenedor) return;

    try {
        const respuesta = await fetch('../backend/obtener_publicaciones.php?seccion=aviso&importante=1');
        const posts = await respuesta.json();
        const postsFiltrados = Array.isArray(posts)
            ? filtrarPostsIndex(posts).filter((post) => {
                return (post.seccion || 'post') === 'aviso'
                    && Number(post.importante || 0) === 1;
            })
            : [];

        if (postsFiltrados.length === 0) {
            postsImportantesIndex = [];
            postImportanteActualIndex = 0;
            contenedor.innerHTML = `
                <div class="info-container-big" style="width: 100%;">
                    <h3 data-i18n="inicio.sin_importantes">${typeof t === 'function' ? t('inicio.sin_importantes') : 'No hay publicaciones importantes'}</h3>
                </div>
            `;
            if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);
            actualizarBotonesImportanteIndex();
            return;
        }

        postsImportantesIndex = postsFiltrados;
        postImportanteActualIndex = 0;
        renderImportanteActualIndex();
    } catch (error) {
        console.error('Error cargando publicacion importante:', error);
        postsImportantesIndex = [];
        postImportanteActualIndex = 0;
        contenedor.innerHTML = `
            <div class="info-container-big" style="width: 100%;">
                <h3 data-i18n="inicio.no_importantes">${typeof t === 'function' ? t('inicio.no_importantes') : 'No se pudo cargar la publicación importante'}</h3>
            </div>
        `;
        if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);
        actualizarBotonesImportanteIndex();
    }
}

function renderImportanteActualIndex() {
    const contenedor = document.getElementById('postImportanteIndex');
    if (!contenedor || postsImportantesIndex.length === 0) return;

    contenedor.innerHTML = renderPostImportanteIndex(
        postsImportantesIndex[postImportanteActualIndex]
    );
    if (typeof inicializarReacciones === 'function') {
        inicializarReacciones(contenedor);
    }
    actualizarBotonesImportanteIndex();
}

function actualizarBotonesImportanteIndex() {
    const prev = document.getElementById('importantePrev');
    const next = document.getElementById('importanteNext');
    const ocultar = postsImportantesIndex.length <= 1;

    if (prev) prev.classList.toggle('hidden', ocultar);
    if (next) next.classList.toggle('hidden', ocultar);
}

function moveImportanteIndex(direction) {
    if (postsImportantesIndex.length <= 1) return;

    postImportanteActualIndex += direction;

    if (postImportanteActualIndex < 0) {
        postImportanteActualIndex = postsImportantesIndex.length - 1;
    }

    if (postImportanteActualIndex >= postsImportantesIndex.length) {
        postImportanteActualIndex = 0;
    }

    renderImportanteActualIndex();
}

document.addEventListener('DOMContentLoaded', cargarImportanteIndex);
document.addEventListener('lumina-idioma-cambiado', () => {
    if (postsImportantesIndex.length > 0) {
        renderImportanteActualIndex();
    } else {
        cargarImportanteIndex();
    }
});
