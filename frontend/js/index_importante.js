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
        noticia: true,
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

function descripcionCortaIndex(texto, limite = 220) {
    const limpio = String(texto ?? '');
    return limpio.length > limite
        ? `${limpio.substring(0, limite)}...`
        : limpio;
}

function etiquetaTipoIndex(tipo) {
    const etiquetas = {
        articulo: 'Artículo',
        video: 'Video',
        noticia: 'Noticia',
        recurso: 'Recurso'
    };

    return etiquetas[String(tipo || '').toLowerCase()] || String(tipo || '');
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
        materia: post.materia || 'Materia sin asignar',
        fecha: formatearFechaIndex(post.fecha_creacion),
        autor: post.autor || 'Autor desconocido',
        autorFoto: post.autor_foto || 'img/usuarios/usuarios1.webp'
    };
}

function renderPostImportanteIndex(postOriginal) {
    const post = normalizarPostIndex(postOriginal);
    const etiquetaTipo = post.seccion === 'aviso'
        ? '<span></span>'
        : `<span>${escapeHtmlIndex(etiquetaTipoIndex(post.tipo))}</span>`;
    const materia = post.seccion === 'aviso'
        ? ''
        : `<p style="color: #2563eb; font-weight: 700;">${escapeHtmlIndex(post.materia)}</p>`;

    return `
        <div class="img-container-big">
            <img src="${escapeHtmlIndex(post.imagen)}" alt="${escapeHtmlIndex(post.titulo)}">
        </div>
        <div class="info-container-big">
            <div>
                <div class="meta-info">
                    ${etiquetaTipo}
                    <button class="btn-icon" data-reaccion-id="${post.id}" data-reaccion-seccion="recursos" data-reaccion-tipo="guardado" onclick="reaccionar(this, ${post.id}, 'recursos', 'guardado')">
                        <span class="material-symbols-outlined">bookmark</span>
                    </button>
                </div>
                <h3 style="font-size: 2.2rem; margin-bottom: 15px;">${escapeHtmlIndex(post.titulo)}</h3>
                <div class="autor-info">
                    <img src="${escapeHtmlIndex(post.autorFoto)}" alt="${escapeHtmlIndex(post.autor)}">
                    <div>
                        <p style="font-weight: bold; margin: 0;">${escapeHtmlIndex(post.autor)}</p>
                        <p style="color: #6b7280; font-size: 1.1rem; margin: 0;">${escapeHtmlIndex(post.fecha)}</p>
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
                    <h3>No hay publicaciones importantes</h3>
                </div>
            `;
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
                <h3>No se pudo cargar la publicacion importante</h3>
            </div>
        `;
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
    const sinCarrusel = postsImportantesIndex.length <= 1;
    const enInicio = postImportanteActualIndex <= 0;
    const enFinal = postImportanteActualIndex >= postsImportantesIndex.length - 1;

    if (prev) prev.classList.toggle('hidden', sinCarrusel || enInicio);
    if (next) next.classList.toggle('hidden', sinCarrusel || enFinal);
}

function moveImportanteIndex(direction) {
    if (postsImportantesIndex.length <= 1) return;

    postImportanteActualIndex = Math.min(
        Math.max(postImportanteActualIndex + direction, 0),
        postsImportantesIndex.length - 1
    );

    renderImportanteActualIndex();
}

document.addEventListener('DOMContentLoaded', cargarImportanteIndex);
