// ============================================
// VARIABLES GLOBALES
// ============================================

const modal = document.getElementById('modalAdmin');
console.log("Elemento modal:", modal);

const btnOpen = document.getElementById('btnAbrirModal');
const btnClose = document.getElementById('btnCerrar');
const fileInput = document.getElementById('fileInput');
const btnVolver = document.querySelector('.btnVolver');

let archivoSeleccionado = null;
let enviando = false;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];


// ============================================
// EVENT LISTENERS - MODAL
// ============================================

// Abrir Modal
if (btnOpen) {
    btnOpen.onclick = () => {
        modal.style.display = 'flex';
    };
}

// Cerrar Modal
if (btnClose) {
    btnClose.onclick = () => {
        cerrarModal();
    };
}

// Botón volver
if (btnVolver) {
    btnVolver.onclick = () => {

        const pantalla1 = document.getElementById('pantalla1');
        const pantalla2 = document.getElementById('pantalla2');

        if (pantalla1 && pantalla2) {

            pantalla1.classList.remove('d-none');
            pantalla2.classList.add('d-none');

            fileInput.value = '';
            archivoSeleccionado = null;
        }
    };
}

// Cerrar al hacer click fuera
window.onclick = (event) => {
    if (event.target == modal) {
        cerrarModal();
    }
};


// ============================================
// MANEJO DE IMAGEN
// ============================================

if (fileInput) {

    fileInput.onchange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        // Validar tamaño
        if (file.size > MAX_IMAGE_SIZE) {

            alert('⚠️ Imagen muy pesada. Máximo 5MB');
            fileInput.value = '';
            return;
        }

        // Validar formato
        if (!FORMATOS_PERMITIDOS.includes(file.type)) {

            alert('⚠️ Solo se permiten JPG, PNG o WebP');
            fileInput.value = '';
            return;
        }

        // Validar dimensiones
        const img = new Image();

        img.onload = () => {

            if (img.width < 400 || img.height < 300) {

                alert('⚠️ Imagen muy pequeña (mínimo 400x300px)');
                fileInput.value = '';
                return;
            }

            procesarImagen(file);
        };

        img.onerror = () => {

            alert('❌ No se pudo leer la imagen');
            fileInput.value = '';
        };

        img.src = URL.createObjectURL(file);
    };
}


// ============================================
// PROCESAR IMAGEN
// ============================================

function procesarImagen(file) {

    archivoSeleccionado = file;

    const reader = new FileReader();

    reader.onload = (event) => {

        const imgPreview = document.getElementById('imgPreview');
        const fileNameDisplay = document.getElementById('fileNameDisplay');

        if (imgPreview) {
            imgPreview.src = event.target.result;
        }

        if (fileNameDisplay) {
            fileNameDisplay.textContent = file.name;
        }

        // Cambiar pantalla
        const pantalla1 = document.getElementById('pantalla1');
        const pantalla2 = document.getElementById('pantalla2');

        if (pantalla1) pantalla1.classList.add('d-none');
        if (pantalla2) pantalla2.classList.remove('d-none');
    };

    reader.onerror = () => {
        alert('❌ Error al leer archivo');
    };

    reader.readAsDataURL(file);
}


// ============================================
// VALIDAR CAMPOS
// ============================================

function validarCampos() {

    const postTitle = document.getElementById('postTitle');
    const postDesc = document.getElementById('postDesc');

    if (!postTitle || !postDesc) {

        alert('⚠️ Elementos del formulario no encontrados');
        return false;
    }

    const titulo = postTitle.value.trim();
    const desc = postDesc.value.trim();

    if (!titulo || !desc) {

        alert('⚠️ Completa todos los campos');
        return false;
    }

    if (titulo.length < 5) {

        alert('⚠️ Título mínimo 5 caracteres');
        return false;
    }

    if (titulo.length > 150) {

        alert('⚠️ Título máximo 150 caracteres');
        return false;
    }

    if (desc.length < 20) {

        alert('⚠️ Descripción mínimo 20 caracteres');
        return false;
    }

    if (desc.length > 2000) {

        alert('⚠️ Descripción máximo 2000 caracteres');
        return false;
    }

    return true;
}


// ============================================
// PUBLICAR
// ============================================

async function manejarPublicacion(estado) {

    if (!validarCampos()) return;

    if (enviando) {

        alert('⏳ Ya se está guardando...');
        return;
    }

    enviando = true;

    const btnAccion = estado === 'borrador'
        ? document.getElementById('btnGuardarBorrador')
        : document.getElementById('btnEnviarRevision');

    const textoOriginal = btnAccion?.textContent || 'Guardar';

    if (btnAccion) {

        btnAccion.textContent = '⏳ Guardando...';
        btnAccion.disabled = true;
    }

    try {

        const titulo = document.getElementById('postTitle').value.trim();
        const desc = document.getElementById('postDesc').value.trim();

        let imagenBase64 = null;

        // Convertir imagen
        if (archivoSeleccionado) {
            imagenBase64 = await convertirABase64(archivoSeleccionado);
        }

        // Datos a enviar
        const datosPost = {
            titulo,
            descripcion: desc,
            imagen: imagenBase64,
            status: estado
        };

        // Fetch al backend
        const respuesta = await fetch('../backend/publicar.php', {

            method: 'POST',

            // IMPORTANTE PARA PHP SESSION
            credentials: 'include',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify(datosPost)
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        if (resultado.success) {

            alert(`✅ Post guardado como ${estado}`);

            // Insertar tarjeta instantáneamente
            if (typeof renderizarTarjetaEnPanel === 'function') {

                renderizarTarjetaEnPanel({

                    id: resultado.post_id,
                    titulo: titulo,
                    descripcion: desc,

                    // IMPORTANTE:
                    // usar la URL REAL del backend
                    imagen: '../frontend/' + resultado.imagen_url,

                    status: estado
                });
            }

            cerrarModal();

        } else {

            alert(`❌ ${resultado.error}`);
        }

    } catch (error) {

        console.error("Error en la publicación:", error);
        alert(`❌ Error: ${error.message}`);

    } finally {

        enviando = false;

        if (btnAccion) {

            btnAccion.textContent = textoOriginal;
            btnAccion.disabled = false;
        }
    }
}


// ============================================
// CONVERTIR A BASE64
// ============================================

function convertirABase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = () => reject(
            new Error('Error al leer archivo')
        );

        reader.readAsDataURL(file);
    });
}


