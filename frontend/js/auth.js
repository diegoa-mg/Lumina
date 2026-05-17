function isUserLoggedIn() {
    return localStorage.getItem('sesion_activa') === 'true';
}

function getUserRole() {
    return localStorage.getItem('user_role') || 'Usuario';
}

function renderNav() {
    const nav = document.querySelector('.nav-principal');
    if (!nav) return;

    if (isUserLoggedIn()) {
        const userRole = getUserRole();
        const panelLinks = [];

        if (userRole === 'Autor' || userRole === 'Administrador') {
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
            <div class="dropdown-container">
                <button id="btn-cuenta" class="btn-cuenta-estilo">
                    <span>Cuenta</span>
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
    } else {
        nav.innerHTML = `
            <a href="index.html">Inicio</a>
            <a href="login.html">Iniciar Sesión</a>
        `;
    }
}

function redirectIfNotAllowed() {
    const currentPage = window.location.pathname.split('/').pop();
    const role = getUserRole();
    const accessMap = {
        'cuenta.html': ['Usuario', 'Autor', 'Editor', 'Administrador'],
        'dashboard_autor.html': ['Autor', 'Administrador'],
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

function applyGuestRestrictions() {
    renderNav();
    redirectIfNotAllowed();
    disableVisitorInteractions();
}

document.addEventListener('DOMContentLoaded', applyGuestRestrictions);

window.addEventListener('pageshow', (event) => {
    if (event.persisted || window.performance?.getEntriesByType('navigation')?.[0]?.type === 'back_forward') {
        window.location.reload();
    }
});
