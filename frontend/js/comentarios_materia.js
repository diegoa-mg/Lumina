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
    if (ruta.startsWith('http') || ruta.startsWith('data:') || ruta.startsWith('img/') || ruta.startsWith('uploads/')) {
        return ruta;
    }
    return ruta.replace(/^frontend\//, '');
}

function renderAvatarComentario(fotoUrl, nombre) {
    const foto = resolveFotoComentario(fotoUrl);

    if (foto) {
        return `<img class="w-10 h-10 rounded-full object-cover flex-shrink-0" src="${escapeHtmlComentario(foto)}" alt="${escapeHtmlComentario(nombre)}">`;
    }

    return `
        <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold flex-shrink-0">
            ${escapeHtmlComentario(String(nombre || 'U').charAt(0).toUpperCase())}
        </div>
    `;
}

function renderComentarioMateria(comentario) {
    return `
        <article class="flex gap-3 bg-white border border-gray-200 rounded-xl p-4">
            ${renderAvatarComentario(comentario.foto_url, comentario.usuario)}
            <div class="min-w-0 flex-1">
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p class="font-bold text-gray-900">${escapeHtmlComentario(comentario.usuario)}</p>
                    <p class="text-xs text-gray-500">${escapeHtmlComentario(comentario.fecha)}</p>
                </div>
                <p class="text-sm text-gray-700 leading-relaxed mt-1 break-words">${escapeHtmlComentario(comentario.comentario)}</p>
            </div>
        </article>
    `;
}

async function cargarAvatarComentarioActual() {
    const avatar = document.getElementById('comentarioAvatarActual');
    if (!avatar) return;

    try {
        const respuesta = await fetch('../backend/obtener_cuenta.php', {
            credentials: 'same-origin'
        });
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.ok) return;

        const foto = resolveFotoComentario(datos.usuario?.foto_url || '');
        const nombre = datos.usuario?.nombre || 'Usuario';
        avatar.innerHTML = renderAvatarComentario(foto, nombre);
    } catch (error) {
        console.error('Error cargando avatar de comentario:', error);
    }
}

async function cargarComentariosMateria() {
    const lista = document.getElementById('comentariosLista');
    if (!lista || !window.materiaActual?.id) return;

    lista.innerHTML = '<div class="text-sm text-gray-500 bg-white border border-gray-200 rounded-xl p-4">Cargando comentarios...</div>';

    try {
        const respuesta = await fetch(`../backend/comentarios_materia.php?categoria_id=${encodeURIComponent(window.materiaActual.id)}`, {
            credentials: 'same-origin'
        });
        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.mensaje || 'No se pudieron cargar los comentarios.');
        }

        if (!Array.isArray(datos.comentarios) || datos.comentarios.length === 0) {
            lista.innerHTML = '<div class="text-sm text-gray-500 bg-white border border-dashed border-gray-300 rounded-xl p-4">Aun no hay comentarios en esta materia.</div>';
            return;
        }

        lista.innerHTML = datos.comentarios.map(renderComentarioMateria).join('');
    } catch (error) {
        console.error('Error cargando comentarios:', error);
        lista.innerHTML = '<div class="text-sm text-red-600 bg-white border border-red-100 rounded-xl p-4">No se pudieron cargar los comentarios.</div>';
    }
}

async function publicarComentarioMateria() {
    const input = document.getElementById('comentarioInput');
    const boton = document.getElementById('comentarioEnviar');
    const lista = document.getElementById('comentariosLista');

    if (!input || !boton || !window.materiaActual?.id) return;

    const comentario = input.value.trim();

    if (!comentario) {
        input.focus();
        return;
    }

    boton.disabled = true;

    try {
        const respuesta = await fetch('../backend/comentarios_materia.php', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categoria_id: window.materiaActual.id,
                comentario
            })
        });
        const datos = await respuesta.json();

        if (respuesta.status === 401) {
            window.location.href = 'login.html';
            return;
        }

        if (!respuesta.ok || !datos.ok) {
            throw new Error(datos.mensaje || 'No se pudo publicar el comentario.');
        }

        input.value = '';

        if (lista) {
            const html = renderComentarioMateria(datos.comentario);
            const tieneVacio = !lista.querySelector('article');

            if (tieneVacio) {
                lista.innerHTML = html;
            } else {
                lista.insertAdjacentHTML('afterbegin', html);
            }
        }
    } catch (error) {
        alert(error.message);
    } finally {
        boton.disabled = false;
    }
}

function inicializarComentariosMateria() {
    const input = document.getElementById('comentarioInput');
    const boton = document.getElementById('comentarioEnviar');

    if (boton) {
        boton.addEventListener('click', publicarComentarioMateria);
    }

    if (input) {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                publicarComentarioMateria();
            }
        });
    }

    cargarAvatarComentarioActual();
    cargarComentariosMateria();
}

document.addEventListener('DOMContentLoaded', inicializarComentariosMateria);
