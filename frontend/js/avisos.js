function escapeHtml(valor) {
    return String(valor ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function formatearFechaAviso(fecha) {
    if (typeof formatearFechaLumina === 'function') return formatearFechaLumina(fecha, 'larga');
    if (!fecha) return '';
    const fechaObj = new Date(String(fecha).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return '';
    return fechaObj.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

function obtenerConfigAviso(tipoAviso) {
    if (tipoAviso === 'plataforma') {
        return {
            texto: 'Plataforma',
            clave: 'crear.tipo_plataforma',
            icono: 'language',
            clase: 'bg-rojo2'
        };
    }

    return {
        texto: 'Academico',
        clave: 'crear.tipo_academico',
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
                    <p class="fecha"><span data-i18n="avisos.publicado_el">Publicado el</span> <span data-fecha-iso="${escapeHtml(fecha || '')}" data-fecha-formato="larga">${escapeHtml(formatearFechaAviso(fecha))}</span></p>
                </div>

                ${urgente ? '<div class="badge-urgente" data-i18n="crear.opcion_urgente">Urgente</div>' : ''}
            </div>

            <div class="tarjeta-body">
                <p>${escapeHtml(aviso.descripcion)}</p>
            </div>

            <div class="tarjeta-footer">
                <div class="linea-negra"></div>
                <span class="material-symbols-outlined icono-etiqueta">${config.icono}</span>
                <div class="etiqueta-blanca" data-i18n="${config.clave}">${config.texto}</div>
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
            contenedor.innerHTML = '<div class="avisos-vacio" data-i18n="avisos.sin_avisos">No hay avisos publicados por ahora.</div>';
            if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);
            return;
        }

        contenedor.innerHTML = avisos.map(renderAviso).join('');
        if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);
    } catch (error) {
        console.error('Error al cargar avisos:', error);
        contenedor.innerHTML = '<div class="avisos-vacio" data-i18n="avisos.no_se_cargaron">No se pudieron cargar los avisos.</div>';
        if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);
    }
}

document.addEventListener('DOMContentLoaded', cargarAvisos);
