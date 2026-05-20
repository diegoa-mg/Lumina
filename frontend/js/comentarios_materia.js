const MATERIAS_COMENTARIOS = {
    'materia1.php': 1,
    'materia2.php': 2,
    'materia3.php': 3,
    'materia4.php': 4,
    'materia5.php': 5,
    'materia6.php': 6,
    'materia7.php': 7,
    'materia8.php': 8
};

let categoriaComentariosActual = 1;

function escapeHtmlComentario(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function resolveFotoComentario(ruta) {
    if (!ruta) return '';
    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('../')) return ruta;
    return ruta;
}

function obtenerInicialesComentario(nombre) {
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

function formatearFechaComentario(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga-hora');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return fecha;
    return fechaObj.toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function renderAvatarComentario(comentario) {
    const foto = resolveFotoComentario(comentario.foto_url || '');

    if (foto) {
        return `<img src="${escapeHtmlComentario(foto)}" alt="${escapeHtmlComentario(comentario.nombre || 'Usuario')}" class="comentario-avatar-img">`;
    }

    return `<span class="comentario-avatar-iniciales">${escapeHtmlComentario(obtenerInicialesComentario(comentario.nombre))}</span>`;
}

function renderComentarioMateria(comentario) {
    const id = Number(comentario.id || 0);
    const botonEliminar = comentario.puede_eliminar === true
        ? `<button class="comentario-eliminar" title="Borrar comentario" onclick="eliminarComentarioMateria(${id})">
                <span class="material-symbols-outlined">delete</span>
            </button>`
        : '';

    return `
        <article class="comentario-card">
            <div class="comentario-avatar">
                ${renderAvatarComentario(comentario)}
            </div>
            <div class="comentario-contenido">
                <div class="comentario-header">
                    <strong>${escapeHtmlComentario(comentario.nombre || 'Usuario')}</strong>
                    <span data-fecha-iso="${escapeHtmlComentario(comentario.fecha_creacion || '')}" data-fecha-formato="larga-hora">${escapeHtmlComentario(formatearFechaComentario(comentario.fecha_creacion))}</span>
                    ${botonEliminar}
                </div>
                <p>${escapeHtmlComentario(comentario.comentario || '')}</p>
            </div>
        </article>
    `;
}

async function eliminarComentarioMateria(comentarioId) {
    if (!confirm('¿Borrar este comentario? Esta acción no se puede deshacer.')) return;

    try {
        const respuesta = await fetch('../backend/eliminar_comentario_materia.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ comentario_id: comentarioId })
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.error || 'No se pudo borrar el comentario');
        }

        await cargarComentariosMateria(categoriaComentariosActual);
    } catch (error) {
        console.error(error);
        alert(error.message || 'No se pudo borrar el comentario');
    }
}

async function cargarComentariosMateria(categoriaId) {
    categoriaComentariosActual = categoriaId;

    const lista = document.getElementById('listaComentariosMateria');
    if (!lista) return;

    lista.innerHTML = `<div class="comentarios-vacio" data-i18n="comentarios.cargando">${typeof t === 'function' ? t('comentarios.cargando') : 'Cargando comentarios...'}</div>`;

    try {
        const respuesta = await fetch(`../backend/obtener_comentarios_materia.php?categoria_id=${categoriaId}`);
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.error || (typeof t === 'function' ? t('alert.no_cargar_comentarios') : 'No se pudieron cargar los comentarios.'));
        }

        const comentarios = Array.isArray(resultado.comentarios)
            ? resultado.comentarios
            : [];

        if (comentarios.length === 0) {
            lista.innerHTML = `<div class="comentarios-vacio" data-i18n="comentarios.vacio">${typeof t === 'function' ? t('comentarios.vacio') : 'Todavía no hay comentarios en esta materia.'}</div>`;
            return;
        }

        lista.innerHTML = comentarios.map(renderComentarioMateria).join('');

        if (typeof aplicarTraducciones === 'function') {
            aplicarTraducciones(lista);
        }
    } catch (error) {
        console.error(error);
        lista.innerHTML = `<div class="comentarios-vacio" data-i18n="alert.no_cargar_comentarios">${typeof t === 'function' ? t('alert.no_cargar_comentarios') : 'No se pudieron cargar los comentarios.'}</div>`;
    }
}

async function publicarComentarioMateria(categoriaId) {
    const input = document.getElementById('inputComentarioMateria');
    const boton = document.getElementById('btnPublicarComentarioMateria');
    if (!input || !boton) return;

    const comentario = input.value.trim();
    if (!comentario) {
        input.focus();
        return;
    }

    boton.disabled = true;

    try {
        const respuesta = await fetch('../backend/publicar_comentario_materia.php', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoria_id: categoriaId,
                comentario
            })
        });
        const resultado = await respuesta.json();

        if (!respuesta.ok || !resultado.success) {
            throw new Error(resultado.error || 'No se pudo publicar el comentario');
        }

        input.value = '';
        await cargarComentariosMateria(categoriaId);
    } catch (error) {
        console.error(error);
        alert(error.message || 'No se pudo publicar el comentario');
    } finally {
        boton.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const archivo = window.location.pathname.split('/').pop();
    const categoriaId = MATERIAS_COMENTARIOS[archivo] || 1;
    const input = document.getElementById('inputComentarioMateria');
    const boton = document.getElementById('btnPublicarComentarioMateria');

    cargarComentariosMateria(categoriaId);

    if (boton) {
        boton.addEventListener('click', () => publicarComentarioMateria(categoriaId));
    }

    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                publicarComentarioMateria(categoriaId);
            }
        });
    }
});

document.addEventListener('lumina-idioma-cambiado', () => {
    cargarComentariosMateria(categoriaComentariosActual);
});