// ============================================
// RESETEAR FORMULARIO
// ============================================

function resetearFormulario() {

    const postTitle = document.getElementById('postTitle');
    const postDesc = document.getElementById('postDesc');
    const imgPreview = document.getElementById('imgPreview');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    if (postTitle) postTitle.value = '';
    if (postDesc) postDesc.value = '';

    if (fileInput) fileInput.value = '';

    if (imgPreview) imgPreview.src = '';

    if (fileNameDisplay) {
        fileNameDisplay.textContent = 'Selecciona una imagen';
    }

    archivoSeleccionado = null;

    const pantalla1 = document.getElementById('pantalla1');
    const pantalla2 = document.getElementById('pantalla2');

    if (pantalla1) pantalla1.classList.remove('d-none');
    if (pantalla2) pantalla2.classList.add('d-none');
}


// ============================================
// CERRAR MODAL
// ============================================

function cerrarModal() {

    if (modal) {
        modal.style.display = 'none';
    }

    resetearFormulario();
}


// ============================================
// BOTONES
// ============================================

const btnGuardarBorrador = document.getElementById('btnGuardarBorrador');
const btnEnviarRevision = document.getElementById('btnEnviarRevision');

if (btnGuardarBorrador) {

    btnGuardarBorrador.onclick = () => {
        manejarPublicacion('borrador');
    };
}

if (btnEnviarRevision) {

    btnEnviarRevision.onclick = () => {
        manejarPublicacion('revision');
    };
}


// ============================================
// CAMBIAR POST A REVISIÓN
// ============================================

async function cambiarARevision(boton) {

    const tarjeta = boton.closest('article');
    const postId = tarjeta?.dataset.postId;

    if (!postId) {

        alert('⚠️ Error: No se encontró el ID del post');
        return;
    }

    if (!confirm('¿Estás seguro de enviar este post a revisión?')) {
        return;
    }

    boton.disabled = true;

    const textoOriginal = boton.textContent;

    boton.textContent = '⏳ Enviando...';

    try {

        const respuesta = await fetch('../backend/cambiar_estado_post.php', {

            method: 'POST',

            credentials: 'include',

            headers: {
                'Content-Type': 'application/json'
            },

            body: JSON.stringify({
                post_id: postId,
                status: 'revision'
            })
        });

        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }

        const resultado = await respuesta.json();

        if (resultado.success) {

            alert('✅ Post enviado a revisión');

            const listaRevision = document.getElementById('listaRevision');

            if (listaRevision && tarjeta) {

                listaRevision.insertAdjacentElement(
                    'afterbegin',
                    tarjeta
                );
            }

            const etiqueta = tarjeta.querySelector('.etiqueta-borrador');

            if (etiqueta) {
                etiqueta.textContent = 'En Revisión';
            }

            const btnRevision = tarjeta.querySelector('.btn-revision-post');

            if (btnRevision) {
                btnRevision.remove();
            }
        }

    } catch (error) {

        alert(`❌ Error: ${error.message}`);

    } finally {

        boton.textContent = textoOriginal;
        boton.disabled = false;
    }
}


// ============================================
// EDITAR
// ============================================

async function abrirEditarPost(id) {

    modal.style.display = 'flex';

    document.getElementById('pantalla1').classList.add('d-none');
    document.getElementById('pantalla2').classList.remove('d-none');

    document.querySelector('.modal-title').textContent =
        'Editar Publicación';
}


// ============================================
// PREPARAR EDICIÓN
// ============================================

function prepararEdicion(boton) {

    const tarjeta = boton.closest('.tarjeta-horizontal');

    const titulo = tarjeta.querySelector('h4').textContent;
    const descripcion = tarjeta.querySelector('.extracto').textContent;
    const imagenSrc = tarjeta.querySelector('.imagen-lateral img').src;

    document.getElementById('postTitle').value = titulo;
    document.getElementById('postDesc').value = descripcion;
    document.getElementById('imgPreview').src = imagenSrc;

    document.getElementById('fileNameDisplay').textContent =
        'Imagen actual';

    modal.style.display = 'flex';

    document.getElementById('pantalla1').classList.add('d-none');
    document.getElementById('pantalla2').classList.remove('d-none');

    document.querySelector('.modal-title').textContent =
        'Editar Publicación';
}