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
        // Usamos flex para que el centrado de CSS funcione
        modal.style.display = 'flex'; 
        // Si usas la clase d-none, cámbialo a: modal.classList.remove('d-none');
    };
}

// Cerrar Modal
if (btnClose) {
    btnClose.onclick = () => {
        modal.style.display = 'none';
        // Si usas la clase d-none, cámbialo a: modal.classList.add('d-none');
        resetearFormulario(); // Limpia los campos al cerrar
    };
}

// Cerrar al hacer clic fuera de la caja blanca (Opcional pero recomendado)
window.onclick = (event) => {
    if (event.target == modal) {
        modal.style.display = 'none';
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
            alert(`⚠️ Imagen muy pesada. MáMB`);
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

function procesarImagen(file) {
    archivoSeleccionado = file;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        const imgPreview = document.getElementById('imgPreview');
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        
        if (imgPreview) imgPreview.src = event.target.result;
        if (fileNameDisplay) fileNameDisplay.textContent = file.name;
        
        // Cambiar de pantalla
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
// PUBLICACIÓN
// ============================================
async function manejarPublicacion(estado) {
    if (!validarCampos()) return;
    
    if (enviando) {
        alert('⏳ Ya se está guardando...');
        return;
    }
    
    enviando = true;
    
    // ✅ CAMBIO: Corregir variable btnAccion
    const btnAccion = estado === 'borrador' ? 
        document.getElementById('btnGuardarBorrador') : 
        document.getElementById('btnEnviarRevision');
    
    const textoOriginal = btnAccion?.textContent || 'Guardar';
    if (btnAccion) {
        btnAccion.textContent = '⏳ Guardando...';
        btnAccion.disabled = true;
    }
    
    try {
        // ✅ CAMBIO: Usar IDs correctos
        const postTitle = document.getElementById('postTitle');
        const postDesc = document.getElementById('postDesc');
        
        const titulo = postTitle.value.trim();
        const desc = postDesc.value.trim();
        let imagenBase64 = null;
        
        // Convertir imagen a Base64 si existe
        if (archivoSeleccionado) {
            imagenBase64 = await convertirABase64(archivoSeleccionado);
        }
        
        // Enviar datos
        const datosPost = {
            titulo,
            descripcion: desc,
            imagen_url: imagenBase64,
            status: estado
        };
        
        const respuesta = await fetch('../../backend/publicar.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosPost)
        });
        
        if (!respuesta.ok) {
            throw new Error(`HTTP ${respuesta.status}`);
        }
        
        const resultado = await respuesta.json();
        
        if (resultado.success) {
            alert(`✅ Post guardado como ${estado}`);
            cerrarModal();
            
            // Recargar listado si la función existe
            if (typeof cargarPostsDelAutor === 'function') {
                cargarPostsDelAutor();
            }
        } else {
            alert(`❌ ${resultado.error}`);
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
    } finally {
        enviando = false;
        if (btnAccion) {
            btnAccion.textContent = textoOriginal;
            btnAccion.disabled = false;
        }
    }
}

function convertirABase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Error al leer archivo'));
        reader.readAsDataURL(file);
    });
}

// ============================================
// UTILIDADES
// ============================================
function resetearFormulario() {
    const postTitle = document.getElementById('postTitle');
    const postDesc = document.getElementById('postDesc');
    const fileInput = document.getElementById('fileInput');
    const imgPreview = document.getElementById('imgPreview');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    
    // ✅ CAMBIO: Usar IDs correctos
    if (postTitle) postTitle.value = '';
    if (postDesc) postDesc.value = '';
    if (fileInput) fileInput.value = '';
    if (imgPreview) imgPreview.src = '';
    if (fileNameDisplay) fileNameDisplay.textContent = 'Selecciona una imagen';
    
    archivoSeleccionado = null;
    
    // ✅ CAMBIO: Agregar esto que faltaba
    const pantalla1 = document.getElementById('pantalla1');
    const pantalla2 = document.getElementById('pantalla2');
    
    if (pantalla1) pantalla1.classList.remove('d-none');
    if (pantalla2) pantalla2.classList.add('d-none');
}

// ✅ CAMBIO: Crear función cerrarModal()
function cerrarModal() {
    if (modal) {
        modal.classList.add('d-none');
    }
    resetearFormulario();
}

// ============================================
// EVENT LISTENERS - BOTONES
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
    
    if (!confirm('¿Estás seguro de que deseas enviar este post a revisión?')) {
        return;
    }
    
    boton.disabled = true;
    const textoOriginal = boton.textContent;
    boton.textContent = '⏳ Enviando...';
    
    try {
        const respuesta = await fetch('backend/cambiar_estado_post.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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
                listaRevision.insertAdjacentElement('afterbegin', tarjeta);
            }
            
            const etiqueta = tarjeta.querySelector('.etiqueta-borrador');
            if (etiqueta) {
                etiqueta.textContent = 'En Revisión';
            }
            
            const btnRevision = tarjeta.querySelector('.btn-revision-post');
            if (btnRevision) {
                btnRevision.remove();
            }
            boton.textContent = textoOriginal;
            boton.disabled = false;
        }
    } catch (error) {
        alert(`❌ Error: ${error.message}`);
        boton.textContent = textoOriginal;
        boton.disabled = false;
    }
}