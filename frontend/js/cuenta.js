document.addEventListener('DOMContentLoaded', () => {
    const campos = {
        nombre: document.getElementById('cuenta-nombre'),
        usuario: document.getElementById('cuenta-usuario'),
        correo: document.getElementById('cuenta-correo'),
        password: document.getElementById('cuenta-password')
    };

    const valoresActuales = {
        nombre: '',
        usuario: '',
        correo: '',
        password: '********'
    };

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

    const setCampo = (campo, valor) => {
        if (!campo) return;
        campo.value = valor || 'Sin dato';
    };

    const activarEdicion = (campo, boton) => {
        const input = campos[campo];
        if (!input) return;

        input.disabled = false;
        input.value = campo === 'password' ? '' : valoresActuales[campo];
        input.placeholder = campo === 'password' ? 'Nueva contraseña' : '';
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

    const cargarCuenta = async () => {
        try {
            const respuesta = await fetch('../backend/obtener_cuenta.php', {
                credentials: 'same-origin'
            });

            if (respuesta.status === 401) {
                localStorage.clear();
                window.location.href = 'login.html';
                return;
            }

            const datos = await respuesta.json();

            if (!respuesta.ok || !datos.ok) {
                throw new Error(datos.mensaje || 'No se pudo cargar la cuenta.');
            }

            valoresActuales.nombre = datos.usuario.nombre;
            valoresActuales.usuario = datos.usuario.usuario;
            valoresActuales.correo = datos.usuario.correo;
            valoresActuales.password = datos.usuario.tiene_password ? '********' : 'Sin contraseña';

            setCampo(campos.nombre, valoresActuales.nombre);
            setCampo(campos.usuario, valoresActuales.usuario);
            setCampo(campos.correo, valoresActuales.correo);
            setCampo(campos.password, valoresActuales.password);
        } catch (error) {
            setCampo(campos.nombre, 'Error al cargar datos');
            setCampo(campos.usuario, 'Error al cargar datos');
            setCampo(campos.correo, 'Error al cargar datos');
            setCampo(campos.password, 'Error');
            mostrarAviso(error.message, 'error');
            console.error(error);
        }
    };

    document.querySelectorAll('.btn-editar[data-campo]').forEach((boton) => {
        boton.dataset.modo = 'editar';
        boton.addEventListener('click', () => {
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
            cerrarSesion();
        });
    }

    cargarCuenta();
});
