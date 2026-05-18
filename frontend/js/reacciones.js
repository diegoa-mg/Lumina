const CLASE_REACCION = {
    like: 'like-activo',
    guardado: 'save-activo'
};

function llaveReaccion(id, seccion, tipo) {
    return `${Number(id)}|${seccion || 'recursos'}|${tipo}`;
}

function aplicarEstadoReaccion(boton, activo) {
    const tipo = boton.dataset.reaccionTipo;
    const clase = CLASE_REACCION[tipo];

    if (!clase) return;

    boton.classList.toggle(clase, Boolean(activo));
    boton.setAttribute('aria-pressed', activo ? 'true' : 'false');
}

function prepararBotonReaccion(boton) {
    if (!boton || boton.dataset.reaccionPreparada === '1') return;

    boton.dataset.reaccionPreparada = '1';
    boton.type = 'button';
    boton.onclick = null;

    boton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        reaccionar(
            boton,
            boton.dataset.reaccionId,
            boton.dataset.reaccionSeccion || 'recursos',
            boton.dataset.reaccionTipo
        );
    });
}

async function reaccionar(boton, id, seccion = 'recursos', tipo = '') {
    if (!boton || boton.dataset.reaccionEnviando === '1') return;

    const elementoId = Number(id);
    const tipoNormalizado = String(tipo || '').toLowerCase();
    const seccionNormalizada = String(seccion || 'recursos').toLowerCase();

    if (!elementoId || !CLASE_REACCION[tipoNormalizado]) return;

    boton.dataset.reaccionId = String(elementoId);
    boton.dataset.reaccionSeccion = seccionNormalizada;
    boton.dataset.reaccionTipo = tipoNormalizado;
    boton.dataset.reaccionEnviando = '1';
    boton.classList.add('animar-click');

    window.setTimeout(() => {
        boton.classList.remove('animar-click');
    }, 300);

    try {
        const datos = new FormData();
        datos.append('elemento_id', String(elementoId));
        datos.append('seccion', seccionNormalizada);
        datos.append('tipo', tipoNormalizado);

        const respuesta = await fetch('../backend/reacciones.php', {
            method: 'POST',
            credentials: 'include',
            body: datos
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.error || 'No se pudo guardar la reaccion');
        }

        aplicarEstadoReaccion(boton, resultado.active);
    } catch (error) {
        console.error('Error en la reaccion:', error);
        alert(error.message || 'No se pudo guardar la reaccion');
    } finally {
        boton.dataset.reaccionEnviando = '0';
    }
}

async function inicializarReacciones(root = document) {
    const botones = Array.from(root.querySelectorAll('[data-reaccion-id][data-reaccion-tipo]'));

    botones.forEach(prepararBotonReaccion);

    if (botones.length === 0) return;

    try {
        const respuesta = await fetch('../backend/obtener_reacciones_usuario.php', {
            credentials: 'include'
        });
        const resultado = await respuesta.json();

        if (!resultado.success || !Array.isArray(resultado.reacciones)) return;

        const activas = new Set(
            resultado.reacciones.map((reaccion) => {
                return llaveReaccion(reaccion.elemento_id, reaccion.seccion, reaccion.tipo);
            })
        );

        botones.forEach((boton) => {
            const activa = activas.has(
                llaveReaccion(
                    boton.dataset.reaccionId,
                    boton.dataset.reaccionSeccion || 'recursos',
                    boton.dataset.reaccionTipo
                )
            );
            aplicarEstadoReaccion(boton, activa);
        });
    } catch (error) {
        console.error('Error al inicializar reacciones:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarReacciones(document);
});
