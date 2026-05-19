<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="icon" type="image/png" href="img/logo/Logo Lumina - Sin texto.png">
    <title>Lumina - Inicio</title>

    <link rel="preload" href="css/normalize.css" as="style">
    <link rel="stylesheet" href="css/normalize.css">

    <link rel="preload" href="css/base.css?v=3" as="style">
    <link rel="stylesheet" href="css/base.css?v=3">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

    <link href="https://fonts.googleapis.com/css2?family=Inter&family=Libre+Baskerville&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" />

    <script src="https://cdn.tailwindcss.com"></script>

    <link rel="stylesheet" href="css/recursos.css?v=4">
    <link rel="stylesheet" href="css/navbar.css?v=6">
    <link rel="stylesheet" href="css/styles.css?v=17">
    <link rel="stylesheet" href="css/comentarios_materia.css?v=3">
</head>

<body class="bg-gray-100">

<header>

    <div class="nav-bg">

        <div class="logo">
            <a href="index.html">
                <img src="img/logo/Logo Lumina (Fondo Blanco) Horizontal - Sin eslogan.png">
            </a>
        </div>

        <div class="search-container">
            <span class="search-icon material-symbols-outlined">
                search
            </span>

            <input class="search" type="search" placeholder="Buscar...">
        </div>

        <nav class="nav-principal">
            <a href="index.html">Inicio</a>
            <a href="login.html">Iniciar Sesión</a>
        </nav>

    </div>

</header>


<!-- ================= MAIN ================= -->

<main class="w-full">

    <div class="max-w-[1400px] mx-auto px-4 py-6">

        <section class="bg-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4">

            <div>
                <h1 class="text-2xl md:text-3xl font-bold">
                    <span id="materiaNombre">POO</span>
                </h1>
            </div>

            <div class="materia-autor-card">
                <img id="autorFoto" src="" alt="Foto del autor" class="materia-autor-foto">
                <div class="text-xl text-right">
                    <p class="font-bold">
                        Mtro. <span id="autorNombre">cargando...</span>
                    </p>

                    <p class="text-gray-500">
                        12/09/2025
                    </p>
                </div>
            </div>

        </section>


        <div class="bg-gray-200 rounded-xl mt-6">

            <h2 class="text-3xl font-bold mt-8 mb-6 px-4 py-4">
                Explora la Clase
            </h2>

            <!-- FILTROS -->

            <div class="flex gap-8 border-b mb-6 overflow-x-auto px-4">

                <button class="filter-btn pb-3 font-bold border-b-2 border-blue-600 text-blue-600"
                        data-filter="all">
                    Todo
                </button>

                <button class="filter-btn pb-3 text-gray-500"
                        data-filter="articulo">
                    Artículos
                </button>

                <button class="filter-btn pb-3 text-gray-500"
                        data-filter="video">
                    Videos
                </button>

                <button class="filter-btn pb-3 text-gray-500"
                        data-filter="recurso">
                    Recursos
                </button>

            </div>


            <!-- GRID POSTS -->

            <div id="contenedorPosts"
                 class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-4">

            </div>

        </div>


        <!-- COMENTARIOS -->

        <section class="mt-10">

            <h3 class="text-xl font-bold mb-4">
                Comentarios
            </h3>

            <div class="comentario-form flex gap-3 mb-6">

                <div class="comentario-avatar-form">
                    <span class="material-symbols-outlined comentario-avatar-icon">person</span>
                </div>

                <textarea id="inputComentarioMateria"
                          placeholder="Anadir comentario..."
                          class="flex-1 bg-white border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>

                <button id="btnPublicarComentarioMateria"
                        type="button"
                        class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold transition">
                    Publicar
                </button>

            </div>

            <div id="listaComentariosMateria" class="space-y-4"></div>

        </section>

    </div>

</main>


<!-- ================= FOOTER ================= -->

