const modal = document.getElementById('modalAdmin');
const btnOpen = document.getElementById('btnAbrirModal');
const btnClose = document.getElementById('btnCerrar');
const fileInput = document.getElementById('fileInput');
const btnVolver = document.querySelector('.btnVolver');

// Abrir y cerrar
btnOpen.onclick = () => modal.style.display = 'flex';
btnClose.onclick = () => modal.style.display = 'none';

// Seleccionamos el botón de volver (puedes usar ID o clase)
btnVolver.onclick = () => {
    // 1. Ocultar la pantalla de detalles (Pantalla 2)
    document.getElementById('pantalla2').classList.add('d-none');
    
    // 2. Mostrar la pantalla de subida (Pantalla 1)
    document.getElementById('pantalla1').classList.remove('d-none');
    
    // 3. Limpiar el input de archivo para permitir nuevas subidas
    document.getElementById('fileInput').value = "";
};

// Detectar cuando se sube una imagen
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        // 1. Mostrar preview
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('imgPreview').src = event.target.result;
            document.getElementById('fileNameDisplay').textContent = file.name;
        };
        reader.readAsDataURL(file);

        // 2. Cambiar de pantalla
        document.getElementById('pantalla1').classList.add('d-none');
        document.getElementById('pantalla2').classList.remove('d-none');
    }
};

// Listener para Guardar como Borrador
document.getElementById('btnGuardarBorrador').onclick = () => manejarPublicacion('borrador');

// Listener para Enviar a Revisión
document.getElementById('btnEnviarRevision').onclick = () => manejarPublicacion('revision');