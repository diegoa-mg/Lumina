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
        noticia: true,
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
    if (!fecha) return '';

    const fechaObj = new Date(fecha.replace(' ', 'T'));

    if (Number.isNaN(fechaObj.getTime())) {
        return fecha;
    }

    return fechaObj.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function descripcionCortaRecursos(texto, limite = 125) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function etiquetaTipoRecurso(tipo) {
    const etiquetas = {
        articulo: 'Artículo',
        video: 'Video',
        noticia: 'Noticia',
        recurso: 'Recurso'
    };

    return etiquetas[String(tipo || '').toLowerCase()] || String(tipo || '');
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
        const materiaId = String(post.categoria_id || '1');
        const tipo = post.tipo || 'articulo';

        return preferencias.materias[materiaId] !== false
            && preferencias.tipos[tipo] !== false;
    });
}

function normalizarPostRecurso(post) {
    return {
        id: Number(post.id || 0),
        titulo: post.titulo || 'Publicacion sin titulo',
        descripcion: post.descripcion || '',
        imagen: post.imagen_url || 'img/clases/clase2.webp',
        tipo: post.tipo || 'articulo',
        seccion: post.seccion || 'post',
        importante: Number(post.importante || 0) === 1,
        materia: post.materia || 'Materia sin asignar',
        fecha: formatearFechaRecursos(post.fecha_creacion),
        autor: post.autor || 'Autor desconocido',
        autorFoto: post.autor_foto || 'img/usuarios/usuarios1.webp'
    };
}

function renderPostRecienteRecurso(postOriginal) {
    const post = normalizarPostRecurso(postOriginal);
    const esAvisoImportante = post.seccion === 'aviso' && post.importante;
    const etiquetaTipo = esAvisoImportante
        ? '<span></span>'
        : `<span>${escapeHtmlRecursos(etiquetaTipoRecurso(post.tipo))}</span>`;
    const footerReacciones = esAvisoImportante
        ? ''
        : `
                <div class="footer-card">
                    <button class="btn-invisible" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="like" onclick="reaccionar(this, ${post.id}, 'recursos', 'like')">
                        <span class="material-symbols-outlined">favorite</span> Me gusta
                    </button>
                </div>
        `;

    return `
        <article class="card-reciente reciente-slide">
            <img src="${escapeHtmlRecursos(post.imagen)}" alt="${escapeHtmlRecursos(post.titulo)}">
            <div class="card-content">
                <div class="meta-info">
                    ${etiquetaTipo}
                    <button class="btn-icon" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${post.id}, 'recursos', 'guardado')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h4>${escapeHtmlRecursos(post.titulo)}</h4>
                <div class="autor-info">
                    <img src="${escapeHtmlRecursos(post.autorFoto)}" alt="${escapeHtmlRecursos(post.autor)}">
                    <div>
                        <p class="nombre-autor">${escapeHtmlRecursos(post.autor)}</p>
                        <p class="fecha-autor">${escapeHtmlRecursos(post.fecha)}</p>
                    </div>
                </div>
                <p class="extracto">${escapeHtmlRecursos(descripcionCortaRecursos(post.descripcion))}</p>
                <p style="color: #2563eb; font-weight: 700;">${escapeHtmlRecursos(post.materia)}</p>
                ${footerReacciones}
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
                <div style="color: #6b7280;">No hay publicaciones recientes.</div>
            `;
            requestAnimationFrame(actualizarFlechasRecursosCarousel);
            return;
        }

        const postsFiltrados = filtrarPostsRecursos(posts);

        if (postsFiltrados.length === 0) {
            contenedorRecientes.innerHTML = `
                <div style="color: #6b7280;">No hay publicaciones con tus preferencias activas.</div>
            `;
            requestAnimationFrame(actualizarFlechasRecursosCarousel);
            return;
        }

        contenedorRecientes.innerHTML = postsFiltrados
            .map(renderPostRecienteRecurso)
            .join('');

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(contenedorRecientes);
        }

        if (viewportRecientes) {
            viewportRecientes.scrollLeft = 0;
        }

        requestAnimationFrame(actualizarFlechasRecursosCarousel);
    } catch (error) {
        console.error('Error cargando publicaciones en recursos:', error);
        contenedorRecientes.innerHTML = `
            <div style="color: #6b7280;">No se pudieron cargar las publicaciones.</div>
        `;
        requestAnimationFrame(actualizarFlechasRecursosCarousel);
    }
}

document.addEventListener('DOMContentLoaded', cargarPostsEnRecursos);
document.addEventListener('DOMContentLoaded', () => {
    const viewport = document.getElementById('postsRecientesViewport');

    if (viewport) {
        viewport.addEventListener('scroll', actualizarFlechasRecursosCarousel, { passive: true });
    }

    window.addEventListener('resize', actualizarFlechasRecursosCarousel);
    actualizarFlechasRecursosCarousel();
});
