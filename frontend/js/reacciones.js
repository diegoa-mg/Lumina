function aplicarEstadoReaccion(boton, tipo, activo) {
    const clase = tipo === 'like' ? 'like-activo' : 'save-activo';
    boton.classList.toggle(clase, activo);
    boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
}

function registrarBotonReaccion(boton, id, seccion, tipo) {
    boton.dataset.reaccionId = String(id);
    boton.dataset.reaccionSeccion = seccion || 'recursos';
    boton.dataset.reaccionTipo = tipo;
}

async function reaccionar(boton, id, seccion, tipo) {
    if (!boton || boton.dataset.reaccionBusy === '1') return;

    registrarBotonReaccion(boton, id, seccion, tipo);
    boton.dataset.reaccionBusy = '1';
    boton.classList.add('animar-click');

    const estadoAnterior = tipo === 'like'
        ? boton.classList.contains('like-activo')
        : boton.classList.contains('save-activo');

    aplicarEstadoReaccion(boton, tipo, !estadoAnterior);

    window.setTimeout(() => {
        boton.classList.remove('animar-click');
    }, 300);

    const datos = new FormData();
    datos.append('elemento_id', id);
    datos.append('seccion', seccion || 'recursos');
    datos.append('tipo', tipo);

    try {
        const respuesta = await fetch('../backend/reacciones.php', {
            method: 'POST',
            credentials: 'same-origin',
            body: datos
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.ok) {
            throw new Error(resultado.mensaje || 'No se pudo guardar la reaccion.');
        }

        aplicarEstadoReaccion(boton, tipo, resultado.activo);

        document.dispatchEvent(new CustomEvent('lumina:reaccion-cambiada', {
            detail: resultado
        }));
    } catch (error) {
        aplicarEstadoReaccion(boton, tipo, estadoAnterior);

        if (String(error.message || '').toLowerCase().includes('sesion')) {
            window.location.href = 'login.html';
            return;
        }

        console.error('Error en la reaccion:', error);
    } finally {
        boton.dataset.reaccionBusy = '0';
    }
}

async function inicializarReacciones(root = document) {
    const botones = Array.from(root.querySelectorAll('[data-reaccion-id]'));
    const ids = [...new Set(botones.map((boton) => boton.dataset.reaccionId).filter(Boolean))];

    if (ids.length === 0) return;

    const seccion = botones[0]?.dataset.reaccionSeccion || 'recursos';

    try {
        const respuesta = await fetch(
            `../backend/obtener_reacciones.php?accion=estado&seccion=${encodeURIComponent(seccion)}&ids=${ids.join(',')}`,
            { credentials: 'same-origin' }
        );
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.ok) return;

        botones.forEach((boton) => {
            const id = boton.dataset.reaccionId;
            const tipo = boton.dataset.reaccionTipo;
            const activo = Boolean(resultado.reacciones?.[id]?.[tipo]);
            aplicarEstadoReaccion(boton, tipo, activo);
        });
    } catch (error) {
        console.error('Error cargando estados de reacciones:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => inicializarReacciones());
