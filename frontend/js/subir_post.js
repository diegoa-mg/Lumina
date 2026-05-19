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
    // Los avisos no tienen columna propia: se identifican por categoria_id 9.
    const seccion = categoriaId === 9 ? 'aviso' : 'post';
    const tipoAviso = escapeHtml(post.tipo_aviso || 'academico');
    const urgente = Number(post.urgente) === 1 ? '1' : '0';
    const importante = Number(post.importante) === 1 ? '1' : '0';
    const youtubeUrl = escapeHtml(post.youtube_url || '');
    const noticiaUrl = escapeHtml(post.noticia_url || '');

    // Avisos sin imagen: se rellena el recuadro con el icono y color del tipo de aviso.
    const iconoAviso = tipoAviso === 'plataforma' ? 'language' : 'school';
    const colorAvisoClase = tipoAviso === 'plataforma' ? 'bg-rojo2' : 'bg-rojo';
    const bloqueImagenLateral = (seccion === 'aviso' && !post.imagen)
        ? `<div class="aviso-icono-lateral ${colorAvisoClase}"><span class="material-symbols-outlined">${iconoAviso}</span></div>`
        : `<img src="${imagenFinal}" alt="Preview">`;

    // Los avisos muestran urgencia e importancia en lugar de tipo y materia.
    const metaInfo = seccion === 'aviso'
        ? `<p class="text-sm">Urgente: ${urgente === '1' ? 'Sí' : 'No'}</p>
            <p class="text-sm">Importante: ${importante === '1' ? 'Sí' : 'No'}</p>`
        : `<p class="text-sm">Tipo: ${tipo}</p>
            <p class="text-sm">Materia: ${materia}</p>`;

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
        data-youtube-url="${youtubeUrl}"
        data-noticia-url="${noticiaUrl}"
    >
        <button
            class="btn-eliminar-post"
            onclick="eliminarPost(${id})"
            title="Eliminar post"
        >
            <span class="material-symbols-outlined">delete</span>
        </button>

        <div class="imagen-lateral">
            ${bloqueImagenLateral}
        </div>

        <div class="contenido-derecha">
            <div class="header-card-autor">
                <span class="etiqueta-borrador ${status === 'rechazado' ? 'etiqueta-rechazado' : ''}">
                    ${estadoTexto}
                </span>
            </div>

            <h4>${titulo}</h4>

            <p class="extracto">${descripcion}</p>

            ${metaInfo}
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
                categoria_id: post.categoria_id || 1,
                materia: post.materia || '',
                status: post.status || 'borrador',
                observaciones: post.observaciones || '',
                seccion: post.seccion || 'post',
                tipo_aviso: post.tipo_aviso || 'academico',
                urgente: post.urgente,
                importante: post.importante,
                youtube_url: post.youtube_url || '',
                noticia_url: post.noticia_url || ''
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
