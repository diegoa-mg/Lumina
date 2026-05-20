// ============================================
// VARIABLES GLOBALES
// ============================================

const modal = document.getElementById('modalAdmin');
const btnOpen = document.getElementById('btnAbrirModal');
const btnClose = document.getElementById('btnCerrar');
const btnCerrarSecundario = document.querySelectorAll('.btnCerrarSecundario');
const fileInput = document.getElementById('fileInput');
const videoFileInput = document.getElementById('videoFileInput');
const resourceFileInput = document.getElementById('resourceFileInput');
const btnVolver = document.querySelector('.btnVolver');
const btnVolverSelector = document.querySelectorAll('.btnVolverSelector');
const btnCrearPost = document.getElementById('btnCrearPost');
const btnCrearAviso = document.getElementById('btnCrearAviso');
const postTipoSelect = document.getElementById('postTipo');
const campoYoutube = document.querySelector('.campo-youtube');
const campoRecurso = document.querySelector('.campo-recurso-file');

let archivoSeleccionado = null;
let archivoVideoSeleccionado = null;
let archivoRecursoSeleccionado = null;
let enviando = false;
let postEditando = null;
let modoPublicacion = 'post';
let videoMode = 'link'; // 'link' or 'file' - UI toggle for video posts
let videoPreviewUrl = null;
let videoActualUrl = '';
let videoActualNombre = '';
let recursoActualUrl = '';
let recursoActualNombre = '';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 500 * 1024 * 1024;
const MAX_RESOURCE_SIZE = 100 * 1024 * 1024;
const VIDEO_FORMATOS_PERMITIDOS = [
    'video/mp4'
];

const FORMATOS_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp'
];
const RESOURCE_EXTENSIONS_PERMITIDAS = [
    'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
    'txt', 'csv', 'zip', 'rar', '7z',
    'py', 'html', 'css', 'js', 'php', 'java', 'c', 'cpp', 'h',
    'json', 'xml', 'sql', 'md'
];

const CONFIG_AVISOS = {
    academico: {
        texto: 'Académico',
        clave: 'crear.tipo_academico',
        icono: 'school',
        clase: 'bg-rojo'
    },
    plataforma: {
        texto: 'Plataforma',
        clave: 'crear.tipo_plataforma',
        icono: 'language',
        clase: 'bg-rojo2'
    }
};

