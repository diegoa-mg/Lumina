document.addEventListener('click', (e) => {
    const menuDropdown = document.getElementById('menu-dropdown');
    const btnCuenta = document.getElementById('btn-cuenta');

    if (btnCuenta && btnCuenta.contains(e.target)) {
        e.preventDefault();
        menuDropdown.classList.toggle('show');
    } else if (menuDropdown && !menuDropdown.contains(e.target)) {
        menuDropdown.classList.remove('show');
    }
});

const searchInput = document.querySelector('.search');

if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter') return;
        const q = searchInput.value.trim();
        if (!q) return;
        window.location.href = `busqueda.html?q=${encodeURIComponent(q)}`;
    });
}