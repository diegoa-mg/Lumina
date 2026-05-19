// ============================================
// VARIABLES GLOBALES
// ============================================

const modal = document.getElementById('modalAdmin');
const btnOpen = document.getElementById('btnAbrirModal');
const btnClose = document.getElementById('btnCerrar');
const btnCerrarSecundario = document.querySelectorAll('.btnCerrarSecundario');
const fileInput = document.getElementById('fileInput');
const btnVolver = document.querySelector('.btnVolver');
const btnVolverSelector = document.querySelectorAll('.btnVolverSelector');
const btnCrearPost = document.getElementById('btnCrearPost');
const btnCrearAviso = document.getElementById('btnCrearAviso');
const postTipoSelect = document.getElementById('postTipo');
const campoYoutube = document.querySelector('.campo-youtube');
const campoNoticia = document.querySelector('.campo-noticia');

let archivoSeleccionado = null;
let enviando = false;
let postEditando = null;
let modoPublicacion = 'post';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const FORMATOS_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp'
];

const CONFIG_AVISOS = {
    academico: {
        texto: 'Academico',
        icono: 'school',
        clase: 'bg-rojo'
    },
    plataforma: {
        texto: 'Plataforma',
        icono: 'language',
        clase: 'bg-rojo2'
    }
};

function actualizarCamposTipoPost() {
    const tipo = (postTipoSelect?.value || 'articulo').toLowerCase();

    campoYoutube?.classList.toggle('d-none', tipo !== 'video');
    campoNoticia?.classList.toggle('d-none', tipo !== 'noticia');
}

// ============================================
// NAVEGACION MODAL
// ============================================

function mostrarPantalla(idPantalla) {
    [
        'pantallaSelector',
        'pantalla2',
        'pantallaAviso'
    ].forEach((id) => {
        const pantalla = document.getElementById(id);

        if (!pantalla) return;

        pantalla.classList.toggle('d-none', id !== idPantalla);
    });
}

if (btnOpen) {
    btnOpen.onclick = () => {
        postEditando = null;
        resetearFormulario();
        modal.style.display = 'flex';
    };
}

if (btnClose) {
    btnClose.onclick = cerrarModal;
}

btnCerrarSecundario.forEach((boton) => {
    boton.onclick = cerrarModal;
});

if (btnCrearPost) {
    btnCrearPost.onclick = () => {
        modoPublicacion = 'post';
        actualizarEstadoPreviewImagenPost(Boolean(archivoSeleccionado));
        mostrarPantalla('pantalla2');
    };
}

if (btnCrearAviso) {
    btnCrearAviso.onclick = () => {
        modoPublicacion = 'aviso';
        mostrarPantalla('pantallaAviso');
        actualizarPreviewAviso();
    };
}

btnVolverSelector.forEach((boton) => {
    boton.onclick = () => {
        mostrarPantalla('pantallaSelector');
    };
});

if (btnVolver) {
    btnVolver.onclick = () => {
        mostrarPantalla('pantallaSelector');
    };
}

window.onclick = (event) => {
    if (event.target == modal) {
        cerrarModal();
    }
};

// ============================================
// INPUT IMAGEN
// ============================================

if (fileInput) {
    fileInput.onchange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        if (file.size > MAX_IMAGE_SIZE) {
            alert('Imagen muy pesada');
            return;
        }

        if (!FORMATOS_PERMITIDOS.includes(file.type)) {
            alert('Formato invalido');
            return;
        }

        procesarImagen(file);
    };
}

function procesarImagen(file) {
    archivoSeleccionado = file;

    const reader = new FileReader();

    reader.onload = (event) => {
        const previewId = modoPublicacion === 'aviso'
            ? 'avisoImgPreview'
            : 'imgPreview';
        const fileNameId = modoPublicacion === 'aviso'
            ? 'avisoFileNameDisplay'
            : 'fileNameDisplay';

        document.getElementById(previewId).src = event.target.result;
        document.getElementById(fileNameId).textContent = file.name;

        if (modoPublicacion === 'aviso') {
            actualizarEstadoPreviewImagenAviso(true);
        }

        if (modoPublicacion !== 'aviso') {
            actualizarEstadoPreviewImagenPost(true);
        }
    };

    reader.readAsDataURL(file);
}