function actualizarCamposTipoPost() {
    const tipo = (postTipoSelect?.value || 'articulo').toLowerCase();
    const campoVideoFile = document.querySelector('.campo-video-file');
    const imagenOpcionalNote = document.getElementById('imagenOpcionalNote');
    const btnTextoImagenPost = document.getElementById('btnTextoImagenPost');
    const videoModeToggle = document.querySelector('.video-mode-toggle');
    const campoVideoToggle = document.querySelector('.campo-video-toggle');
    const campoYoutubeLocal = document.querySelector('.campo-youtube');

    // Show the toggle and video controls only for video type
    if (campoVideoToggle) {
        campoVideoToggle.classList.toggle('d-none', tipo !== 'video');
    }
    if (videoModeToggle) {
        videoModeToggle.classList.toggle('d-none', tipo !== 'video');
    }

    const videoPreviewSection = document.getElementById('videoPreviewSection');
    const resourcePreviewSection = document.getElementById('resourcePreviewSection');
    const imagenSection = document.getElementById('imagenPostSection');
    const btnCambiarImagenPost = document.getElementById('btnCambiarImagenPost');

    if (tipo === 'video') {
        if (campoVideoToggle) {
            campoVideoToggle.classList.remove('d-none');
        }
        if (videoMode === 'link') {
            campoYoutubeLocal?.classList.remove('d-none');
            campoVideoFile?.classList.add('d-none');
        } else {
            campoYoutubeLocal?.classList.add('d-none');
            campoVideoFile?.classList.remove('d-none');
        }

        if (imagenSection) {
            imagenSection.classList.add('d-none');
            imagenSection.style.display = 'none';
        }

        if (videoPreviewSection) {
            videoPreviewSection.classList.remove('d-none');
            videoPreviewSection.style.display = 'flex';
        }
        if (resourcePreviewSection) {
            resourcePreviewSection.classList.add('d-none');
            resourcePreviewSection.style.display = 'none';
        }

        if (btnCambiarImagenPost) {
            btnCambiarImagenPost.classList.add('d-none');
        }

        actualizarPreviewVideo();
    } else if (tipo === 'recurso') {
        if (campoVideoToggle) {
            campoVideoToggle.classList.add('d-none');
        }
        campoYoutubeLocal?.classList.add('d-none');
        campoVideoFile?.classList.add('d-none');

        if (imagenSection) {
            imagenSection.classList.add('d-none');
            imagenSection.style.display = 'none';
        }

        if (videoPreviewSection) {
            videoPreviewSection.classList.add('d-none');
            videoPreviewSection.style.display = 'none';
        }

        if (resourcePreviewSection) {
            resourcePreviewSection.classList.remove('d-none');
            resourcePreviewSection.style.display = 'flex';
        }

        if (btnCambiarImagenPost) {
            btnCambiarImagenPost.classList.add('d-none');
        }

        actualizarPreviewRecurso();
    } else {
        if (campoVideoToggle) {
            campoVideoToggle.classList.add('d-none');
        }
        campoYoutubeLocal?.classList.add('d-none');
        campoVideoFile?.classList.add('d-none');

        if (imagenSection) {
            imagenSection.classList.remove('d-none');
            imagenSection.style.display = 'block';
        }

        if (videoPreviewSection) {
            videoPreviewSection.classList.add('d-none');
            videoPreviewSection.style.display = 'none';
        }
        if (resourcePreviewSection) {
            resourcePreviewSection.classList.add('d-none');
            resourcePreviewSection.style.display = 'none';
        }

        if (btnCambiarImagenPost) {
            btnCambiarImagenPost.classList.remove('d-none');
        }
    }
    campoRecurso?.classList.toggle('d-none', tipo !== 'recurso');

    if (imagenOpcionalNote) {
        imagenOpcionalNote.classList.toggle('d-none', tipo !== 'video');
    }

    if (btnTextoImagenPost) {
        if ((tipo === 'video' || tipo === 'recurso') && !archivoSeleccionado) {
            btnTextoImagenPost.setAttribute('data-i18n', 'crear.subir_imagen_opc');
            btnTextoImagenPost.textContent = (typeof t === 'function') ? t('crear.subir_imagen_opc') : 'Subir imagen (opcional)';
        } else if (!archivoSeleccionado) {
            btnTextoImagenPost.setAttribute('data-i18n', 'crear.subir_imagen');
            btnTextoImagenPost.textContent = (typeof t === 'function') ? t('crear.subir_imagen') : 'Subir imagen';
        }
    }
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
        modal.classList.remove('modal-editando');
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

if (videoFileInput) {
    videoFileInput.onchange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const lowerName = (file.name || '').toLowerCase();
        if (file.type !== 'video/mp4' && !lowerName.endsWith('.mp4')) {
            alert('Formato de video invalido. Solo .mp4 permitidos');
            return;
        }

        if (file.size > MAX_VIDEO_SIZE) {
            alert('Video muy pesado. El maximo es 500 MB.');
            return;
        }

        archivoVideoSeleccionado = file;
        const videoFileNameDisplay = document.getElementById('videoFileNameDisplay');

        if (videoFileNameDisplay) {
            videoFileNameDisplay.textContent = file.name;
        }

        actualizarEstadoPreviewVideoSeleccionado(true);
        actualizarPreviewVideo();
    };
}

