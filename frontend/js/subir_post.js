// ============================================
// HELPERS
// ============================================

function escapeHtml(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function resolveImageSrc(ruta) {
    if (!ruta) {
        return 'img/default-post.jpg';
    }

    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('../')) {
        return ruta;
    }

    return ruta;
}

function obtenerYoutubeEmbedUrl(url) {
    if (!url) return null;

    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/;
    const match = url.match(regex);

    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
}

function obtenerNombreDesdeRuta(ruta) {
    if (!ruta) return '';

    const nombreArchivo = decodeURIComponent(String(ruta).split('/').pop() || '');

    return nombreArchivo.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function formatearTipoPost(tipo) {
    const tipoNormalizado = String(tipo || '').toLowerCase();
    const fallback = {
        articulo: 'Artículo',
        video: 'Video',
        recurso: 'Recurso'
    };

    return typeof t === 'function'
        ? t(`tipo.${tipoNormalizado}`, fallback[tipoNormalizado] || fallback.articulo)
        : (fallback[tipoNormalizado] || fallback.articulo);
}

const MATERIAS_POST = {
    1: 'POO',
    2: 'Servicios de Internet',
    3: 'Ciclo de Vida del Software',
    4: 'Metodos Numericos',
    5: 'Desarrollo Emprendedor',
    6: 'Sistemas Digitales',
    7: 'Ingles',
    8: 'Orientacion y Tutoria'
};

// ============================================
// RENDERIZAR TARJETA
// ============================================

function renderizarTarjetaEnPanel(post) {
    let contenedor;
    const status = post.status || 'borrador';

    if (status === 'borrador' || status === 'rechazado') {
        contenedor = document.getElementById('listaBorradores');
    } else if (status === 'publicado') {
        contenedor = document.getElementById('listaPublicados');
    } else {
        contenedor = document.getElementById('listaRevision');
    }

    if (!contenedor) return;

    const id = Number(post.id);
    const titulo = escapeHtml(post.titulo);
    const descripcion = escapeHtml(post.descripcion);
    const imagen = escapeHtml(post.imagen);
    const tipoRaw = String(post.tipo || 'articulo').toLowerCase();
    const tipo = escapeHtml(tipoRaw);
    const tipoTexto = escapeHtml(formatearTipoPost(tipoRaw));
    const categoriaId = Number(post.categoria_id || 1);
    const materiaTexto = typeof traducirMateriaLumina === 'function'
        ? traducirMateriaLumina(post.materia || MATERIAS_POST[categoriaId] || 'POO', categoriaId)
        : (post.materia || MATERIAS_POST[categoriaId] || 'POO');
    const materia = escapeHtml(materiaTexto);
    const videoUrl = post.video_url || '';
    const youtubeUrlRaw = post.youtube_url || '';
    const archivoUrlRaw = post.archivo_url || post.noticia_url || '';
    const imagenFinal = escapeHtml(resolveImageSrc(post.imagen));
    let previewHtml = `<img src="${imagenFinal}" alt="Preview">`;

    if (tipo === 'video') {
        if (videoUrl) {
            const videoSrc = escapeHtml(resolveImageSrc(videoUrl));
            previewHtml = `
                <video class="media-preview-card" src="${videoSrc}" poster="${imagenFinal}" controls muted playsinline preload="metadata"></video>
            `;
        } else if (youtubeUrlRaw) {
            const embedUrl = obtenerYoutubeEmbedUrl(youtubeUrlRaw);
            previewHtml = embedUrl
                ? `
                    <iframe class="media-preview-card" src="${escapeHtml(embedUrl)}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                `
                : `<img src="${imagenFinal}" alt="Preview">`;
        }
    } else if (tipo === 'recurso') {
        const nombreArchivo = escapeHtml(obtenerNombreDesdeRuta(archivoUrlRaw) || 'Recurso adjunto');
        previewHtml = `
            <div class="aviso-icono-lateral bg-recurso">
                <span class="material-symbols-outlined">description</span>
                <p>${nombreArchivo}</p>
            </div>
        `;
    }

    const tt = (k, f) => (typeof t === 'function' ? t(k, f) : f);
    const estadoTexto = {
        borrador: tt('estado.borrador', 'Borrador'),
        rechazado: tt('estado.rechazado', 'Rechazado'),
        publicado: tt('estado.publicado', 'Publicado'),
        revision: tt('estado.revision', 'En revisión')
    }[status] || tt('estado.borrador', 'Borrador');
    const estadoClave = {
        borrador: 'estado.borrador',
        rechazado: 'estado.rechazado',
        publicado: 'estado.publicado',
        revision: 'estado.revision'
    }[status] || 'estado.borrador';
    const observaciones = escapeHtml(post.observaciones || '');
    // Los avisos no tienen columna propia: se identifican por categoria_id 9.
    const seccion = categoriaId === 9 ? 'aviso' : 'post';
    const tipoAviso = escapeHtml(post.tipo_aviso || 'academico');
    const urgente = Number(post.urgente) === 1 ? '1' : '0';
    const importante = Number(post.importante) === 1 ? '1' : '0';
    const youtubeUrl = escapeHtml(post.youtube_url || '');
    const archivoUrl = escapeHtml(post.archivo_url || post.noticia_url || '');

    // Avisos no importantes: se rellena el recuadro con el icono y color del tipo de aviso.
    const iconoAviso = tipoAviso === 'plataforma' ? 'language' : 'school';
    const colorAvisoClase = tipoAviso === 'plataforma' ? 'bg-rojo2' : 'bg-rojo';
    const bloqueImagenLateral = seccion === 'aviso'
        ? (
            importante !== '1' || !post.imagen
                ? `<div class="aviso-icono-lateral ${colorAvisoClase}"><span class="material-symbols-outlined">${iconoAviso}</span></div>`
                : `<img src="${imagenFinal}" alt="Preview">`
        )
        : previewHtml;

    // Los avisos muestran urgencia e importancia en lugar de tipo y materia.
    const metaInfo = seccion === 'aviso'
        ? `<p class="meta-card-autor"><span data-i18n="meta.urgente">Urgente:</span> <span data-i18n="${urgente === '1' ? 'comun.si' : 'comun.no'}">${urgente === '1' ? 'Sí' : 'No'}</span></p>
            <p class="meta-card-autor"><span data-i18n="meta.importante">Importante:</span> <span data-i18n="${importante === '1' ? 'comun.si' : 'comun.no'}">${importante === '1' ? 'Sí' : 'No'}</span></p>`
        : `<p class="meta-card-autor"><span data-i18n="meta.tipo">Tipo:</span> <span data-i18n="tipo.${tipoRaw}">${tipoTexto}</span></p>
            <p class="meta-card-autor"><span data-i18n="meta.materia">Materia:</span> ${materia}</p>`;

    const nuevaTarjeta = `
    <article
        class="tarjeta-horizontal"
        data-post-id="${id}"
        data-titulo="${titulo}"
        data-descripcion="${descripcion}"
        data-imagen="${imagen}"
        data-tipo="${tipo}"
        data-categoria-id="${categoriaId}"
        data-status="${status}"
        data-seccion="${seccion}"
        data-tipo-aviso="${tipoAviso}"
        data-urgente="${urgente}"
        data-importante="${importante}"
        data-video-url="${escapeHtml(videoUrl)}"
        data-youtube-url="${youtubeUrl}"
        data-archivo-url="${archivoUrl}"
    >
        <button
            class="btn-eliminar-post"
            onclick="eliminarPost(${id})"
            title="Eliminar post"
            data-i18n-title="comun.eliminar_post_title"
        >
            <span class="material-symbols-outlined">delete</span>
        </button>

        <div class="imagen-lateral">
            ${bloqueImagenLateral}
        </div>

        <div class="contenido-derecha">
            <div class="header-card-autor">
                <span class="etiqueta-borrador ${status === 'rechazado' ? 'etiqueta-rechazado' : ''}" data-i18n="${estadoClave}">
                    ${estadoTexto}
                </span>
            </div>

            <h4>${titulo}</h4>

            <p class="extracto">${descripcion}</p>

            ${metaInfo}
            ${status === 'rechazado' && observaciones ? `<p class="meta-card-autor text-red-600 mt-3"><strong data-i18n="meta.observacion">Observación:</strong> ${observaciones}</p>` : ''}
        </div>

        <div class="footer-card-autor">
            <button
                class="btn-accion-autor btn-editar-post"
                onclick="prepararEdicion(this)"
            >
                <span class="material-symbols-outlined">edit</span>
                <span data-i18n="comun.editar">Editar</span>
            </button>

            ${
                status === 'borrador' || status === 'rechazado'
                ? `
                <button
                    class="btn-accion-autor btn-revision-post"
                    onclick="cambiarARevision(${id})"
                >
                    <span class="material-symbols-outlined">send</span>
                    <span data-i18n="comun.mandar_revision">Mandar a revisión</span>
                </button>
                `
                : ''
            }
        </div>
    </article>
    `;

    contenedor.insertAdjacentHTML('afterbegin', nuevaTarjeta);
}

// ============================================
// CAMBIAR A REVISION
// ============================================

async function cambiarARevision(postId) {
    try {
        const respuesta = await fetch(
            '../backend/cambiar_estado_post.php',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    post_id: postId,
                    status: 'revision'
                })
            }
        );

        const resultado = await respuesta.json();

        if (resultado.success) {
            alert('Post enviado a revision');
            cargarPostsDelAutor();
        } else {
            alert(resultado.error || 'Error desconocido');
        }
    } catch (error) {
        console.error(error);
        alert('Error al enviar a revision');
    }
}

