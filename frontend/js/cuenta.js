document.addEventListener('DOMContentLoaded', () => {
    const campos = {
        nombre: document.getElementById('cuenta-nombre'),
        usuario: document.getElementById('cuenta-usuario'),
        correo: document.getElementById('cuenta-correo'),
        password: document.getElementById('cuenta-password')
    };

    const avatarBtn = document.getElementById('btn-avatar');
    const avatarImg = document.getElementById('foto-perfil');
    const avatarIniciales = document.getElementById('avatar-iniciales');
    const modalFoto = document.getElementById('modal-foto-perfil');
    const btnCerrarFoto = document.getElementById('btn-cerrar-foto');
    const btnSeleccionarFoto = document.getElementById('btn-seleccionar-foto');
    const inputFoto = document.getElementById('input-foto-perfil');
    const uploadPanel = document.getElementById('perfil-drop-zone');
    const previewPanel = document.getElementById('perfil-preview-panel');
    const previewFoto = document.getElementById('preview-foto-perfil');
    const nombreFoto = document.getElementById('nombre-foto-perfil');
    const btnCancelarFoto = document.getElementById('btn-cancelar-foto');
    const btnGuardarFoto = document.getElementById('btn-guardar-foto');
    const btnCropZoomOut = document.getElementById('btn-crop-zoom-out');
    const btnCropZoomIn = document.getElementById('btn-crop-zoom-in');
    const btnCropReset = document.getElementById('btn-crop-reset');
    const totalLikes = document.getElementById('cuenta-total-likes');
    const totalGuardados = document.getElementById('cuenta-total-guardados');

    let fotoSeleccionada = null;
    let fotoBase64 = null;
    let cropperFoto = null;
    const PREF_KEY = 'lumina_preferencias_contenido';
    const PREF_DEFAULTS = {
        materias: {
            1: true,
            2: true,
            3: true,
            4: true,
            5: true,
            6: true,
            7: true,
            8: true
        },
        tipos: {
            articulo: true,
            video: true,
            recurso: true
        }
    };
    const PREF_LABELS = {
        materias: [
            ['1', 'materia.poo', 'Programacion Orientada a Objetos'],
            ['2', 'materia.si', 'Servicios de Internet'],
            ['3', 'materia.cv', 'Ciclo de Vida del Software'],
            ['4', 'materia.mn', 'Metodos Numericos'],
            ['5', 'materia.de', 'Desarrollo Emprendedor'],
            ['6', 'materia.sd', 'Sistemas Digitales'],
            ['7', 'materia.ing', 'Ingles'],
            ['8', 'materia.ot', 'Orientacion y Tutoria']
        ],
        tipos: [
            ['articulo', 'materia.filtro_articulos', 'Articulos'],
            ['video', 'materia.filtro_videos', 'Videos'],
            ['recurso', 'materia.filtro_recursos', 'Recursos']
        ]
    };

    const valoresActuales = {
        nombre: '',
        usuario: '',
        correo: '',
        password: '********'
    };
    let modoVisitante = false;
    const esVisitante = () => modoVisitante;

    const mostrarAviso = (mensaje, tipo = 'ok') => {
        let aviso = document.querySelector('.cuenta-aviso');

        if (!aviso) {
            aviso = document.createElement('div');
            aviso.className = 'cuenta-aviso';
            document.body.appendChild(aviso);
        }

        aviso.textContent = mensaje;
        aviso.className = `cuenta-aviso cuenta-aviso--${tipo} cuenta-aviso--visible`;

        window.clearTimeout(mostrarAviso.timeout);
        mostrarAviso.timeout = window.setTimeout(() => {
            aviso.classList.remove('cuenta-aviso--visible');
        }, 2600);
    };

    const cargarPreferencias = () => {
        try {
            const guardadas = JSON.parse(localStorage.getItem(PREF_KEY) || '{}');

            return {
                materias: {
                    ...PREF_DEFAULTS.materias,
                    ...(guardadas.materias || {})
                },
                tipos: {
                    ...PREF_DEFAULTS.tipos,
                    ...(guardadas.tipos || {})
                }
            };
        } catch (error) {
            return JSON.parse(JSON.stringify(PREF_DEFAULTS));
        }
    };

    const guardarPreferencias = (preferencias) => {
        localStorage.setItem(PREF_KEY, JSON.stringify(preferencias));
    };

    const crearItemPreferencia = (grupo, valor, clave, texto, activo) => `
        <div class="pref-item">
            <span data-i18n="${clave}">${typeof t === 'function' ? t(clave, texto) : texto}</span>
            <label class="switch">
                <input type="checkbox" class="pref-control" data-pref-group="${grupo}" data-pref-value="${valor}" ${activo ? 'checked' : ''}>
                <span class="slider"></span>
            </label>
        </div>
    `;

    const renderizarPreferencias = () => {
        const contenedor = document.querySelector('.preferencias-grid');
        if (!contenedor) return;

        const preferencias = cargarPreferencias();

        contenedor.innerHTML = `
            <div class="preferencias-card">
                ${PREF_LABELS.materias.map(([valor, clave, texto]) => (
                    crearItemPreferencia('materias', valor, clave, texto, preferencias.materias[valor] !== false)
                )).join('')}
            </div>
            <div class="preferencias-card">
                ${PREF_LABELS.tipos.map(([valor, clave, texto]) => (
                    crearItemPreferencia('tipos', valor, clave, texto, preferencias.tipos[valor] !== false)
                )).join('')}
            </div>
        `;

        if (typeof aplicarTraducciones === 'function') aplicarTraducciones(contenedor);

        contenedor.querySelectorAll('.pref-control').forEach((input) => {
            input.addEventListener('change', () => {
                const actuales = cargarPreferencias();
                actuales[input.dataset.prefGroup][input.dataset.prefValue] = input.checked;
                guardarPreferencias(actuales);
                mostrarAviso('Preferencias actualizadas.', 'ok');
            });
        });
    };

    const setCampo = (campo, valor) => {
        if (!campo) return;
        campo.value = valor || 'Sin dato';
    };

    const obtenerIniciales = (nombre) => {
        const partes = String(nombre || 'Usuario')
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (partes.length === 0) return 'U';

        return partes
            .slice(0, 2)
            .map((parte) => parte.charAt(0).toUpperCase())
            .join('');
    };

    const setFotoPerfil = (fotoUrl, nombre = valoresActuales.nombre) => {
        if (!avatarBtn || !avatarImg) return;

        if (avatarIniciales) {
            avatarIniciales.textContent = obtenerIniciales(nombre);
        }

        if (!fotoUrl) {
            avatarBtn.classList.remove('has-photo');
            avatarImg.removeAttribute('src');
            return;
        }

        avatarImg.src = fotoUrl;
        avatarBtn.classList.add('has-photo');
    };

    const activarEdicion = (campo, boton) => {
        const input = campos[campo];
        if (!input) return;

        input.disabled = false;
        input.value = campo === 'password' ? '' : valoresActuales[campo];
        input.placeholder = campo === 'password' ? 'Nueva contrasena' : '';
        input.focus();
        input.select();

        boton.textContent = 'Confirmar';
        boton.dataset.modo = 'confirmar';
        boton.classList.add('btn-confirmar');
    };

    const desactivarEdicion = (campo, boton) => {
        const input = campos[campo];
        if (!input) return;

        input.disabled = true;
        input.placeholder = '';
        setCampo(input, campo === 'password' ? '********' : valoresActuales[campo]);

        boton.textContent = 'Editar';
        boton.dataset.modo = 'editar';
        boton.classList.remove('btn-confirmar');
    };

    const guardarCambio = async (campo, boton) => {
        const input = campos[campo];
        const valor = input.value.trim();

        if (valor === '') {
            mostrarAviso('Debes agregar informacion para guardar cambios.', 'error');
            input.focus();
            return;
        }

        boton.disabled = true;

        try {
            const respuesta = await fetch('../backend/actualizar_cuenta.php', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ campo, valor })
            });
            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.ok) {
                throw new Error(datos.mensaje || 'No se pudo guardar el cambio.');
            }

            valoresActuales[campo] = campo === 'password' ? '********' : valor;
            desactivarEdicion(campo, boton);
            mostrarAviso(datos.mensaje || 'Informacion actualizada correctamente.', 'ok');
        } catch (error) {
            mostrarAviso(error.message, 'error');
        } finally {
            boton.disabled = false;
        }
    };

    const cerrarSesion = async () => {
        try {
            await fetch('../backend/cerrar_sesion.php', {
                method: 'POST',
                credentials: 'same-origin'
            });
        } finally {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    };

    const mostrarCuentaVisitante = () => {
        modoVisitante = true;
        valoresActuales.nombre = 'Visitante';
        valoresActuales.usuario = 'visitante';
        valoresActuales.correo = 'Sin cuenta';
        valoresActuales.password = 'No disponible';

        setCampo(campos.nombre, valoresActuales.nombre);
        setCampo(campos.usuario, valoresActuales.usuario);
        setCampo(campos.correo, valoresActuales.correo);
        setCampo(campos.password, valoresActuales.password);
        setFotoPerfil('', valoresActuales.nombre);
        mostrarAviso('Inicia sesión para editar tus datos y guardar actividad.', 'error');
    };

    const cargarCuenta = async () => {
        try {
            const respuesta = await fetch('../backend/obtener_cuenta.php', {
                credentials: 'same-origin'
            });

            if (respuesta.status === 401) {
                localStorage.clear();
                mostrarCuentaVisitante();
                return;
            }

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.ok) {
                throw new Error(datos.mensaje || 'No se pudo cargar la cuenta.');
            }

            modoVisitante = false;
            localStorage.setItem('sesion_activa', 'true');
            if (!localStorage.getItem('user_role')) {
                localStorage.setItem('user_role', 'Usuario');
            }
            if (typeof renderNav === 'function') {
                renderNav();
            }

            valoresActuales.nombre = datos.usuario.nombre;
            valoresActuales.usuario = datos.usuario.usuario;
            valoresActuales.correo = datos.usuario.correo;
            valoresActuales.password = datos.usuario.tiene_password ? '********' : 'Sin contrasena';

            setCampo(campos.nombre, valoresActuales.nombre);
            setCampo(campos.usuario, valoresActuales.usuario);
            setCampo(campos.correo, valoresActuales.correo);
            setCampo(campos.password, valoresActuales.password);
            setFotoPerfil(datos.usuario.foto_url, valoresActuales.nombre);
        } catch (error) {
            setCampo(campos.nombre, 'Error al cargar datos');
            setCampo(campos.usuario, 'Error al cargar datos');
            setCampo(campos.correo, 'Error al cargar datos');
            setCampo(campos.password, 'Error');
            mostrarAviso(error.message, 'error');
            console.error(error);
        }
    };

    const cargarResumenReacciones = async () => {
        if (!totalLikes && !totalGuardados) return;

        if (esVisitante()) {
            if (totalLikes) totalLikes.textContent = '0';
            if (totalGuardados) totalGuardados.textContent = '0';
            return;
        }

        try {
            const respuesta = await fetch('../backend/obtener_reacciones_usuario.php', {
                credentials: 'include'
            });
            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.success || !Array.isArray(datos.reacciones)) {
                throw new Error('No se pudo cargar el resumen de reacciones.');
            }

            const likes = datos.reacciones.filter((reaccion) => reaccion.tipo === 'like').length;
            const guardados = datos.reacciones.filter((reaccion) => reaccion.tipo === 'guardado').length;

            if (totalLikes) totalLikes.textContent = String(likes);
            if (totalGuardados) totalGuardados.textContent = String(guardados);
        } catch (error) {
            console.error(error);
        }
    };

    const abrirModalFoto = () => {
        if (!modalFoto) return;
        modalFoto.classList.add('visible');
    };

    const cerrarModalFoto = () => {
        if (!modalFoto) return;

        modalFoto.classList.remove('visible');
        fotoSeleccionada = null;
        fotoBase64 = null;
        destruirCropperFoto();

        if (inputFoto) inputFoto.value = '';
        if (previewFoto) previewFoto.removeAttribute('src');
        if (uploadPanel) uploadPanel.classList.remove('d-none');
        if (previewPanel) previewPanel.classList.add('d-none');
    };

    const convertirABase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const destruirCropperFoto = () => {
        if (!cropperFoto) return;
        cropperFoto.destroy();
        cropperFoto = null;
    };

    const iniciarCropperFoto = () => {
        destruirCropperFoto();

        if (!previewFoto || typeof Cropper === 'undefined') {
            return;
        }

        cropperFoto = new Cropper(previewFoto, {
            aspectRatio: 1,
            viewMode: 1,
            dragMode: 'move',
            autoCropArea: 0.86,
            background: false,
            guides: false,
            center: true,
            movable: true,
            zoomable: true,
            rotatable: false,
            scalable: false,
            cropBoxMovable: false,
            cropBoxResizable: false,
            toggleDragModeOnDblclick: false
        });
    };

    const prepararFoto = async (file) => {
        if (!file) return;

        const formatosPermitidos = ['image/jpeg', 'image/png', 'image/webp'];

        if (!formatosPermitidos.includes(file.type)) {
            mostrarAviso('Formato de imagen no permitido.', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            mostrarAviso('La imagen es demasiado pesada.', 'error');
            return;
        }

        fotoSeleccionada = file;
        fotoBase64 = await convertirABase64(file);

        destruirCropperFoto();
        if (previewFoto) {
            previewFoto.onload = () => {
                iniciarCropperFoto();
                previewFoto.onload = null;
            };
            previewFoto.src = fotoBase64;
        }
        if (nombreFoto) nombreFoto.textContent = file.name;
        if (uploadPanel) uploadPanel.classList.add('d-none');
        if (previewPanel) previewPanel.classList.remove('d-none');
    };

    const obtenerFotoRecortada = () => {
        if (!cropperFoto) {
            return fotoBase64;
        }

        const canvas = cropperFoto.getCroppedCanvas({
            width: 512,
            height: 512,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        return canvas.toDataURL('image/webp', 0.9);
    };

    const dataUrlABlob = (dataUrl) => {
        const partes = dataUrl.split(',');
        const mime = (partes[0].match(/:(.*?);/) || [])[1] || 'image/webp';
        const binario = atob(partes[1] || '');
        const bytes = new Uint8Array(binario.length);

        for (let i = 0; i < binario.length; i += 1) {
            bytes[i] = binario.charCodeAt(i);
        }

        return new Blob([bytes], { type: mime });
    };

    const leerRespuestaJson = async (respuesta) => {
        const texto = await respuesta.text();
        let datos = null;

        try {
            datos = texto ? JSON.parse(texto) : {};
        } catch (error) {
            const limpio = texto.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
            throw new Error(limpio || 'El servidor no devolvio una respuesta valida.');
        }

        if (!respuesta.ok) {
            throw new Error(datos.mensaje || `HTTP ${respuesta.status}`);
        }

        return datos;
    };

    const guardarFoto = async () => {
        if (!fotoSeleccionada || !fotoBase64) {
            mostrarAviso('Selecciona una imagen primero.', 'error');
            return;
        }

        btnGuardarFoto.disabled = true;

        try {
            const formData = new FormData();
            formData.append('image_file', dataUrlABlob(obtenerFotoRecortada()), 'perfil.webp');

            const respuesta = await fetch('../backend/actualizar_foto_perfil.php', {
                method: 'POST',
                credentials: 'same-origin',
                body: formData
            });
            const datos = await leerRespuestaJson(respuesta);

            if (!datos.ok) {
                throw new Error(datos.mensaje || 'No se pudo guardar la foto.');
            }

            setFotoPerfil(datos.foto_url, valoresActuales.nombre);
            cerrarModalFoto();
            mostrarAviso(datos.mensaje || 'Foto actualizada correctamente.', 'ok');
        } catch (error) {
            mostrarAviso(error.message, 'error');
        } finally {
            btnGuardarFoto.disabled = false;
        }
    };

    document.querySelectorAll('.btn-editar[data-campo]').forEach((boton) => {
        boton.dataset.modo = 'editar';
        boton.addEventListener('click', () => {
            if (esVisitante()) {
                mostrarAviso('Inicia sesión para editar tus datos.', 'error');
                return;
            }

            const campo = boton.dataset.campo;

            if (boton.dataset.modo === 'confirmar') {
                guardarCambio(campo, boton);
                return;
            }

            activarEdicion(campo, boton);
        });
    });

    const btnCerrar = document.getElementById('btn-cerrar-cuenta');
    if (btnCerrar) {
        btnCerrar.addEventListener('click', (e) => {
            e.preventDefault();
            if (esVisitante()) {
                window.location.href = 'login.html';
                return;
            }
            cerrarSesion();
        });
    }

    if (avatarBtn) avatarBtn.addEventListener('click', () => {
        if (esVisitante()) {
            mostrarAviso('Inicia sesión para cambiar tu foto.', 'error');
            return;
        }
        abrirModalFoto();
    });
    if (btnCerrarFoto) btnCerrarFoto.addEventListener('click', cerrarModalFoto);
    if (btnCancelarFoto) btnCancelarFoto.addEventListener('click', cerrarModalFoto);
    if (btnGuardarFoto) btnGuardarFoto.addEventListener('click', guardarFoto);
    if (btnCropZoomOut) btnCropZoomOut.addEventListener('click', () => cropperFoto?.zoom(-0.1));
    if (btnCropZoomIn) btnCropZoomIn.addEventListener('click', () => cropperFoto?.zoom(0.1));
    if (btnCropReset) btnCropReset.addEventListener('click', () => cropperFoto?.reset());

    if (modalFoto) {
        modalFoto.addEventListener('click', (event) => {
            if (event.target === modalFoto) cerrarModalFoto();
        });
    }

    if (btnSeleccionarFoto && inputFoto) {
        btnSeleccionarFoto.addEventListener('click', () => inputFoto.click());
        inputFoto.addEventListener('change', (event) => {
            prepararFoto(event.target.files[0]);
        });
    }

    renderizarPreferencias();
    cargarCuenta();
    cargarResumenReacciones();
});