if (resourceFileInput) {
    resourceFileInput.onchange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const extension = (file.name || '').split('.').pop().toLowerCase();
        if (!RESOURCE_EXTENSIONS_PERMITIDAS.includes(extension)) {
            alert('Formato de recurso no permitido');
            return;
        }

        if (file.size > MAX_RESOURCE_SIZE) {
            alert('Archivo muy pesado. El maximo es 100 MB.');
            return;
        }

        archivoRecursoSeleccionado = file;
        recursoActualUrl = '';
        recursoActualNombre = file.name;

        const resourceFileNameDisplay = document.getElementById('resourceFileNameDisplay');
        if (resourceFileNameDisplay) {
            resourceFileNameDisplay.textContent = file.name;
        }

        actualizarPreviewRecurso();
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

function actualizarEstadoPreviewVideoSeleccionado(tieneVideo) {
    const videoFileNameDisplay = document.getElementById('videoFileNameDisplay');
    const btnSubirVideo = document.getElementById('btnSubirVideo');

    if (videoFileNameDisplay) {
        if (tieneVideo) {
            videoFileNameDisplay.removeAttribute('data-i18n');
            videoFileNameDisplay.textContent = archivoVideoSeleccionado ? archivoVideoSeleccionado.name : (videoActualNombre || 'Video actual');
        } else {
            videoFileNameDisplay.setAttribute('data-i18n', 'crear.no_video');
            videoFileNameDisplay.textContent = (typeof t === 'function') ? t('crear.no_video') : 'No se ha seleccionado video';
        }
    }

    if (btnSubirVideo) {
        const clave = tieneVideo ? 'crear.cambiar_video' : 'crear.seleccionar_video_corto';
        const fb = tieneVideo ? 'Cambiar video' : 'Seleccionar video';
        btnSubirVideo.setAttribute('data-i18n', clave);
        btnSubirVideo.textContent = (typeof t === 'function') ? t(clave) : fb;
    }
}

function obtenerNombreDesdeRuta(ruta) {
    if (!ruta) return '';

    const nombreArchivo = decodeURIComponent(String(ruta).split('/').pop() || '');

    return nombreArchivo.replace(/^(?:post|aviso|post_editor)(?:_\d+)?_\d+_[a-f0-9]{8}_/i, '');
}

function actualizarPreviewRecurso() {
    const nombre = archivoRecursoSeleccionado?.name || recursoActualNombre || obtenerNombreDesdeRuta(recursoActualUrl) || 'Selecciona un archivo';
    const nombrePreview = document.getElementById('resourcePreviewName');
    const nombreDisplay = document.getElementById('resourceFileNameDisplay');
    const boton = document.getElementById('btnSubirRecurso');
    const tieneArchivo = Boolean(archivoRecursoSeleccionado || recursoActualUrl);

    if (nombrePreview) {
        nombrePreview.textContent = nombre;
    }

    if (nombreDisplay) {
        if (tieneArchivo) {
            nombreDisplay.removeAttribute('data-i18n');
            nombreDisplay.textContent = nombre;
        } else {
            nombreDisplay.setAttribute('data-i18n', 'crear.no_archivo');
            nombreDisplay.textContent = (typeof t === 'function') ? t('crear.no_archivo') : 'No se ha seleccionado archivo';
        }
    }

    if (boton) {
        const clave = tieneArchivo ? 'crear.cambiar_archivo' : 'crear.seleccionar_recurso';
        const fb = tieneArchivo ? 'Cambiar archivo' : 'Seleccionar recurso';
        boton.setAttribute('data-i18n', clave);
        boton.textContent = (typeof t === 'function') ? t(clave) : fb;
    }
}

function formatearDuracionVideo(segundos) {
    if (!Number.isFinite(segundos) || segundos <= 0) return '';

    const total = Math.round(segundos);
    const horas = Math.floor(total / 3600);
    const minutos = Math.floor((total % 3600) / 60);
    const restantes = total % 60;

    if (horas > 0) {
        return `${horas}:${String(minutos).padStart(2, '0')}:${String(restantes).padStart(2, '0')}`;
    }

    return `${minutos}:${String(restantes).padStart(2, '0')}`;
}

function obtenerYoutubeEmbedUrl(url) {
    if (!url) return null;

    const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-]+)/;
    const match = url.match(youtubeRegex);

    if (!match) {
        return null;
    }

    return `https://www.youtube.com/embed/${match[1]}`;
}

function limpiarPreviewVideo() {
    const video = document.getElementById('videoPreview');
    const iframe = document.getElementById('youtubePreviewIframe');
    const note = document.getElementById('videoPreviewNote');

    if (video) {
        video.pause();
        video.onloadedmetadata = null;
        video.removeAttribute('src');
        video.load();
    }

    if (iframe) {
        iframe.removeAttribute('src');
    }

    if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
        videoPreviewUrl = null;
    }

    if (note) {
        note.setAttribute('data-i18n', 'crear.vista_previa_video');
        note.textContent = typeof t === 'function' ? t('crear.vista_previa_video') : 'Vista previa del video';
    }
}

