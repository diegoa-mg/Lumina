// ============================================
// VARIABLES GLOBALES
// ============================================

const modal = document.getElementById('modalAdmin');

const btnOpen = document.getElementById('btnAbrirModal');
const btnClose = document.getElementById('btnCerrar');
const fileInput = document.getElementById('fileInput');
const btnVolver = document.querySelector('.btnVolver');

let archivoSeleccionado = null;
let enviando = false;
let postEditando = null;

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const FORMATOS_PERMITIDOS = [
    'image/jpeg',
    'image/png',
    'image/webp'
];


// ============================================
// EVENTOS MODAL
// ============================================

if (btnOpen) {

    btnOpen.onclick = () => {

        postEditando = null;

        resetearFormulario();

        modal.style.display = 'flex';
    };
}

if (btnClose) {

    btnClose.onclick = () => {
        cerrarModal();
    };
}

if (btnVolver) {

    btnVolver.onclick = () => {

        document
            .getElementById('pantalla1')
            .classList.remove('d-none');

        document
            .getElementById('pantalla2')
            .classList.add('d-none');
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

            alert('⚠️ Imagen muy pesada');
            return;
        }

        if (!FORMATOS_PERMITIDOS.includes(file.type)) {

            alert('⚠️ Formato inválido');
            return;
        }

        procesarImagen(file);
    };
}


// ============================================
// PROCESAR IMAGEN
// ============================================

function procesarImagen(file) {

    archivoSeleccionado = file;

    const reader = new FileReader();

    reader.onload = (event) => {

        document.getElementById('imgPreview').src =
            event.target.result;

        document.getElementById('fileNameDisplay')
            .textContent = file.name;

        document
            .getElementById('pantalla1')
            .classList.add('d-none');

        document
            .getElementById('pantalla2')
            .classList.remove('d-none');
    };

    reader.readAsDataURL(file);
}


// ============================================
// VALIDAR CAMPOS
// ============================================

function validarCampos() {

    const titulo =
        document.getElementById('postTitle')
        .value.trim();

    const descripcion =
        document.getElementById('postDesc')
        .value.trim();

    if (!titulo || !descripcion) {

        alert('⚠️ Completa todos los campos');
        return false;
    }

    return true;
}


// ============================================
// CONVERTIR BASE64
// ============================================

function convertirABase64(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(file);
    });
}


// ============================================
// CREAR / EDITAR POST
// ============================================

async function manejarPublicacion(estado) {

    if (!validarCampos()) return;

    if (enviando) return;

    enviando = true;

    try {

        const titulo =
            document.getElementById('postTitle')
            .value.trim();

        const descripcion =
            document.getElementById('postDesc')
            .value.trim();

        const tipo =
            document.getElementById('postTipo')
            ?.value || 'articulo';

        const categoriaId =
            document.getElementById('postMateria')
            ?.value || '1';

        let imagenBase64 = null;

        if (archivoSeleccionado) {

            imagenBase64 =
                await convertirABase64(
                    archivoSeleccionado
                );
        }

        // ============================================
        // EDITAR
        // ============================================

        if (postEditando) {

            const respuesta = await fetch(
                '../backend/editar_post.php',
                {
                    method: 'POST',

                    credentials: 'include',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({

                        post_id: postEditando,

                        titulo,

                        descripcion,

                        tipo,

                        categoria_id: categoriaId,

                        imagen: imagenBase64
                    })
                }
            );

            const resultado =
                await respuesta.json();

            if (resultado.success) {

                alert('✅ Post actualizado');

                location.reload();

            } else {

                alert(resultado.error);
            }

            return;
        }

        // ============================================
        // CREAR
        // ============================================

        const respuesta = await fetch(
            '../backend/publicar.php',
            {
                method: 'POST',

                credentials: 'include',

                headers: {
                    'Content-Type': 'application/json'
                },

                body: JSON.stringify({

                    titulo,

                    descripcion,

                    tipo,

                    categoria_id: categoriaId,

                    imagen: imagenBase64,

                    status: estado
                })
            }
        );

        const resultado = await respuesta.json();

        if (resultado.success) {

            alert('✅ Publicación creada');

            location.reload();

        } else {

            alert(resultado.error);
        }

    } catch (error) {

        console.error(error);

        alert('❌ Error al guardar');

    } finally {

        enviando = false;
    }
}


