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
    if (!fecha) return '';

    const fechaObj = new Date(String(fecha).replace(' ', 'T'));

    if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function recorteRecientes(texto, limite = 120) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function etiquetaTipoRecientes(tipo) {
    const etiquetas = {
        articulo: 'Artículo',
        video: 'Video',
        noticia: 'Noticia',
        recurso: 'Recurso'
    };

    return etiquetas[String(tipo || '').toLowerCase()] || 'Publicación';
}

function renderCardReciente(post) {
    const id = Number(post.id || 0);
    const titulo = escapeHtmlRecientes(post.titulo || 'Publicación sin título');
    const imagen = escapeHtmlRecientes(post.imagen_url || 'img/clases/clase2.webp');
    const autor = escapeHtmlRecientes(post.autor || 'Autor desconocido');
    const autorFoto = escapeHtmlRecientes(post.autor_foto || 'img/usuarios/usuarios1.webp');
    const fecha = escapeHtmlRecientes(formatearFechaRecientes(post.fecha_creacion));
    const tipo = escapeHtmlRecientes(etiquetaTipoRecientes(post.tipo));
    const materia = escapeHtmlRecientes(post.materia || 'Materia sin asignar');
    const extracto = escapeHtmlRecientes(recorteRecientes(post.descripcion));

    return `
        <article class="card-reciente">
            <img src="${imagen}" alt="${titulo}">
            <div class="card-content">
                <div class="meta-info">
                    <span>${tipo}</span>
                    <button class="btn-icon" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${id}, 'recursos', 'guardado')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4>${titulo}</h4>
                <div class="autor-info">
                    <img src="${autorFoto}" alt="${autor}">
                    <div>
                        <p class="nombre-autor">${autor}</p>
                        <p class="fecha-autor">${fecha}</p>
                    </div>
                </div>
                <p class="extracto">${extracto}</p>
                <p style="color: #2563eb; font-weight: 700;">${materia}</p>
                <div class="footer-card">
                    <button class="btn-invisible" data-reaccion-id="${id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${id}, 'recursos', 'like')">
                        <span class="material-symbols-outlined">favorite</span> Me gusta
                    </button>
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
            contenedor.innerHTML = '<p style="color:#6b7280;">Aún no hay publicaciones recientes.</p>';
            return;
        }

        contenedor.innerHTML = recientes.map(renderCardReciente).join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedor);
        }
    } catch (error) {
        console.error('Error cargando publicaciones recientes:', error);
        contenedor.innerHTML = '<p style="color:#6b7280;">No se pudieron cargar las publicaciones.</p>';
    }
}

document.addEventListener('DOMContentLoaded', cargarPostsRecientesIndex);