// ============================================
// VALIDACION Y DATOS
// ============================================

function obtenerCamposActuales() {
    if (modoPublicacion === 'aviso') {
        const importante = document.getElementById('avisoImportante')?.checked === true;

        return {
            titulo: document.getElementById('avisoTitle').value.trim(),
            descripcion: document.getElementById('avisoDesc').value.trim(),
            tipo: 'articulo',
            categoria_id: '9',
            seccion: 'aviso',
            tipo_aviso: document.getElementById('avisoTipo').value || 'academico',
            urgente: document.getElementById('avisoUrgente').value === '1',
            importante
        };
    }

    return {
        titulo: document.getElementById('postTitle').value.trim(),
        descripcion: document.getElementById('postDesc').value.trim(),
        tipo: document.getElementById('postTipo')?.value || 'articulo',
        categoria_id: document.getElementById('postMateria')?.value || '1',
        youtube_url: document.getElementById('youtubeUrl')?.value.trim() || '',
        noticia_url: document.getElementById('noticiaUrl')?.value.trim() || '',
        seccion: 'post',
        tipo_aviso: 'academico',
        urgente: false,
        importante: false
    };
}

function validarCampos() {
    const datos = obtenerCamposActuales();

    if (!datos.titulo || !datos.descripcion) {
        alert('Completa todos los campos');
        return false;
    }

    if (datos.seccion === 'post' && !archivoSeleccionado && !postEditando) {
        alert('Los posts requieren una imagen adjunta');
        return false;
    }

    if (datos.seccion === 'post' && datos.tipo === 'video' && !datos.youtube_url) {
        alert('Debes agregar un link de YouTube');
        return false;
    }

    if (datos.seccion === 'post' && datos.tipo === 'noticia' && !datos.noticia_url) {
        alert('Debes agregar un link de noticia');
        return false;
    }

    if (datos.seccion === 'aviso' && datos.importante && !archivoSeleccionado && !postEditando) {
        alert('Los avisos importantes requieren una imagen adjunta');
        return false;
    }

    return true;
}

function convertirABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// CREAR / EDITAR PUBLICACION
// ============================================

async function manejarPublicacion(estado) {
    if (!validarCampos()) return;
    if (enviando) return;

    enviando = true;

    try {
        const datos = obtenerCamposActuales();
        let imagenBase64 = null;

        if (archivoSeleccionado && (datos.seccion !== 'aviso' || datos.importante)) {
            imagenBase64 = await convertirABase64(archivoSeleccionado);
        }

        const payload = {
            ...datos,
            imagen: imagenBase64,
            status: estado
        };

        if (postEditando) {
            payload.post_id = postEditando;
        }

        const respuesta = await fetch(
            postEditando
                ? '../backend/editar_post.php'
                : '../backend/publicar.php',
            {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            }
        );

        const resultado = await respuesta.json();

        if (resultado.success) {
            alert(postEditando ? 'Publicacion actualizada' : 'Publicacion creada');
            location.reload();
        } else {
            alert(resultado.error);
        }
    } catch (error) {
        console.error(error);
        alert('Error al guardar');
    } finally {
        enviando = false;
    }
}

// ============================================
// BOTONES
// ============================================

const btnGuardar = document.getElementById('btnGuardarBorrador');
const btnRevision = document.getElementById('btnEnviarRevision');
const btnGuardarAviso = document.getElementById('btnGuardarAviso');
const btnAvisoRevision = document.getElementById('btnEnviarAvisoRevision');

if (btnGuardar) {
    btnGuardar.onclick = () => {
        modoPublicacion = 'post';
        manejarPublicacion('borrador');
    };
}

