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
    if (!fecha) return '';

    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;

    return fechaObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function etiquetaPublicacionLista(post) {
    if ((post.seccion || 'post') === 'aviso') {
        return post.tipo_aviso === 'plataforma' ? 'Plataforma' : 'Academico';
    }

    const etiquetas = {
        articulo: 'Articulo',
        video: 'Video',
        recurso: 'Recurso'
    };

    return etiquetas[String(post.tipo || '').toLowerCase()] || 'Post';
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

function renderPublicacionReaccionada(post, tipoPagina) {
    const id = Number(post.id || 0);
    const imagen = resolveImageLista(post.imagen_url);
    const autorFoto = post.autor_foto ? resolveImageLista(post.autor_foto) : '';
    const likeActivo = tipoPagina === 'like' ? 'like-activo' : '';
    const guardadoActivo = tipoPagina === 'guardado' ? 'save-activo' : '';

    return `
        <article class="tarjeta-horizontal">
            <div class="imagen-lateral">
                <img src="${escapeHtmlLista(imagen)}" alt="${escapeHtmlLista(post.titulo || 'Publicacion')}">
            </div>

            <div class="contenido-derecha">
                <div class="meta-info">
                    <span class="etiqueta-gris">${escapeHtmlLista(etiquetaPublicacionLista(post))}</span>
                    <button class="btn-icon ${guardadoActivo}" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>

                <h4>${escapeHtmlLista(post.titulo || 'Publicacion sin titulo')}</h4>

                <div class="autor-info">
                    ${renderAvatarAutorLista(autorFoto, post.autor || 'Autor')}
                    <div>
                        <p class="nombre-autor">${escapeHtmlLista(post.autor || 'Autor desconocido')}</p>
                        <p class="fecha-autor">${escapeHtmlLista(formatearFechaLista(post.fecha_creacion))}</p>
                    </div>
                </div>

                <p class="extracto">${escapeHtmlLista(post.descripcion || '')}</p>

                <div class="footer-card">
                    <button class="btn-invisible ${likeActivo}" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like">
                        <span class="material-symbols-outlined">favorite</span> Me gusta
                    </button>
                </div>
            </div>
        </article>
    `;
}

async function cargarListaReacciones() {
    const contenedor = document.querySelector('.contenedor-principal-likes');
    if (!contenedor) return;

    const tipo = contenedor.dataset.tipoReaccion || 'like';
    contenedor.innerHTML = '<div class="seccion-vacia">Cargando publicaciones...</div>';

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
            contenedor.innerHTML = `
                <div class="seccion-vacia">
                    ${tipo === 'guardado' ? 'No tienes publicaciones guardadas.' : 'No tienes publicaciones con me gusta.'}
                </div>
            `;
            return;
        }

        contenedor.innerHTML = publicaciones
            .map((post) => renderPublicacionReaccionada(post, tipo))
            .join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedor);
        }
    } catch (error) {
        console.error(error);
        contenedor.innerHTML = '<div class="seccion-vacia">No se pudieron cargar las publicaciones.</div>';
    }
}

document.addEventListener('DOMContentLoaded', cargarListaReacciones);