<footer class="footer">

    <section class="contenido-footer">

        <div class="footer-brand">
            <h1>Lumina</h1>

        <p>
            Plataforma de difusión digital académica
        </p>
            </div>
            <nav class="footer-links" aria-label="Enlaces del sitio">
                <div class="footer-link-group">
                    <a href="index.html">Inicio</a>
                    <a href="avisos.html">Avisos</a>
                    <a href="recursos.html">Recursos</a>
                    <a href="calendario.html">Calendario</a>
                </div>
                <div class="footer-link-group">
                    <a href="materia1.php">POO</a>
                    <a href="materia2.php">Servicios de Internet</a>
                    <a href="materia3.php">Ciclo de Vida</a>
                    <a href="materia4.php">Métodos Numéricos</a>
                </div>
                <div class="footer-link-group">
                    <a href="materia5.php">Desarrollo Emprendedor</a>
                    <a href="materia6.php">Sistemas Digitales</a>
                    <a href="materia7.php">Inglés</a>
                    <a href="materia8.php">Orientación y Tutoría</a>
                </div>
            </nav>

    </section>

    <p class="copy">
        © 2026 Lumina
    </p>

</footer>


<!-- ================= MODAL ================= -->

<div id="modal"
     class="fixed inset-0 bg-black/40 backdrop-blur-sm hidden items-center justify-center z-50">

    <div id="modalBox"
         class="bg-white w-[95%] max-w-3xl rounded-2xl p-6 relative max-h-[85vh] overflow-y-auto transform scale-95 opacity-0 transition-all duration-300">

        <button id="cerrarModal"
                class="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl">

            ✕

        </button>

        <div id="modalContenido"
             class="space-y-4">

        </div>

    </div>

</div>


<!-- ================= JS ================= -->

<script>

const MATERIAS = {
    'materia1.php': { id: 1, nombre: 'Programación Orientada a Objetos' },
    'materia2.php': { id: 2, nombre: 'Servicios de Internet' },
    'materia3.php': { id: 3, nombre: 'Ciclo de Vida del Desarrollo de Software' },
    'materia4.php': { id: 4, nombre: 'Métodos Numéricos' },
    'materia5.php': { id: 5, nombre: 'Desarrollo Emprendedor' },
    'materia6.php': { id: 6, nombre: 'Sistemas Digitales' },
    'materia7.php': { id: 7, nombre: 'Inglés' },
    'materia8.php': { id: 8, nombre: 'Orientación y Tutoría' }
};

const archivoMateria = window.location.pathname.split('/').pop();
const materiaActual = MATERIAS[archivoMateria] || MATERIAS['materia1.php'];

document.title = `Lumina - ${materiaActual.nombre}`;
document.getElementById('materiaNombre').textContent = materiaActual.nombre;

