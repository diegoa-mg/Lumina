// ============================================
// RENDERIZAR TARJETA
// ============================================

function renderizarTarjetaEnPanel(post) {

    let contenedor;

    if (post.status === 'borrador') {

        contenedor =
            document.getElementById('listaBorradores');

    } else if (post.status === 'publicado') {

        contenedor =
            document.getElementById('listaPublicados');

    } else {

        contenedor =
            document.getElementById('listaRevision');
    }

    const imagenFinal = post.imagen
        ? `../frontend/${post.imagen}`
        : 'img/default-post.jpg';

    const nuevaTarjeta = `

    <article 
        class="tarjeta-horizontal"

        data-post-id="${post.id}"

        data-titulo="${post.titulo}"

        data-descripcion="${post.descripcion}"

        data-imagen="${post.imagen}"

        data-tipo="${post.tipo}"
    >

        <div class="imagen-lateral">

            <img 
                src="${imagenFinal}" 
                alt="Preview"
            >

        </div>

        <div class="contenido-derecha">

            <div class="header-card-autor">

                <span class="etiqueta-borrador">

                    ${
                        post.status === 'borrador'
                        ? 'Borrador'
                        : post.status === 'publicado'
                            ? 'Publicado'
                            : 'En Revisión'
                    }

                </span>

            </div>

            <h4>${post.titulo}</h4>

            <p class="extracto">

                ${post.descripcion}

            </p>

            <p class="text-sm">

                Tipo: ${post.tipo}

            </p>

        </div>

        <div class="footer-card-autor">

            <button 
                class="btn-accion-autor btn-editar-post"
                onclick="prepararEdicion(this)"
            >

                <span class="material-symbols-outlined">
                    edit
                </span>

                Editar

            </button>

            ${
                post.status === 'borrador'
                ? `
                <button 
                    class="btn-accion-autor btn-revision-post"
                    onclick="cambiarARevision(${post.id})"
                >

                    <span class="material-symbols-outlined">
                        send
                    </span>

                    Mandar a revisión

                </button>
                `
                : ''
            }

        </div>

    </article>
    `;

    contenedor.insertAdjacentHTML(
        'afterbegin',
        nuevaTarjeta
    );
}


// ============================================
// CAMBIAR A REVISIÓN
// ============================================

async function cambiarARevision(postId) {

    try {

        const respuesta =
            await fetch(
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

        const resultado =
            await respuesta.json();

        if (resultado.success) {

            alert('✅ Post enviado a revisión');

            cargarPostsDelAutor();

        } else {

            alert(resultado.error || 'Error desconocido');
        }

    } catch(error) {

        console.error(error);

        alert('❌ Error al enviar a revisión');
    }
}


// ============================================
// CARGAR POSTS
// ============================================

async function cargarPostsDelAutor() {

    try {

        const respuesta =
            await fetch('../backend/obtener_posts.php');

        const posts = await respuesta.json();

        document.getElementById(
            'listaBorradores'
        ).innerHTML = '';

        document.getElementById(
            'listaRevision'
        ).innerHTML = '';

        document.getElementById(
            'listaPublicados'
        ).innerHTML = '';

        posts.forEach(post => {

            renderizarTarjetaEnPanel({

                id: post.id,

                titulo: post.titulo,

                descripcion: post.descripcion,

                imagen: post.imagen_url,

                tipo: post.tipo || 'articulo',

                status: post.status || 'borrador'

            });

        });

    } catch(error) {

        console.error(
            "Error al cargar posts:",
            error
        );
    }
}


// ============================================
// INICIAR
// ============================================

window.onload = function() {

    cargarPostsDelAutor();

};