if (btnRevision) {
    btnRevision.onclick = () => {
        modoPublicacion = 'post';
        manejarPublicacion('revision');
    };
}

if (btnGuardarAviso) {
    btnGuardarAviso.onclick = () => {
        modoPublicacion = 'aviso';
        manejarPublicacion('borrador');
    };
}

if (btnAvisoRevision) {
    btnAvisoRevision.onclick = () => {
        modoPublicacion = 'aviso';
        manejarPublicacion('revision');
    };
}

// ============================================
// EDICION
// ============================================

function prepararEdicion(boton) {
    const tarjeta = boton.closest('.tarjeta-horizontal');

    if (!tarjeta) return;

    const id = tarjeta.dataset.postId;
    const titulo = tarjeta.dataset.titulo;
    const descripcion = tarjeta.dataset.descripcion;
    const imagen = tarjeta.dataset.imagen;
    const tipo = tarjeta.dataset.tipo;
    const categoriaId = tarjeta.dataset.categoriaId;
    const seccion = tarjeta.dataset.seccion || 'post';
    const status = tarjeta.dataset.status || '';
    const tipoAviso = tarjeta.dataset.tipoAviso || 'academico';
    const urgente = tarjeta.dataset.urgente === '1';
    const importante = tarjeta.dataset.importante === '1';
    const youtubeUrl = tarjeta.dataset.youtubeUrl || '';
    const noticiaUrl = tarjeta.dataset.noticiaUrl || '';

    postEditando = id;
    modoPublicacion = seccion;

    document.querySelectorAll('.modal-title').forEach((tituloModal) => {
        tituloModal.textContent = seccion === 'aviso'
            ? 'Editar aviso'
            : 'Editar post';
    });

    if (seccion === 'aviso') {
        document.getElementById('avisoTitle').value = titulo || '';
        document.getElementById('avisoDesc').value = descripcion || '';
        document.getElementById('avisoTipo').value = tipoAviso;
        document.getElementById('avisoUrgente').value = urgente ? '1' : '0';
        const avisoImportanteInput = document.getElementById('avisoImportante');

        if (avisoImportanteInput) {
            avisoImportanteInput.checked = importante;
        }

        const avisoImgPreview = document.getElementById('avisoImgPreview');

        if (avisoImgPreview && imagen) {
            avisoImgPreview.src = typeof resolveImageSrc === 'function'
                ? resolveImageSrc(imagen)
                : imagen;
        }

        const avisoFileNameDisplay = document.getElementById('avisoFileNameDisplay');

        if (avisoFileNameDisplay && imagen) {
            avisoFileNameDisplay.textContent = 'Imagen actual';
        }

        if (imagen) {
            actualizarEstadoPreviewImagenAviso(true);
        }

        actualizarPreviewAviso();
    } else {
        document.getElementById('postTitle').value = titulo || '';
        document.getElementById('postDesc').value = descripcion || '';

        const tipoSelect = document.getElementById('postTipo');

        if (tipoSelect) {
            tipoSelect.value = tipo || 'articulo';
        }

        const youtubeInput = document.getElementById('youtubeUrl');
        const noticiaInput = document.getElementById('noticiaUrl');

        if (youtubeInput) {
            youtubeInput.value = youtubeUrl;
        }

        if (noticiaInput) {
            noticiaInput.value = noticiaUrl;
        }

        actualizarCamposTipoPost();

        const materiaSelect = document.getElementById('postMateria');

        if (materiaSelect) {
            materiaSelect.value = categoriaId || '1';
        }

        const imgPreview = document.getElementById('imgPreview');

        if (imgPreview && imagen) {
            imgPreview.src = typeof resolveImageSrc === 'function'
                ? resolveImageSrc(imagen)
                : imagen;
        }

        document.getElementById('fileNameDisplay').textContent = imagen
            ? 'Imagen actual'
            : 'Selecciona una imagen';
        actualizarEstadoPreviewImagenPost(Boolean(imagen));
    }

    modal.style.display = 'flex';
    mostrarPantalla(seccion === 'aviso' ? 'pantallaAviso' : 'pantalla2');

    // El boton de revision solo aparece si la publicacion es borrador o rechazada.
    const puedeEnviarRevision = status === 'borrador' || status === 'rechazado';

    if (seccion === 'aviso') {
        document.getElementById('btnGuardarAviso').textContent = 'Guardar cambios';
        document.getElementById('btnEnviarAvisoRevision').style.display = puedeEnviarRevision ? 'block' : 'none';
    } else {
        document.getElementById('btnGuardarBorrador').textContent = 'Guardar cambios';
        document.getElementById('btnEnviarRevision').style.display = puedeEnviarRevision ? 'block' : 'none';
    }
}