function getAutorFallback(nombre) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(nombre || 'Autor')}&background=2D50D1&color=fff`;
}

function resolverFotoAutor(fotoUrl, nombre) {
    if (!fotoUrl) {
        return getAutorFallback(nombre);
    }
    if (/^(https?:)?\/\//.test(fotoUrl) || fotoUrl.startsWith('data:image')) {
        return fotoUrl;
    }
    return fotoUrl.replace(/^(\.\.\/)+/, '').replace(/^frontend\//, '');
}

// Obtener y cargar el autor de la categoria
async function cargarAutorCategoria() {
    const autorNombre = document.getElementById('autorNombre');
    const autorFoto = document.getElementById('autorFoto');

    try {
        const response = await fetch(`../backend/obtener_autor_categoria.php?categoria_id=${materiaActual.id}`);
        const data = await response.json();
        if (data.ok && data.autor) {
            autorNombre.textContent = data.autor.nombre;
            autorFoto.src = resolverFotoAutor(data.autor.foto_url, data.autor.nombre);
            autorFoto.onerror = () => {
                autorFoto.src = getAutorFallback(data.autor.nombre);
            };
        } else {
            autorNombre.textContent = 'Sin asignar';
            autorFoto.src = getAutorFallback('Sin asignar');
        }
    } catch (error) {
        console.error('Error al cargar el autor:', error);
        autorNombre.textContent = 'Error';
        autorFoto.src = getAutorFallback('Autor');
    }
}

cargarAutorCategoria();


// ============================================
// FILTROS
// ============================================

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("filter-btn")) return;

    const buttons = document.querySelectorAll(".filter-btn");

    buttons.forEach(btn => {

        btn.classList.remove(
            "border-blue-600",
            "text-blue-600",
            "font-bold"
        );

        btn.classList.add("text-gray-500");

    });

    e.target.classList.add(
        "border-blue-600",
        "text-blue-600",
        "font-bold"
    );

    e.target.classList.remove("text-gray-500");

    const filter = e.target.dataset.filter;

    const items = document.querySelectorAll(".content-box");

    items.forEach(item => {

        if (filter === "all") {

            item.style.display = "flex";

        } else {

            item.style.display =
                item.dataset.type === filter
                ? "flex"
                : "none";
        }

    });

});


// ============================================
// CARGAR PUBLICACIONES
// ============================================

async function cargarPublicaciones() {

    try {

        const respuesta =
            await fetch(`../backend/obtener_publicaciones.php?categoria_id=${materiaActual.id}`);

        const posts = await respuesta.json();

        const contenedor =
            document.getElementById('contenedorPosts');

        contenedor.innerHTML = '';

        // SOLO PUBLICADOS
        const publicaciones = posts.filter(
            post => post.status === 'publicado'
        );

        if (publicaciones.length === 0) {

            contenedor.innerHTML = `

                <div class="col-span-full text-center py-10">

                    <h3 class="text-2xl font-bold text-gray-500">
                        No hay publicaciones aún
                    </h3>

                </div>

            `;

            return;
        }

        publicaciones.forEach(post => {

            const imagen = post.imagen_url
                ? post.imagen_url
                : 'img/default-post.jpg';

            const autor = post.autor
                ? post.autor
                : 'Autor desconocido';

            const tipo = post.tipo
                ? post.tipo
                : 'articulo';

            const descripcionCorta =
                post.descripcion.length > 120
                ? post.descripcion.substring(0, 120) + '...'
                : post.descripcion;

            const youtubeUrl = post.youtube_url || '';
            const videoFileUrl = post.video_url || '';
            const archivoUrl = post.archivo_url || post.noticia_url || '';
            const isYoutubeVideo = tipo === 'video' && youtubeUrl;
            const isVideoFile = tipo === 'video' && videoFileUrl;
            const videoId = isYoutubeVideo
                ? (youtubeUrl.includes('watch?v=')
                    ? youtubeUrl.split('watch?v=')[1].split('&')[0]
                    : youtubeUrl.includes('youtu.be/')
                        ? youtubeUrl.split('youtu.be/')[1]
                        : '')
                : '';
            const previewMedia = isYoutubeVideo
                ? `<iframe class="w-full h-52 rounded-xl mb-4 object-cover" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
                : isVideoFile
                    ? `<video class="w-full h-52 rounded-xl mb-4 object-cover" controls preload="metadata" poster="${imagen}"><source src="${videoFileUrl}">Tu navegador no soporta este video.</video>`
                    : `<img src="${imagen}" class="w-full h-52 object-cover rounded-xl mb-4" alt="Imagen publicación">`;
            const previewMediaFull = isYoutubeVideo
                ? `<iframe class="w-full h-72 rounded-2xl mb-6 object-cover" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`
                : isVideoFile
                    ? `<video class="w-full h-72 rounded-2xl mb-6 object-cover" controls preload="metadata" poster="${imagen}"><source src="${videoFileUrl}">Tu navegador no soporta este video.</video>`
                    : `<img src="${imagen}" class="w-full h-72 object-cover rounded-2xl mb-6">`;

            let contenidoExtra = '';
            let botonTexto = 'Leer más →';

                if (tipo === 'video' && youtubeUrl) {

                    let videoId = '';

                if (youtubeUrl.includes('watch?v=')) {

                    videoId = youtubeUrl.split('watch?v=')[1].split('&')[0];

                } else if (youtubeUrl.includes('youtu.be/')) {

                    videoId = youtubeUrl.split('youtu.be/')[1];

                }

            contenidoExtra = `
            <iframe
            class="w-full h-72 rounded-2xl"
            src="https://www.youtube.com/embed/${videoId}"
            frameborder="0"
            allowfullscreen
        ></iframe>
        `;

            botonTexto = 'Ver video →';

            } else if (tipo === 'recurso' && archivoUrl) {

            contenidoExtra = `
            <a
            href=""
            target="_blank"
            download
            class="inline-block bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold transition"
            >
            Descargar recurso
            </a>
        `;

    botonTexto = 'Descargar recurso →';
}

            const tarjeta = `

            <div class="content-box bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-lg transition duration-300 flex flex-col"
                 data-type="${tipo}">

                <span class="w-fit text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">

                    ${tipo.toUpperCase()}

                </span>

                <h3 class="text-xl font-bold mt-4 mb-2 text-gray-800">

                    ${post.titulo}

                </h3>

                <p class="text-sm text-gray-600 mb-4 leading-relaxed">

                    ${descripcionCorta}

                </p>

                ${previewMedia}

                <div class="contenido-completo hidden">

                    <span class="text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">

                        ${tipo.toUpperCase()}

                    </span>

                    <h2 class="text-3xl font-bold mt-4 mb-2 text-gray-900">

                        ${post.titulo}

                    </h2>

                    <p class="text-sm text-gray-500 mb-5">

                        Por ${autor}

                    </p>

                    ${previewMediaFull}

                    <div class="space-y-4 text-gray-700 text-[15px] leading-relaxed">

                        <p>${post.descripcion}</p>

                        ${contenidoExtra}

                    </div>

                </div>

                <div class="flex justify-between items-center mt-auto pt-4">

                    <button class="abrir-modal text-blue-600 font-bold hover:text-blue-800 transition">

                    ${botonTexto}

                    </button>

                </div>

            </div>
            `;

            contenedor.insertAdjacentHTML(
                'beforeend',
                tarjeta
            );

        });

        activarModales();

    } catch(error) {

        console.error(
            "Error cargando publicaciones:",
            error
        );

    }

}