function actualizarPreviewVideo() {
    const videoSection = document.getElementById('videoPreviewSection');
    const video = document.getElementById('videoPreview');
    const iframe = document.getElementById('youtubePreviewIframe');
    const note = document.getElementById('videoPreviewNote');
    const youtubeInput = document.getElementById('youtubeUrl');

    if (!videoSection || !video || !iframe || !note) return;

    if (videoMode === 'file') {
        iframe.classList.add('d-none');

        if (!archivoVideoSeleccionado && !videoActualUrl) {
            video.classList.add('d-none');
            note.setAttribute('data-i18n', 'crear.selecciona_mp4_preview');
            note.textContent = typeof t === 'function' ? t('crear.selecciona_mp4_preview') : 'Selecciona un archivo .mp4 para vista previa.';
            return;
        }

        if (videoPreviewUrl) {
            URL.revokeObjectURL(videoPreviewUrl);
            videoPreviewUrl = null;
        }

        let etiquetaVideo = '';

        if (archivoVideoSeleccionado) {
            videoPreviewUrl = URL.createObjectURL(archivoVideoSeleccionado);
            video.src = videoPreviewUrl;
            etiquetaVideo = archivoVideoSeleccionado.name;
        } else {
            video.src = typeof resolveImageSrc === 'function'
                ? resolveImageSrc(videoActualUrl)
                : videoActualUrl;
            etiquetaVideo = videoActualNombre || 'Video actual';
        }

        video.classList.remove('d-none');
        note.removeAttribute('data-i18n');
        note.textContent = etiquetaVideo;
        video.onloadedmetadata = () => {
            const duracion = formatearDuracionVideo(video.duration);
            note.textContent = duracion
                ? `${etiquetaVideo} • ${duracion}`
                : etiquetaVideo;
        };
        video.load();
        return;
    }

    if (videoMode === 'link') {
        video.classList.add('d-none');
        const embedUrl = obtenerYoutubeEmbedUrl(youtubeInput?.value.trim() || '');

        if (!embedUrl) {
            iframe.classList.add('d-none');
            note.setAttribute('data-i18n', 'crear.url_youtube_invalida');
            note.textContent = typeof t === 'function' ? t('crear.url_youtube_invalida') : 'Ingresa una URL válida de YouTube para vista previa.';
            return;
        }

        iframe.src = embedUrl;
        iframe.classList.remove('d-none');
        note.setAttribute('data-i18n', 'crear.video_youtube_preview');
        note.textContent = typeof t === 'function' ? t('crear.video_youtube_preview') : 'Vista previa del video de YouTube';
        return;
    }
}

function establecerModoVideo(modo) {
    const btnLink = document.getElementById('videoModeLink');
    const btnFile = document.getElementById('videoModeFile');

    videoMode = modo === 'file' ? 'file' : 'link';
    btnLink?.classList.toggle('active', videoMode === 'link');
    btnFile?.classList.toggle('active', videoMode === 'file');
    actualizarCamposTipoPost();
}

// Inicializar botones de modo video (link / archivo)
const initVideoModeButtons = () => {
    const btnLink = document.getElementById('videoModeLink');
    const btnFile = document.getElementById('videoModeFile');

    if (!btnLink || !btnFile) return;
    if (btnLink.dataset.videoModeReady === '1') return;

    btnLink.dataset.videoModeReady = '1';

    btnLink.addEventListener('click', () => establecerModoVideo('link'));
    btnFile.addEventListener('click', () => establecerModoVideo('file'));

    establecerModoVideo(videoMode);
};

