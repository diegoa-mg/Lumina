function escapeHtml(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatearFechaAviso(fecha) {
    if (!fecha) return 'Fecha no disponible';

    const fechaObj = new Date(String(fecha).replace(' ', 'T'));

    if (Number.isNaN(fechaObj.getTime())) {
        return 'Fecha no disponible';
    }

    return fechaObj.toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function obtenerConfigAviso(tipoAviso) {
    if (tipoAviso === 'plataforma') {
        return {
            texto: 'Plataforma',
            icono: 'language',
            clase: 'bg-rojo3'
        };
    }

    return {
        texto: 'Academico',
        icono: 'school',
        clase: 'bg-rojo'
    };
}

function renderAviso(aviso) {
    const tipoAviso = aviso.tipo_aviso || 'academico';
    const config = obtenerConfigAviso(tipoAviso);
    const fecha = aviso.fecha_publicacion || aviso.fecha_creacion;
    const urgente = Number(aviso.urgente || 0) === 1;

    return `
        <article class="tarjeta-aviso">
            <div class="tarjeta-header">
                <div class="icono-principal ${config.clase}">
                    <span class="material-symbols-outlined">${config.icono}</span>
                </div>

                <div class="titulos">
                    <h2>${escapeHtml(aviso.titulo)}</h2>
                    <p class="fecha">Publicado el ${escapeHtml(formatearFechaAviso(fecha))}</p>
                </div>

                ${urgente ? '<div class="badge-urgente">Urgente</div>' : ''}
            </div>

            <div class="tarjeta-body">
                <p>${escapeHtml(aviso.descripcion)}</p>
            </div>

            <div class="tarjeta-footer">
                <div class="linea-negra"></div>
                <span class="material-symbols-outlined icono-etiqueta">${config.icono}</span>
                <div class="etiqueta-blanca">${config.texto}</div>
            </div>
        </article>
    `;
}

async function cargarAvisos() {
    const contenedor = document.getElementById('listaAvisos');

    if (!contenedor) return;

    try {
        const respuesta = await fetch('../backend/obtener_avisos.php');
        const avisos = await respuesta.json();

        if (!Array.isArray(avisos) || avisos.length === 0) {
            contenedor.innerHTML = '<div class="avisos-vacio">No hay avisos publicados por ahora.</div>';
            return;
        }

        contenedor.innerHTML = avisos.map(renderAviso).join('');
    } catch (error) {
        console.error('Error al cargar avisos:', error);
        contenedor.innerHTML = '<div class="avisos-vacio">No se pudieron cargar los avisos.</div>';
    }
}

document.addEventListener('DOMContentLoaded', cargarAvisos);