// ============================================
// PREVIEW AVISO
// ============================================

function actualizarPreviewAviso() {
    const titulo = document.getElementById('avisoTitle')?.value.trim();
    const descripcion = document.getElementById('avisoDesc')?.value.trim();
    const tipo = document.getElementById('avisoTipo')?.value || 'academico';
    const urgente = document.getElementById('avisoUrgente')?.value === '1';
    const importante = document.getElementById('avisoImportante')?.checked === true;
    const config = CONFIG_AVISOS[tipo] || CONFIG_AVISOS.academico;

    const previewTitulo = document.getElementById('avisoPreviewTitulo');
    const previewDesc = document.getElementById('avisoPreviewDesc');
    const previewTipo = document.getElementById('avisoPreviewTipo');
    const previewUrgente = document.getElementById('avisoPreviewUrgente');
    const iconoTexto = document.getElementById('avisoIconoTexto');
    const footerIcono = document.getElementById('avisoFooterIcono');
    const iconoPreview = document.getElementById('avisoIconoPreview');
    const previewNormal = document.getElementById('avisoPreviewNormal');
    const previewImportante = document.getElementById('avisoPreviewImportante');
    const btnCambiarImagenAviso = document.getElementById('btnCambiarImagenAviso');

    if (previewNormal) {
        previewNormal.classList.toggle('d-none', importante);
    }

    if (previewImportante) {
        previewImportante.classList.toggle('d-none', !importante);
    }

    if (btnCambiarImagenAviso) {
        btnCambiarImagenAviso.classList.toggle('d-none', !importante);
    }

    if (previewTitulo) {
        previewTitulo.textContent = titulo || 'Titulo del aviso';
    }

    if (previewDesc) {
        previewDesc.textContent = descripcion || 'La descripcion del aviso aparecera aqui.';
    }

    if (previewTipo) {
        previewTipo.textContent = config.texto;
    }

    if (previewUrgente) {
        previewUrgente.classList.toggle('d-none', !urgente);
    }

    if (iconoTexto) {
        iconoTexto.textContent = config.icono;
    }

    if (footerIcono) {
        footerIcono.textContent = config.icono;
    }

    if (iconoPreview) {
        iconoPreview.classList.remove('bg-rojo', 'bg-rojo2');
        iconoPreview.classList.add(config.clase);
    }
}

[
    'avisoTitle',
    'avisoDesc',
    'avisoTipo',
    'avisoUrgente',
    'avisoImportante'
].forEach((id) => {
    const elemento = document.getElementById(id);

    if (!elemento) return;

    elemento.addEventListener('input', actualizarPreviewAviso);
    elemento.addEventListener('change', actualizarPreviewAviso);
});

postTipoSelect?.addEventListener('change', actualizarCamposTipoPost);

// ============================================
// RESET / CERRAR
// ============================================