// Ejecutar inicialización después de cargar el script (los elementos están en el DOM)
document.addEventListener('DOMContentLoaded', initVideoModeButtons);
// Called directly because script is loaded at end of body in this page
initVideoModeButtons();

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

    const tipoPost = document.getElementById('postTipo')?.value || 'articulo';
    const esVideo = tipoPost === 'video';
    const esRecurso = tipoPost === 'recurso';

    return {
        titulo: document.getElementById('postTitle').value.trim(),
        descripcion: document.getElementById('postDesc').value.trim(),
        tipo: tipoPost,
        categoria_id: document.getElementById('postMateria')?.value || '1',
        youtube_url: esVideo && videoMode === 'link'
            ? document.getElementById('youtubeUrl')?.value.trim() || ''
            : '',
        video_url: esVideo && videoMode === 'file'
            ? videoActualUrl
            : '',
        archivo_url: esRecurso
            ? recursoActualUrl
            : '',
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

    if (datos.seccion === 'post' && datos.tipo === 'articulo' && !archivoSeleccionado && !postEditando) {
        alert('Los posts requieren una imagen adjunta');
        return false;
    }

    if (datos.seccion === 'post' && datos.tipo === 'video') {
        if (videoMode === 'link' && !datos.youtube_url) {
            alert('Debes ingresar la URL de YouTube');
            return false;
        }

        if (videoMode === 'file' && !archivoVideoSeleccionado && !videoActualUrl) {
            alert('Debes seleccionar un archivo .mp4 desde tu PC');
            return false;
        }
    }

    if (datos.seccion === 'post' && datos.tipo === 'recurso' && !archivoRecursoSeleccionado && !recursoActualUrl) {
        alert('Debes seleccionar un archivo de recurso');
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

function actualizarProgresoVideo(percent, texto = '') {
    const progressContainer = document.getElementById('videoUploadProgressContainer');
    const progressBar = document.getElementById('videoProgressBar');
    const progressText = document.getElementById('videoProgressText');

    if (progressContainer) {
        progressContainer.classList.remove('d-none');
    }

    if (progressBar) {
        progressBar.value = percent;
    }

    if (progressText) {
        progressText.textContent = texto || `Subiendo video... ${percent.toFixed(0)}%`;
    }
}

function enviarPublicacionConArchivo(url, payload, archivo, fieldName = 'video_file') {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        Object.entries(payload).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, value);
            }
        });

        formData.append(fieldName, archivo);

        xhr.withCredentials = true;
        xhr.open('POST', url, true);

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
                const percentComplete = (event.loaded / event.total) * 100;
                if (fieldName === 'video_file') {
                    actualizarProgresoVideo(percentComplete);
                }
            }
        };

        xhr.onload = () => {
            const responseText = xhr.responseText || '';

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    resolve(JSON.parse(responseText));
                } catch (error) {
                    reject(new Error(`Respuesta no JSON: ${responseText}`));
                }
            } else {
                let mensaje = responseText;

                try {
                    const json = JSON.parse(responseText);
                    mensaje = json.error || responseText;
                } catch (e) {
                    // keep raw responseText
                }

                if (xhr.status === 401) {
                    mensaje = 'Tu sesión no es válida o ha expirado. Inicia sesión de nuevo.';
                }

                reject(new Error(`HTTP ${xhr.status}: ${mensaje}`));
            }
        };

        xhr.onerror = () => reject(new Error('Error de red'));
        xhr.send(formData);
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

        if (archivoSeleccionado && (datos.seccion !== 'aviso' || datos.importante) && datos.tipo !== 'recurso') {
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

        const url = postEditando
            ? '../backend/editar_post.php'
            : '../backend/publicar.php';

        let resultado;

        if (archivoVideoSeleccionado && datos.tipo === 'video') {
            resultado = await enviarPublicacionConArchivo(url, payload, archivoVideoSeleccionado);
        } else if (archivoRecursoSeleccionado && datos.tipo === 'recurso') {
            resultado = await enviarPublicacionConArchivo(url, payload, archivoRecursoSeleccionado, 'resource_file');
        } else {
            const respuesta = await fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            resultado = await respuesta.json();
        }

        if (resultado.success) {
            alert(postEditando ? 'Publicacion actualizada' : 'Publicacion creada');
            location.reload();
        } else {
            alert(resultado.error);
        }
    } catch (error) {
        console.error(error);
        alert(error?.message || 'Error al guardar');
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
    const videoUrl = tarjeta.dataset.videoUrl || '';
    const archivoUrl = tarjeta.dataset.archivoUrl || tarjeta.dataset.noticiaUrl || '';

    postEditando = id;
    modoPublicacion = seccion;
    archivoVideoSeleccionado = null;
    archivoRecursoSeleccionado = null;
    videoActualUrl = videoUrl;
    videoActualNombre = obtenerNombreDesdeRuta(videoUrl);
    recursoActualUrl = archivoUrl;
    recursoActualNombre = obtenerNombreDesdeRuta(archivoUrl);
    modal.classList.add('modal-editando');

    const claveEditar = seccion === 'aviso' ? 'crear.editar_aviso' : 'crear.editar_post';
    document.querySelectorAll('.modal-title').forEach((tituloModal) => {
        tituloModal.setAttribute('data-i18n', claveEditar);
        tituloModal.textContent = (typeof t === 'function') ? t(claveEditar) : (seccion === 'aviso' ? 'Editar aviso' : 'Editar post');
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
            avisoFileNameDisplay.setAttribute('data-i18n', 'crear.imagen_actual');
            avisoFileNameDisplay.textContent = (typeof t === 'function') ? t('crear.imagen_actual') : 'Imagen actual';
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
        if (youtubeInput) {
            youtubeInput.value = youtubeUrl;
        }

        if ((tipo || '').toLowerCase() === 'video') {
            if (videoActualUrl) {
                if (youtubeInput) {
                    youtubeInput.value = '';
                }

                establecerModoVideo('file');
                actualizarEstadoPreviewVideoSeleccionado(true);
            } else {
                establecerModoVideo('link');
            }
        } else {
            videoActualUrl = '';
            videoActualNombre = '';
            establecerModoVideo('link');
            actualizarCamposTipoPost();
        }

        if ((tipo || '').toLowerCase() === 'recurso') {
            actualizarPreviewRecurso();
        } else {
            recursoActualUrl = '';
            recursoActualNombre = '';
        }

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

        const fdNombre = document.getElementById('fileNameDisplay');
        const claveFD = imagen ? 'crear.imagen_actual' : 'crear.selecciona_imagen';
        fdNombre.setAttribute('data-i18n', claveFD);
        fdNombre.textContent = (typeof t === 'function') ? t(claveFD) : (imagen ? 'Imagen actual' : 'Selecciona una imagen');
        actualizarEstadoPreviewImagenPost(Boolean(imagen));
    }

    modal.style.display = 'flex';
    mostrarPantalla(seccion === 'aviso' ? 'pantallaAviso' : 'pantalla2');

    // El boton de revision solo aparece si la publicacion es borrador o rechazada.
    const puedeEnviarRevision = status === 'borrador' || status === 'rechazado';

    const aplicarGuardarCambios = (boton) => {
        if (!boton) return;
        boton.setAttribute('data-i18n', 'comun.guardar_cambios');
        boton.textContent = (typeof t === 'function') ? t('comun.guardar_cambios') : 'Guardar cambios';
    };

    if (seccion === 'aviso') {
        aplicarGuardarCambios(document.getElementById('btnGuardarAviso'));
        document.getElementById('btnEnviarAvisoRevision').style.display = puedeEnviarRevision ? 'block' : 'none';
    } else {
        aplicarGuardarCambios(document.getElementById('btnGuardarBorrador'));
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
        const clave = titulo ? '' : 'crear.titulo_aviso_ph';
        if (clave) previewTitulo.setAttribute('data-i18n', clave);
        else previewTitulo.removeAttribute('data-i18n');
        previewTitulo.textContent = titulo || (typeof t === 'function' ? t('crear.titulo_aviso_ph') : 'Título del aviso');
    }

    if (previewDesc) {
        const clave = descripcion ? '' : 'crear.desc_aviso_ph';
        if (clave) previewDesc.setAttribute('data-i18n', clave);
        else previewDesc.removeAttribute('data-i18n');
        previewDesc.textContent = descripcion || (typeof t === 'function' ? t('crear.desc_aviso_ph') : 'La descripción del aviso aparecerá aquí.');
    }

    if (previewTipo) {
        previewTipo.setAttribute('data-i18n', config.clave);
        previewTipo.textContent = typeof t === 'function' ? t(config.clave, config.texto) : config.texto;
    }

    if (previewUrgente) {
        previewUrgente.classList.toggle('d-none', !urgente);
        previewUrgente.setAttribute('data-i18n', 'crear.opcion_urgente');
        previewUrgente.textContent = typeof t === 'function' ? t('crear.opcion_urgente') : 'Urgente';
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
document.addEventListener('lumina-idioma-cambiado', () => {
    actualizarPreviewAviso();
    actualizarPreviewVideo();
});
const youtubeUrlInput = document.getElementById('youtubeUrl');
if (youtubeUrlInput) {
    youtubeUrlInput.addEventListener('input', actualizarPreviewVideo);
    youtubeUrlInput.addEventListener('change', actualizarPreviewVideo);
}
postTipoSelect?.addEventListener('change', actualizarCamposTipoPost);

// ============================================
// RESET / CERRAR
// ============================================

function resetearFormulario() {
    postEditando = null;
    archivoSeleccionado = null;
    modoPublicacion = 'post';
    modal?.classList.remove('modal-editando');

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
    const resourceFileNameDisplay = document.getElementById('resourceFileNameDisplay');

    if (postTitle) postTitle.value = '';
    if (postDesc) postDesc.value = '';
    if (avisoTitle) avisoTitle.value = '';
    if (avisoDesc) avisoDesc.value = '';
    if (avisoImportante) avisoImportante.checked = false;
    if (youtubeInput) youtubeInput.value = '';
    if (imgPreview) imgPreview.src = '';
    if (avisoImgPreview) avisoImgPreview.src = '';
    const setI18nReset = (el, clave, fb) => {
        if (!el) return;
        el.setAttribute('data-i18n', clave);
        el.textContent = (typeof t === 'function') ? t(clave) : fb;
    };
    setI18nReset(fileNameDisplay, 'crear.selecciona_imagen', 'Selecciona una imagen');
    setI18nReset(avisoFileNameDisplay, 'crear.selecciona_imagen', 'Selecciona una imagen');
    setI18nReset(resourceFileNameDisplay, 'crear.no_archivo', 'No se ha seleccionado archivo');
    actualizarEstadoPreviewImagenPost(false);
    actualizarEstadoPreviewImagenAviso(false);

    if (fileInput) {
        fileInput.value = '';
    }

    if (videoFileInput) {
        videoFileInput.value = '';
    }

    if (resourceFileInput) {
        resourceFileInput.value = '';
    }

    const videoFileNameDisplay = document.getElementById('videoFileNameDisplay');
    const videoUploadProgressContainer = document.getElementById('videoUploadProgressContainer');

    archivoVideoSeleccionado = null;
    archivoRecursoSeleccionado = null;
    videoActualUrl = '';
    videoActualNombre = '';
    recursoActualUrl = '';
    recursoActualNombre = '';
    limpiarPreviewVideo();
    actualizarEstadoPreviewVideoSeleccionado(false);
    actualizarPreviewRecurso();

    if (videoUploadProgressContainer) {
        videoUploadProgressContainer.classList.add('d-none');
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
        titulo.setAttribute('data-i18n', 'crear.titulo');
        titulo.textContent = (typeof t === 'function') ? t('crear.titulo') : 'Crear';
    });

    const btnGuardarBorrador = document.getElementById('btnGuardarBorrador');
    const btnEnviarRevision = document.getElementById('btnEnviarRevision');
    const btnGuardarAvisoReset = document.getElementById('btnGuardarAviso');
    const btnEnviarAvisoRevision = document.getElementById('btnEnviarAvisoRevision');

    const setGuardar = (btn) => {
        if (!btn) return;
        btn.setAttribute('data-i18n', 'crear.guardar');
        btn.textContent = (typeof t === 'function') ? t('crear.guardar') : 'Guardar';
    };
    setGuardar(btnGuardarBorrador);
    setGuardar(btnGuardarAvisoReset);
    if (btnEnviarRevision) btnEnviarRevision.style.display = 'block';
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
        const clave = tieneImagen ? 'crear.cambiar_imagen' : 'crear.subir_imagen';
        const fb = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
        textoBoton.setAttribute('data-i18n', clave);
        textoBoton.textContent = (typeof t === 'function') ? t(clave) : fb;
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
        const clave = tieneImagen ? 'crear.cambiar_imagen' : 'crear.subir_imagen';
        const fb = tieneImagen ? 'Cambiar imagen' : 'Subir imagen';
        textoBoton.setAttribute('data-i18n', clave);
        textoBoton.textContent = (typeof t === 'function') ? t(clave) : fb;
    }
}