// ============================================
// BOTONES
// ============================================

const btnGuardar =
    document.getElementById('btnGuardarBorrador');

const btnRevision =
    document.getElementById('btnEnviarRevision');

if (btnGuardar) {

    btnGuardar.onclick = () => {

        manejarPublicacion('borrador');
    };
}

if (btnRevision) {

    btnRevision.onclick = () => {

        manejarPublicacion('revision');
    };
}


// ============================================
// PREPARAR EDICIÓN
// ============================================

function prepararEdicion(boton) {

    const tarjeta =
        boton.closest('.tarjeta-horizontal');

    if (!tarjeta) return;

    // ============================================
    // DATOS
    // ============================================

    const id =
        tarjeta.dataset.postId;

    const titulo =
        tarjeta.dataset.titulo;

    const descripcion =
        tarjeta.dataset.descripcion;

    const imagen =
        tarjeta.dataset.imagen;

    const tipo =
        tarjeta.dataset.tipo;

    const categoriaId =
        tarjeta.dataset.categoriaId;

    postEditando = id;

    // ============================================
    // TITULOS
    // ============================================

    document
        .querySelectorAll('.modal-title')
        .forEach(t => {
            t.textContent = 'Editar';
        });

    // ============================================
    // LLENAR INPUTS
    // ============================================

    document.getElementById('postTitle')
        .value = titulo || '';

    document.getElementById('postDesc')
        .value = descripcion || '';

    const tipoSelect =
        document.getElementById('postTipo');

    if (tipoSelect) {

        tipoSelect.value =
            tipo || 'articulo';
    }

    const materiaSelect =
        document.getElementById('postMateria');

    if (materiaSelect) {

        materiaSelect.value =
            categoriaId || '1';
    }

    // ============================================
    // IMAGEN
    // ============================================

    const imgPreview =
        document.getElementById('imgPreview');

    if (imgPreview && imagen) {

        imgPreview.src = typeof resolveImageSrc === 'function'
            ? resolveImageSrc(imagen)
            : imagen;
    }

    // ============================================
    // TEXTO IMAGEN
    // ============================================

    document.getElementById(
        'fileNameDisplay'
    ).textContent = 'Imagen actual';

    // ============================================
    // ABRIR MODAL
    // ============================================

    modal.style.display = 'flex';

    document
        .getElementById('pantalla1')
        .classList.add('d-none');

    document
        .getElementById('pantalla2')
        .classList.remove('d-none');

    // ============================================
    // BOTONES
    // ============================================

    document.getElementById(
        'btnGuardarBorrador'
    ).textContent = 'Guardar cambios';

    document.getElementById(
        'btnEnviarRevision'
    ).style.display = 'none';
}


// ============================================
// RESET FORMULARIO
// ============================================

function resetearFormulario() {

    postEditando = null;

    archivoSeleccionado = null;

    document.getElementById('postTitle').value = '';

    document.getElementById('postDesc').value = '';

    document.getElementById('imgPreview').src = '';

    document.getElementById(
        'fileNameDisplay'
    ).textContent =
        'Selecciona una imagen';

    if (fileInput) {
        fileInput.value = '';
    }

    const tipoSelect =
        document.getElementById('postTipo');

    if (tipoSelect) {

        tipoSelect.value = 'articulo';
    }

    const materiaSelect =
        document.getElementById('postMateria');

    if (materiaSelect) {

        materiaSelect.value = '1';
    }

    document
        .querySelectorAll('.modal-title')
        .forEach(t => {
            t.textContent = 'Crear';
        });

    document.getElementById(
        'btnGuardarBorrador'
    ).textContent = 'Guardar';

    document.getElementById(
        'btnEnviarRevision'
    ).style.display = 'block';

    document
        .getElementById('pantalla1')
        .classList.remove('d-none');

    document
        .getElementById('pantalla2')
        .classList.add('d-none');
}


// ============================================
// CERRAR MODAL
// ============================================

function cerrarModal() {

    modal.style.display = 'none';

    resetearFormulario();
}
