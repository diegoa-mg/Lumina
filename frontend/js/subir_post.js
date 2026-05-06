async function manejarPublicacion(estado) {
    const titulo = document.getElementById('postTitle').value;
    const desc = document.getElementById('postDesc').value;
    const img = document.getElementById('imgPreview').src; // Esto envía la imagen en Base64

    if (!titulo || !desc) return alert("Por favor, completa el título y la descripción.");

    // 1. Preparamos el objeto para el servidor
    const datosPost = {
        titulo: titulo,
        descripcion: desc,
        imagen: img,
        status: estado
    };

    try {
        // 2. Enviamos la petición al backend PHP
        const respuesta = await fetch('backend/publicar_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPost)
        });

        const resultado = await respuesta.json();

        // 3. Solo si el servidor confirma el guardado, mostramos la tarjeta
        if (resultado.success) {
            renderizarTarjetaEnPanel(datosPost); // Llamamos a la función visual
            
            // Limpiamos y cerramos
            document.getElementById('modalAdmin').style.display = 'none';
            document.getElementById('postTitle').value = "";
            document.getElementById('postDesc').value = "";
            
            alert(estado === 'borrador' ? "Guardado en Borradores" : "Enviado a revisión");
        } else {
            alert("Error al guardar: " + resultado.error);
        }
    } catch (error) {
        console.error("Error de conexión:", error);
        alert("No se pudo conectar con el servidor.");
    }
}

// 4. Función dedicada exclusivamente al diseño visual
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