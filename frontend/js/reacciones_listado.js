function escapeHtmlListado(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function resolveImagenListado(ruta) {
    if (!ruta) return 'img/clases/clase2.webp';
    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('img/') || ruta.startsWith('uploads/')) {
        return ruta;
    }
    return ruta.replace(/^frontend\//, '');
}

function etiquetaTipoListado(tipo) {
    const etiquetas = {
        articulo: 'Articulo',
        video: 'Video',
        noticia: 'Noticia',
        recurso: 'Recurso'
    };

    return etiquetas[String(tipo || '').toLowerCase()] || String(tipo || '');
}

function descripcionCortaListado(texto, limite = 150) {
    const limpio = String(texto ?? '');
    return limpio.length > limite ? `${limpio.substring(0, limite)}...` : limpio;
}

function renderPublicacionReaccion(post, listadoTipo) {
    const esAvisoImportante = (post.seccion || 'post') === 'aviso' && Number(post.importante || 0) === 1;
    const etiqueta = esAvisoImportante
        ? '<span></span>'
        : `<span class="etiqueta-gris">${escapeHtmlListado(etiquetaTipoListado(post.tipo))}</span>`;
    const botonLike = esAvisoImportante
        ? ''
        : `
                    <div class="footer-card">
                        <button class="btn-invisible" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${post.id}, 'recursos', 'like')">
                            <span class="material-symbols-outlined">favorite</span> Me gusta
                        </button>
                    </div>
        `;

    return `
            <article class="tarjeta-horizontal">
                <div class="imagen-lateral">
                    <img src="${escapeHtmlListado(resolveImagenListado(post.imagen_url))}" alt="${escapeHtmlListado(post.titulo)}">
                </div>

                <div class="contenido-derecha">
                    <div class="meta-info">
                        ${etiqueta}
                        <button class="btn-icon" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${post.id}, 'recursos', 'guardado')">
                            <span class="material-symbols-outlined">bookmark</span>
                        </button>
                    </div>

                    <h4>${escapeHtmlListado(post.titulo)}</h4>

                    <div class="autor-info">
                        <img src="${escapeHtmlListado(resolveImagenListado(post.autor_foto || 'img/usuarios/usuarios1.webp'))}" alt="${escapeHtmlListado(post.autor || 'Autor')}">
                        <div>
                            <p class="nombre-autor">${escapeHtmlListado(post.autor || 'Autor desconocido')}</p>
                            <p class="fecha-autor">${escapeHtmlListado(post.fecha_formateada || '')}</p>
                        </div>
                    </div>

                    <p class="extracto">${escapeHtmlListado(descripcionCortaListado(post.descripcion))}</p>
                    ${botonLike}
                </div>
            </article>
    `;
}

async function cargarListadoReacciones() {
    const contenedor = document.getElementById('listado-reacciones');
    if (!contenedor) return;

    const tipo = contenedor.dataset.tipo || 'like';
    const textoVacio = tipo === 'guardado'
        ? 'No tienes publicaciones guardadas.'
        : 'No tienes publicaciones con Me gusta.';

    contenedor.innerHTML = `<div class="seccion-vacia">${textoVacio}</div>`;

    try {
        const respuesta = await fetch(`../backend/obtener_reacciones.php?accion=listado&tipo=${encodeURIComponent(tipo)}`, {
            credentials: 'same-origin'
        });
        const datos = await respuesta.json();

        if (respuesta.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.mensaje || 'No se pudo cargar el listado.');
        }

        if (!Array.isArray(datos.publicaciones) || datos.publicaciones.length === 0) {
            contenedor.innerHTML = `<div class="seccion-vacia">${textoVacio}</div>`;
            return;
        }

        contenedor.innerHTML = datos.publicaciones
            .map((post) => renderPublicacionReaccion(post, tipo))
            .join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedor);
        }
    } catch (error) {
        console.error('Error cargando listado de reacciones:', error);
        contenedor.innerHTML = '<div class="seccion-vacia">No se pudo cargar el contenido.</div>';
    }
}

document.addEventListener('DOMContentLoaded', cargarListadoReacciones);
document.addEventListener('lumina:reaccion-cambiada', (event) => {
    const contenedor = document.getElementById('listado-reacciones');
    if (!contenedor) return;

    const tipoListado = contenedor.dataset.tipo || 'like';
    const detalle = event.detail || {};

    if (detalle.tipo !== tipoListado || detalle.activo) return;

    const boton = contenedor.querySelector(
        `[data-reaccion-id="${detalle.elemento_id}"][data-reaccion-tipo="${tipoListado}"]`
    );
    const tarjeta = boton?.closest('.tarjeta-horizontal');

    if (tarjeta) {
        tarjeta.remove();
    }

    if (!contenedor.querySelector('.tarjeta-horizontal')) {
        const textoVacio = tipoListado === 'guardado'
            ? 'No tienes publicaciones guardadas.'
            : 'No tienes publicaciones con Me gusta.';

        contenedor.innerHTML = `<div class="seccion-vacia">${textoVacio}</div>`;
    }
});