// ============================================
// CARGAR POSTS
// ============================================

async function cargarPostsDelAutor() {
    try {
        const respuesta = await fetch('../backend/obtener_posts.php');
        const posts = await respuesta.json();

        document.getElementById('listaBorradores').innerHTML = '';
        document.getElementById('listaRevision').innerHTML = '';
        document.getElementById('listaPublicados').innerHTML = '';

        posts.forEach(post => {
            renderizarTarjetaEnPanel({
                id: post.id,
                titulo: post.titulo,
                descripcion: post.descripcion,
                imagen: post.imagen_url,
                tipo: post.tipo || 'articulo',
                categoria_id: post.categoria_id || 1,
                materia: post.materia || '',
                status: post.status || 'borrador',
                observaciones: post.observaciones || '',
                seccion: post.seccion || 'post',
                tipo_aviso: post.tipo_aviso || 'academico',
                urgente: post.urgente,
                importante: post.importante,
                youtube_url: post.youtube_url || '',
                archivo_url: post.archivo_url || post.noticia_url || '',
                video_url: post.video_url || ''
            });
        });

        const mensajesVacios = {
            listaBorradores: 'No tienes borradores guardados. ¡Crea tu primer post!',
            listaRevision:   'No tienes posts en revisión. Envía un borrador para que el editor lo revise.',
            listaPublicados: 'Aún no tienes posts publicados. ¡Sigue adelante!'
        };

        const clavesVacias = {
            listaBorradores: 'dash.sin_borradores',
            listaRevision:   'dash.sin_revision',
            listaPublicados: 'dash.sin_publicados'
        };

        for (const [id, mensaje] of Object.entries(mensajesVacios)) {
            const contenedor = document.getElementById(id);
            if (contenedor && contenedor.children.length === 0) {
                const clave = clavesVacias[id];
                const texto = (typeof t === 'function' && clave) ? t(clave, mensaje) : mensaje;
                contenedor.innerHTML =
                    `<div class="seccion-vacia"${clave ? ` data-i18n="${clave}"` : ''}>${texto}</div>`;
            }
        }

        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(document.getElementById('listaBorradores'));
            aplicarTraducciones(document.getElementById('listaRevision'));
            aplicarTraducciones(document.getElementById('listaPublicados'));
        }
    } catch (error) {
        console.error('Error al cargar posts:', error);
    }
}

// ============================================
// ELIMINAR POST
// ============================================

async function eliminarPost(postId) {
    if (!confirm('¿Seguro que quieres eliminar este post? Esta acción no se puede deshacer.')) return;

    try {
        const respuesta = await fetch('../backend/eliminar_post.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId })
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            cargarPostsDelAutor();
        } else {
            alert('❌ Error: ' + resultado.error);
        }
    } catch (error) {
        console.error(error);
        alert('❌ Error al eliminar el post');
    }
}


// ============================================
// INICIAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarPostsDelAutor();
});

document.addEventListener('lumina-idioma-cambiado', cargarPostsDelAutor);
