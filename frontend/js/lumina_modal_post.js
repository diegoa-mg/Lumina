// Modal compartido para "Leer mas" de las tarjetas .lumina-post-card.
// El contenido completo se guarda dentro de cada tarjeta en .lumina-post-completo
// y se inyecta en el modal al pulsar el boton .lumina-post-cta (no enlace).

(function () {
    let modalElement = null;
    let modalContent = null;

    function asegurarModal() {
        if (modalElement) return;

        modalElement = document.createElement('div');
        modalElement.className = 'lumina-modal-overlay';
        modalElement.innerHTML = `
            <div class="lumina-modal-box" role="dialog" aria-modal="true">
                <button class="lumina-modal-close" type="button" aria-label="Cerrar">&times;</button>
                <div class="lumina-modal-content"></div>
            </div>
        `;
        document.body.appendChild(modalElement);

        modalContent = modalElement.querySelector('.lumina-modal-content');
        modalElement.querySelector('.lumina-modal-close').addEventListener('click', cerrarModalLumina);
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) cerrarModalLumina();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') cerrarModalLumina();
        });
    }

    function abrirModalLumina(html, card) {
        asegurarModal();
        modalContent.innerHTML = html;
        modalElement.classList.add('visible');
        document.body.style.overflow = 'hidden';

        // Sincroniza el estado activo (like/guardado) tomando los botones
        // visibles de la tarjeta como fuente de verdad. Esto evita el desfase
        // mientras se resuelve el fetch async de inicializarReacciones.
        if (card) {
            const sincronizar = (tipo, claseActivo) => {
                const cardBtn = card.querySelector(`.lumina-post-body [data-reaccion-tipo="${tipo}"]`);
                const modalBtn = modalContent.querySelector(`[data-reaccion-tipo="${tipo}"]`);
                if (!cardBtn || !modalBtn) return;
                modalBtn.classList.toggle(claseActivo, cardBtn.classList.contains(claseActivo));
                modalBtn.setAttribute('aria-pressed', cardBtn.classList.contains(claseActivo) ? 'true' : 'false');
            };
            sincronizar('like', 'like-activo');
            sincronizar('guardado', 'save-activo');
        }

        if (typeof inicializarReacciones === 'function') {
            inicializarReacciones(modalContent);
        }

        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(modalContent);
        }
    }

    function cerrarModalLumina() {
        if (!modalElement) return;
        modalElement.classList.remove('visible');
        document.body.style.overflow = '';
        // Limpia el contenido para detener videos/iframes embebidos.
        window.setTimeout(() => {
            if (modalContent && !modalElement.classList.contains('visible')) {
                modalContent.innerHTML = '';
            }
        }, 260);
    }

    function activarModalesLumina(contenedor) {
        const raiz = contenedor || document;
        const botones = raiz.querySelectorAll('button.lumina-post-cta');

        botones.forEach((boton) => {
            if (boton.dataset.modalListo === '1') return;
            boton.dataset.modalListo = '1';

            boton.addEventListener('click', () => {
                const card = boton.closest('.lumina-post-card');
                if (!card) return;
                const completo = card.querySelector('.lumina-post-completo');
                if (!completo) return;
                abrirModalLumina(completo.innerHTML, card);
            });
        });
    }

    window.activarModalesLumina = activarModalesLumina;

    document.addEventListener('DOMContentLoaded', () => activarModalesLumina(document));
})();
