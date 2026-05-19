function isUserLoggedIn() {
    return localStorage.getItem('sesion_activa') === 'true';
}

function getUserRole() {
    return localStorage.getItem('user_role') || 'Usuario';
}

function resolveNavAvatarSrc(fotoUrl) {
    if (!fotoUrl) return '';
    if (fotoUrl.startsWith('http') || fotoUrl.startsWith('data:') || fotoUrl.startsWith('../')) {
        return fotoUrl;
    }
    return fotoUrl;
}

function obtenerInicialesUsuario(nombre) {
    const partes = String(nombre || 'Usuario')
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (partes.length === 0) return 'U';

    return partes
        .slice(0, 2)
        .map((parte) => parte.charAt(0).toUpperCase())
        .join('');
}

async function cargarAvatarNav() {
    const avatar = document.getElementById('nav-avatar-img');
    const icono = document.getElementById('nav-avatar-icon');
    const iniciales = document.getElementById('nav-avatar-initials');

    if (!avatar || !icono || !iniciales || !isUserLoggedIn()) return;

    try {
        const respuesta = await fetch('../backend/obtener_cuenta.php', {
            credentials: 'same-origin'
        });
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.ok) {
            return;
        }

        iniciales.textContent = obtenerInicialesUsuario(datos.usuario?.nombre);

        if (!datos.usuario?.foto_url) {
            avatar.classList.add('d-none');
            icono.classList.add('d-none');
            iniciales.classList.remove('d-none');
            return;
        }

        avatar.src = resolveNavAvatarSrc(datos.usuario.foto_url);
        avatar.classList.remove('d-none');
        icono.classList.add('d-none');
        iniciales.classList.add('d-none');
    } catch (error) {
        console.error('No se pudo cargar la foto de perfil en la navbar:', error);
    }
}

function aplicarEstadoThemeNav() {
    const boton = document.getElementById('btn-theme-toggle');
    const icono = document.getElementById('theme-toggle-icon');
    const modo = localStorage.getItem('lumina_theme_mode') || 'light';

    if (!boton || !icono) return;

    const modoNoche = modo === 'dark';
    boton.dataset.themeMode = modo;
    boton.setAttribute('aria-label', modoNoche ? 'Cambiar a modo claro' : 'Cambiar a modo noche');
    icono.textContent = modoNoche ? 'light_mode' : 'dark_mode';
}

function aplicarEstadoIdiomaNav() {
    const boton = document.getElementById('btn-language-toggle');
    const idioma = localStorage.getItem('lumina_language') || 'es';

    if (!boton) return;

    boton.dataset.language = idioma;
    boton.querySelectorAll('[data-lang-option]').forEach((opcion) => {
        opcion.classList.toggle('active', opcion.dataset.langOption === idioma);
    });
}

function inicializarControlesNav() {
    const botonTheme = document.getElementById('btn-theme-toggle');
    const botonIdioma = document.getElementById('btn-language-toggle');

    aplicarEstadoThemeNav();
    aplicarEstadoIdiomaNav();

    if (botonTheme) {
        botonTheme.addEventListener('click', () => {
            const modoActual = localStorage.getItem('lumina_theme_mode') || 'light';
            localStorage.setItem('lumina_theme_mode', modoActual === 'dark' ? 'light' : 'dark');
            aplicarEstadoThemeNav();
        });
    }

    if (botonIdioma) {
        botonIdioma.addEventListener('click', () => {
            const idiomaActual = localStorage.getItem('lumina_language') || 'es';
            localStorage.setItem('lumina_language', idiomaActual === 'es' ? 'en' : 'es');
            aplicarEstadoIdiomaNav();
        });
    }
}

function renderNav() {
    const nav = document.querySelector('.nav-principal');
    if (!nav) return;

    if (isUserLoggedIn()) {
        const userRole = getUserRole();
        const panelLinks = [];

        if (userRole === 'Autor' || userRole === 'Editor' || userRole === 'Administrador') {
            panelLinks.push('<a href="dashboard_autor.html" class="autor-opt">Panel Autor</a>');
        }
        if (userRole === 'Editor' || userRole === 'Administrador') {
            panelLinks.push('<a href="dashboard_editor.html" class="editor-opt">Panel Editor</a>');
        }
        if (userRole === 'Administrador') {
            panelLinks.push('<a href="dashboard_admin.html" class="admin-opt">Panel Admin</a>');
        }

        nav.innerHTML = `
            <a href="index.html">Inicio</a>
            <a href="avisos.html">Avisos</a>
            <a href="recursos.html">Recursos</a>
            <a href="calendario.html">Calendario</a>
            <div class="nav-tools" aria-label="Opciones de interfaz">
                <button id="btn-theme-toggle" class="nav-tool-btn" type="button" aria-label="Cambiar a modo noche">
                    <span id="theme-toggle-icon" class="material-symbols-outlined">dark_mode</span>
                </button>
                <button id="btn-language-toggle" class="nav-language-btn" type="button" aria-label="Cambiar idioma">
                    <span data-lang-option="es">ESP</span>
                    <span class="nav-language-separator">/</span>
                    <span data-lang-option="en">ENG</span>
                </button>
            </div>
            <div class="dropdown-container">
                <button id="btn-cuenta" class="btn-cuenta-estilo btn-cuenta-avatar" aria-label="Abrir menú de cuenta">
                    <span class="nav-avatar">
                        <img id="nav-avatar-img" class="nav-avatar-img d-none" src="" alt="Foto de perfil">
                        <span id="nav-avatar-initials" class="nav-avatar-initials d-none">U</span>
                        <span id="nav-avatar-icon" class="material-symbols-outlined nav-avatar-icon">person</span>
                    </span>
                    <span class="material-symbols-outlined">expand_more</span>
                </button>
                <div id="menu-dropdown" class="dropdown-content">
                    <a href="cuenta.html">Ajustes</a>
                    ${panelLinks.join('')}
                    <hr>
                    <a href="#" id="cerrar-sesion" class="logout">Cerrar Sesión</a>
                </div>
            </div>
        `;

        const cerrarSesion = document.getElementById('cerrar-sesion');
        if (cerrarSesion) {
            cerrarSesion.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    await fetch('../backend/cerrar_sesion.php', {
                        method: 'POST',
                        credentials: 'same-origin'
                    });
                } finally {
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }

        cargarAvatarNav();
        inicializarControlesNav();
    } else {
        nav.innerHTML = `
            <a href="index.html">Inicio</a>
            <a href="login.html">Iniciar Sesión</a>
        `;
    }
}

