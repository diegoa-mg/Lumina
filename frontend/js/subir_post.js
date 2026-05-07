// Función dedicada exclusivamente al diseño visual
function renderizarTarjetaEnPanel(post) {
    const contenedor = post.status === 'borrador' 
        ? document.getElementById('listaBorradores') 
        : document.getElementById('listaRevision');

    const nuevaTarjeta = `
        <article class="tarjeta-horizontal">
            <div class="imagen-lateral">
                <img src="${post.imagen}" alt="Preview">
            </div>
            <div class="contenido-derecha">
                <div class="header-card-autor">
                    <span class="etiqueta-borrador">${post.status === 'borrador' ? 'Borrador' : 'En Revisión'}</span>
                </div>
                <h4>${post.titulo}</h4>
                <div class="autor-info">
                    <img src="img/usuarios/diego.webp" alt="Perfil">
                    <div class="datos-autor-col">
                        <p class="nombre-autor">Diego Morales</p>
                        <p class="fecha-autor">Recién creado</p>
                    </div>
                </div>
                <p class="extracto">${post.descripcion}</p>
            </div>
            <div class="footer-card-autor">
                <button class="btn-accion-autor btn-editar-post">
                    <span class="material-symbols-outlined">edit</span> Editar
                </button>
                ${post.status === 'borrador' ? `
                <button class="btn-accion-autor btn-revision-post" onclick="cambiarARevision(this)">
                    <span class="material-symbols-outlined">send</span> Mandar a revisión
                </button>
                ` : ''}
            </div>
        </article>
    `;

    contenedor.insertAdjacentHTML('afterbegin', nuevaTarjeta);
}

// Función para cargar posts desde la DB al iniciar el Panel
async function cargarPostsDelAutor() {
    try {
        const respuesta = await fetch('backend/obtener_posts.php'); // Necesitarás crear este pequeño PHP
        const posts = await respuesta.json();
        
        // Limpiar contenedores antes de cargar
        document.getElementById('listaBorradores').innerHTML = '';
        document.getElementById('listaRevision').innerHTML = '';
        document.getElementById('listaPublicados').innerHTML = '';

        posts.forEach(post => {
            // Reutilizamos tu función de diseño
            renderizarTarjetaEnPanel({
                titulo: post.titulo,
                descripcion: post.descripcion,
                imagen: post.imagen_url, // Usar el nombre de la nueva columna
                status: post.status
            });
        });
    } catch (error) {
        console.error("Error al cargar posts:", error);
    }
}

// Ejecutar al cargar la página
window.onload = cargarPostsDelAutor;