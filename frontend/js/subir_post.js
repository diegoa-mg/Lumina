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

function obtenerIconoAviso(post) {
    const tipoAviso = post.tipo_aviso || 'academico';

    return tipoAviso === 'plataforma' ? 'language' : 'school';
}

function renderMediaPanel(post, imagenFinal, titulo) {
    const esAviso = (post.seccion || 'post') === 'aviso';
    const tieneImagen = Boolean(post.imagen);

    if (esAviso && !tieneImagen) {
        return `
        <div class="imagen-lateral aviso-lateral aviso-lateral-${escapeHtml(post.tipo_aviso || 'academico')}">
            <span class="material-symbols-outlined">${obtenerIconoAviso(post)}</span>
        </div>
        `;
    }

    return `
        <div class="imagen-lateral">
            <img src="${imagenFinal}" alt="${titulo}">
        </div>
    `;
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
    const tipo = escapeHtml(post.tipo || 'articulo');
    const seccion = escapeHtml(post.seccion || 'post');
    const tipoAviso = escapeHtml(post.tipo_aviso || 'academico');
    const urgente = Number(post.urgente || 0);
    const importante = Number(post.importante || 0);
    const categoriaId = Number(post.categoria_id || 1);
    const materia = escapeHtml(post.materia || MATERIAS_POST[categoriaId] || 'POO');
    const imagenFinal = escapeHtml(resolveImageSrc(post.imagen));
    const estadoTexto = {
        borrador: 'Borrador',
        rechazado: 'Rechazado',
        publicado: 'Publicado',
        revision: 'En revision'
    }[status] || 'Borrador';
    const observaciones = escapeHtml(post.observaciones || '');

    const nuevaTarjeta = `
    <article
        class="tarjeta-horizontal"
        data-post-id="${id}"
        data-titulo="${titulo}"
        data-descripcion="${descripcion}"
        data-imagen="${imagen}"
        data-tipo="${tipo}"
        data-seccion="${seccion}"
        data-tipo-aviso="${tipoAviso}"
        data-urgente="${urgente}"
        data-importante="${importante}"
        data-categoria-id="${categoriaId}"
    >
        <button
            class="btn-eliminar-post"
            onclick="eliminarPost(${id})"
            title="Eliminar post"
        >
            <span class="material-symbols-outlined">delete</span>
        </button>

        ${renderMediaPanel(post, imagenFinal, titulo)}

        <div class="contenido-derecha">
            <div class="header-card-autor">
                <span class="etiqueta-borrador ${status === 'rechazado' ? 'etiqueta-rechazado' : ''}">
                    ${estadoTexto}
                </span>
            </div>

            <h4>${titulo}</h4>

            <p class="extracto">${descripcion}</p>

            <p class="text-sm">Publicacion: ${seccion === 'aviso' ? 'Aviso' : 'Post'}</p>
            <p class="text-sm">${seccion === 'aviso' ? `Tipo de aviso: ${tipoAviso === 'plataforma' ? 'Plataforma' : 'Academico'}` : `Tipo: ${tipo}`}</p>
            <p class="text-sm">${seccion === 'aviso' ? `Urgencia: ${urgente ? 'Urgente' : 'Normal'}` : `Materia: ${materia}`}</p>
            ${seccion === 'aviso' ? `<p class="text-sm">Importante: ${importante ? 'Si' : 'No'}</p>` : ''}
            ${status === 'rechazado' && observaciones ? `<p class="text-sm text-red-600 mt-3"><strong>Observación:</strong> ${observaciones}</p>` : ''}
        </div>

        <div class="footer-card-autor">
            <button
                class="btn-accion-autor btn-editar-post"
                onclick="prepararEdicion(this)"
            >
                <span class="material-symbols-outlined">edit</span>
                Editar
            </button>

            ${
                status === 'borrador' || status === 'rechazado'
                ? `
                <button
                    class="btn-accion-autor btn-revision-post"
                    onclick="cambiarARevision(${id})"
                >
                    <span class="material-symbols-outlined">send</span>
                    Mandar a revision
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
                seccion: post.seccion || 'post',
                tipo_aviso: post.tipo_aviso || 'academico',
                urgente: post.urgente || 0,
                importante: post.importante || 0,
                categoria_id: post.categoria_id || 1,
                materia: post.materia || '',
                status: post.status || 'borrador',
                observaciones: post.observaciones || ''
            });
        });

        const mensajesVacios = {
            listaBorradores: 'No tienes borradores guardados. ¡Crea tu primer post!',
            listaRevision:   'No tienes posts en revisión. Envía un borrador para que el editor lo revise.',
            listaPublicados: 'Aún no tienes posts publicados. ¡Sigue adelante!'
        };

        for (const [id, mensaje] of Object.entries(mensajesVacios)) {
            const contenedor = document.getElementById(id);
            if (contenedor && contenedor.children.length === 0) {
                contenedor.innerHTML =
                    `<div class="seccion-vacia">${mensaje}</div>`;
            }
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