function renderFooter() {
    const footerLinks = document.querySelector('.footer-links');
    if (!footerLinks) return;

    // Con sesión activa se dejan los enlaces por defecto del HTML
    if (isUserLoggedIn()) return;

    footerLinks.classList.add('footer-links--guest');
    footerLinks.innerHTML = `
        <div class="footer-link-group">
            <a href="index.html">Inicio</a>
            <a href="login.html">Iniciar Sesión</a>
            <a href="registro.html">Registrarse</a>
        </div>
    `;
}

function redirectIfNotAllowed() {
    const currentPage = window.location.pathname.split('/').pop();
    const role = getUserRole();
    const accessMap = {
        'cuenta.html': ['Usuario', 'Autor', 'Editor', 'Administrador'],
        'dashboard_autor.html': ['Autor', 'Editor', 'Administrador'],
        'dashboard_editor.html': ['Editor', 'Administrador'],
        'dashboard_admin.html': ['Administrador'],
    };

    const allowedRoles = accessMap[currentPage];
    if (!allowedRoles) return;

    if (!isUserLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    if (!allowedRoles.includes(role)) {
        window.location.href = 'index.html';
    }
}

function disableVisitorInteractions() {
    if (isUserLoggedIn()) return;

    const reactionButtons = document.querySelectorAll('.btn-icon, .btn-invisible, button[onclick*="reaccionar"]');
    reactionButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Debes registrarte e iniciar sesión para reaccionar.');
            window.location.href = 'login.html';
        });
    });

    const commentInputs = document.querySelectorAll('input[placeholder*="coment"], textarea[placeholder*="coment"]');
    commentInputs.forEach(input => {
        input.disabled = true;
        input.placeholder = 'Inicia sesión para comentar';
        input.classList.add('cursor-not-allowed', 'opacity-50');
    });

    const restrictedButtons = document.querySelectorAll('button[id^="btnGuardar"], button[id^="btnPrincipalModalUser"], button[id^="btn-guardar-foto"], button[data-role="admin-action"], button[data-role="author-action"]');
    restrictedButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
        button.addEventListener('click', (event) => {
            event.preventDefault();
            alert('Debes iniciar sesión para usar esta función.');
            window.location.href = 'login.html';
        });
    });
}

async function validarSesionActiva() {
    if (!isUserLoggedIn()) {
        return false;
    }

    try {
        const respuesta = await fetch('../backend/obtener_cuenta.php', {
            method: 'GET',
            credentials: 'include'
        });

        if (!respuesta.ok) {
            localStorage.clear();
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error validando sesión:', error);
        return false;
    }
}

async function applyGuestRestrictions() {
    renderNav();
    renderFooter();

    const currentPage = window.location.pathname.split('/').pop();
    const restrictedPages = [
        'cuenta.html',
        'dashboard_autor.html',
        'dashboard_editor.html',
        'dashboard_admin.html'
    ];

    if (isUserLoggedIn()) {
        const sesionValida = await validarSesionActiva();
        if (!sesionValida) {
            localStorage.clear();
            renderNav();

            if (restrictedPages.includes(currentPage)) {
                alert('Tu sesión ha expirado. Inicia sesión de nuevo.');
                window.location.href = 'login.html';
                return;
            }
        }
    }

    if (restrictedPages.includes(currentPage) && !isUserLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    redirectIfNotAllowed();
    disableVisitorInteractions();
}

document.addEventListener('DOMContentLoaded', applyGuestRestrictions);

window.addEventListener('pageshow', (event) => {
    if (event.persisted || window.performance?.getEntriesByType('navigation')?.[0]?.type === 'back_forward') {
        window.location.reload();
    }
});