// ============================================
// MODALES
// ============================================

function activarModales() {

    const botones =
        document.querySelectorAll(".abrir-modal");

    const modal =
        document.getElementById("modal");

    const modalBox =
        document.getElementById("modalBox");

    const modalContenido =
        document.getElementById("modalContenido");

    const cerrar =
        document.getElementById("cerrarModal");

    botones.forEach(btn => {

        btn.addEventListener("click", () => {

            const card =
                btn.closest(".content-box");

            const contenido =
                card.querySelector(".contenido-completo").innerHTML;

            modalContenido.innerHTML = contenido;

            modal.classList.remove("hidden");
            modal.classList.add("flex");

            setTimeout(() => {

                modalBox.classList.remove(
                    "scale-95",
                    "opacity-0"
                );

                modalBox.classList.add(
                    "scale-100",
                    "opacity-100"
                );

            }, 10);

        });

    });

    function cerrarModal() {

        modalBox.classList.remove(
            "scale-100",
            "opacity-100"
        );

        modalBox.classList.add(
            "scale-95",
            "opacity-0"
        );

        setTimeout(() => {

            modal.classList.add("hidden");
            modal.classList.remove("flex");

        }, 200);

    }

    cerrar.addEventListener(
        "click",
        cerrarModal
    );

    modal.addEventListener("click", (e) => {

        if (e.target === modal) {
            cerrarModal();
        }

    });

}


// ============================================
// INICIAR
// ============================================

document.addEventListener(
    "DOMContentLoaded",
    cargarPublicaciones
);

</script>

<script src="js/auth.js"></script>
<script src="js/menu_ui.js"></script>
<script src="js/comentarios_materia.js?v=3"></script>

</body>
</html>
