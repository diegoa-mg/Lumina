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