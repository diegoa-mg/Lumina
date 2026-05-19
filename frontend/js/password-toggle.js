document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-password-toggle]').forEach((boton) => {
        const inputId = boton.dataset.passwordToggle;
        const input = document.getElementById(inputId);
        const icono = boton.querySelector('.material-symbols-outlined');

        if (!input || !icono) return;

        boton.addEventListener('click', () => {
            const mostrar = input.type === 'password';

            input.type = mostrar ? 'text' : 'password';
            icono.textContent = mostrar ? 'visibility_off' : 'visibility';
            boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
            boton.setAttribute('aria-pressed', String(mostrar));
        });
    });
});
