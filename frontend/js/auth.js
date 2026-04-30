document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav-principal');
    if (!nav) return; // Seguridad por si una página no tiene nav

    const estaLogueado = localStorage.getItem('sesion_activa');
    const userRole = localStorage.getItem('user_role');

    if (estaLogueado === 'true') {
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
                    <a href="dashboard_autor.html" class="autor-opt">Panel Autor</a>
                    <a href="dashboard_editor.html" class="autor-opt">Panel Editor</a>
                    <a href="dashboard_admin.html" class="admin-opt">Panel Admin</a> 
                    <hr>
                    <a href="#" id="cerrar-sesion" class="logout">Cerrar Sesión</a>
                </div>
            </div>
        `;
        
        // Configurar botón de cerrar sesión inmediatamente después de inyectar
        document.getElementById('cerrar-sesion').addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = 'index.html';
        });
    } else {
        nav.innerHTML = `
            <a href="index.html">Inicio</a>
            <a href="login.html">Iniciar Sesión</a>
        `;
    }
});