function resetearFormulario() {
    postEditando = null;
    archivoSeleccionado = null;
    modoPublicacion = 'post';

    const postTitle = document.getElementById('postTitle');
    const postDesc = document.getElementById('postDesc');
    const avisoTitle = document.getElementById('avisoTitle');
    const avisoDesc = document.getElementById('avisoDesc');
    const avisoImportante = document.getElementById('avisoImportante');
    const imgPreview = document.getElementById('imgPreview');
    const avisoImgPreview = document.getElementById('avisoImgPreview');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const avisoFileNameDisplay = document.getElementById('avisoFileNameDisplay');
    const youtubeInput = document.getElementById('youtubeUrl');
    const noticiaInput = document.getElementById('noticiaUrl');

    if (postTitle) postTitle.value = '';
    if (postDesc) postDesc.value = '';
    if (avisoTitle) avisoTitle.value = '';
    if (avisoDesc) avisoDesc.value = '';
    if (avisoImportante) avisoImportante.checked = false;
    if (youtubeInput) youtubeInput.value = '';
    if (noticiaInput) noticiaInput.value = '';
    if (imgPreview) imgPreview.src = '';
    if (avisoImgPreview) avisoImgPreview.src = '';
    if (fileNameDisplay) fileNameDisplay.textContent = 'Selecciona una imagen';
    if (avisoFileNameDisplay) avisoFileNameDisplay.textContent = 'Selecciona una imagen';
    actualizarEstadoPreviewImagenPost(false);
    actualizarEstadoPreviewImagenAviso(false);

    if (fileInput) {
        fileInput.value = '';
    }

    const tipoSelect = document.getElementById('postTipo');

    if (tipoSelect) {
        tipoSelect.value = 'articulo';
    }
    actualizarCamposTipoPost();

    const materiaSelect = document.getElementById('postMateria');

    if (materiaSelect) {
        materiaSelect.value = '1';
    }

    const avisoTipo = document.getElementById('avisoTipo');
    const avisoUrgente = document.getElementById('avisoUrgente');

    if (avisoTipo) avisoTipo.value = 'academico';
    if (avisoUrgente) avisoUrgente.value = '0';
    actualizarPreviewAviso();

    document.querySelectorAll('.modal-title').forEach((titulo) => {
        titulo.textContent = 'Crear';
    });

    const btnGuardarBorrador = document.getElementById('btnGuardarBorrador');
    const btnEnviarRevision = document.getElementById('btnEnviarRevision');
    const btnGuardarAvisoReset = document.getElementById('btnGuardarAviso');
    const btnEnviarAvisoRevision = document.getElementById('btnEnviarAvisoRevision');

    if (btnGuardarBorrador) btnGuardarBorrador.textContent = 'Guardar';
    if (btnEnviarRevision) btnEnviarRevision.style.display = 'block';
    if (btnGuardarAvisoReset) btnGuardarAvisoReset.textContent = 'Guardar';
    if (btnEnviarAvisoRevision) btnEnviarAvisoRevision.style.display = 'block';

    mostrarPantalla('pantallaSelector');
}

function cerrarModal() {
    modal.style.display = 'none';
    resetearFormulario();
}

function actualizarEstadoPreviewImagenAviso(tieneImagen) {
    const box = document.querySelector('.aviso-imagen-box');
    const placeholder = document.getElementById('avisoImagenPlaceholder');
    const textoBoton = document.getElementById('btnTextoImagenAviso');

    if (box) {
        box.classList.toggle('has-image', tieneImagen);
    }

    if (placeholder) {
        placeholder.classList.toggle('d-none', tieneImagen);
    }

    if (textoBoton) {
        textoBoton.textContent = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
    }
}

function actualizarEstadoPreviewImagenPost(tieneImagen) {
    const box = document.querySelector('.post-imagen-box');
    const placeholder = document.getElementById('postImagenPlaceholder');
    const textoBoton = document.getElementById('btnTextoImagenPost');

    if (box) {
        box.classList.toggle('has-image', tieneImagen);
    }

    if (placeholder) {
        placeholder.classList.toggle('d-none', tieneImagen);
    }

    if (textoBoton) {
        textoBoton.textContent = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
    }
}
