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

    const nuevaTarjeta = `
    <article
        class="tarjeta-horizontal"
        data-post-id="${id}"
        data-titulo="${titulo}"
        data-descripcion="${descripcion}"
        data-imagen="${imagen}"
        data-tipo="${tipo}"
        data-categoria-id="${categoriaId}"
    >
        <div class="imagen-lateral">
            <img src="${imagenFinal}" alt="Preview">
        </div>

        <div class="contenido-derecha">
            <div class="header-card-autor">
                <span class="etiqueta-borrador ${status === 'rechazado' ? 'etiqueta-rechazado' : ''}">
                    ${estadoTexto}
                </span>
            </div>

            <h4>${titulo}</h4>

            <p class="extracto">${descripcion}</p>

            <p class="text-sm">Tipo: ${tipo}</p>
            <p class="text-sm">Materia: ${materia}</p>
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
                status: post.status || 'borrador'
            });
        });
    } catch (error) {
        console.error('Error al cargar posts:', error);
    }
}

// ============================================
// INICIAR
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarPostsDelAutor();
});
