// Sistema de traduccion ES/EN para Lumina.
// Uso en HTML:
//   <el data-i18n="clave">Texto por defecto</el>
//   <input data-i18n-placeholder="clave" placeholder="...">
//   <button data-i18n-aria="clave" aria-label="..."></button>
//   <el data-i18n-title="clave" title="..."></el>
// Uso en JS:
//   t('clave')

const LUMINA_TRANSLATIONS = {
    es: {
        /* ---------------- Navbar ---------------- */
        'nav.buscar': 'Buscar...',
        'nav.inicio': 'Inicio',
        'nav.avisos': 'Avisos',
        'nav.recursos': 'Recursos',
        'nav.calendario': 'Calendario',
        'nav.cuenta': 'Cuenta',
        'nav.iniciar_sesion': 'Iniciar Sesión',
        'nav.cerrar_sesion': 'Cerrar Sesión',
        'nav.registrarse': 'Registrarse',
        'nav.ajustes': 'Ajustes',
        'nav.panel_autor': 'Panel Autor',
        'nav.panel_editor': 'Panel Editor',
        'nav.panel_admin': 'Panel Admin',
        'nav.me_gusta': 'Me gusta',
        'nav.guardados': 'Guardados',

        /* ---------------- Footer ---------------- */
        'footer.tagline': 'Plataforma de difusión digital académica',
        'footer.aria_enlaces': 'Enlaces del sitio',
        'footer.materia1': 'POO',
        'footer.materia2': 'Servicios de Internet',
        'footer.materia3': 'Ciclo de Vida',
        'footer.materia4': 'Métodos Numéricos',
        'footer.materia5': 'Desarrollo Emprendedor',
        'footer.materia6': 'Sistemas Digitales',
        'footer.materia7': 'Inglés',
        'footer.materia8': 'Orientación y Tutoría',
        'footer.copy': '© 2026 Lumina: Claridad a la información',

        /* ---------------- Títulos de página ---------------- */
        'page.inicio': 'Lumina - Inicio',
        'page.avisos': 'Lumina - Avisos',
        'page.recursos': 'Lumina - Recursos',
        'page.calendario': 'Lumina - Calendario',
        'page.busqueda': 'Lumina - Búsqueda',
        'page.login': 'Lumina - Iniciar sesión',
        'page.registro': 'Lumina - Registrarse',
        'page.cuenta': 'Lumina - Cuenta',
        'page.likes': 'Lumina - Me gusta',
        'page.saved': 'Lumina - Guardados',
        'page.dashboard_autor': 'Lumina - Panel Autor',
        'page.dashboard_editor': 'Lumina - Panel Editor',
        'page.dashboard_admin': 'Lumina - Panel Admin',

        /* ---------------- Comunes ---------------- */
        'comun.leer_mas': 'Leer más',
        'comun.descargar': 'Descargar',
        'comun.me_gusta': 'Me gusta',
        'comun.guardar': 'Guardar',
        'comun.publicar': 'Publicar',
        'comun.cancelar': 'Cancelar',
        'comun.guardar_cambios': 'Guardar cambios',
        'comun.enviar_revision': 'Enviar a revisión',
        'comun.cerrar': 'Cerrar',
        'comun.cargando': 'Cargando...',
        'comun.por': 'Por',
        'comun.maestro_asignado': 'Maestro asignado:',
        'comun.sin_asignar': 'Sin asignar',
        'comun.ver_todas': 'Ver todas →',
        'comun.crear': 'Crear',
        'comun.editar': 'Editar',
        'comun.eliminar': 'Eliminar',
        'comun.aprobar': 'Aprobar',
        'comun.rechazar': 'Rechazar',
        'comun.mandar_revision': 'Mandar a revisión',
        'comun.abrir_cuenta': 'Abrir menú de cuenta',
        'comun.foto_perfil': 'Foto de perfil',
        'comun.cambiar_modo_noche': 'Cambiar a modo noche',
        'comun.ver_contenido': 'Ver contenido',

        /* ---------------- Tipos de publicación ---------------- */
        'tipo.articulo': 'Artículo',
        'tipo.video': 'Video',
        'tipo.recurso': 'Recurso',
        'tipo.publicacion': 'Publicación',
        'tipo.academico': 'Académico',
        'tipo.plataforma': 'Plataforma',
        'tipo.urgente': 'Urgente',
        'tipo.no_urgente': 'No urgente',

        /* ---------------- Roles ---------------- */
        'rol.visitante': 'Visitante',
        'rol.autor': 'Autor',
        'rol.editor': 'Editor',
        'rol.administrador': 'Administrador',

        /* ---------------- Toggle idioma ---------------- */
        'toggle.idioma_aria': 'Cambiar idioma',

        /* ---------------- Comentarios ---------------- */
        'comentarios.titulo': 'Comentarios',
        'comentarios.placeholder': 'Añadir comentario...',
        'comentarios.vacio': 'Todavía no hay comentarios en esta materia.',
        'comentarios.cargando': 'Cargando comentarios...',
        'comentarios.borrar_titulo': 'Borrar comentario',
        'comentarios.confirmar_borrar': '¿Borrar este comentario? Esta acción no se puede deshacer.',
        'comentarios.no_se_borro': 'No se pudo borrar el comentario',
        'comentarios.escribe': 'Escribe un comentario',

        /* ---------------- Nombres completos de materias ---------------- */
        'materia.poo': 'Programación Orientada a Objetos',
        'materia.si': 'Servicios de Internet',
        'materia.cv': 'Ciclo de Vida del Desarrollo del Software',
        'materia.mn': 'Métodos Numéricos',
        'materia.de': 'Desarrollo Emprendedor',
        'materia.sd': 'Sistemas Digitales',
        'materia.ing': 'Inglés',
        'materia.ot': 'Orientación y Tutoría',

        /* ---------------- Materias ---------------- */
        'materia.explora': 'Explora la clase',
        'materia.filtro_todo': 'Todo',
        'materia.filtro_articulos': 'Artículos',
        'materia.filtro_videos': 'Videos',
        'materia.filtro_recursos': 'Recursos',
        'materia.sin_publicaciones': 'No hay publicaciones aún',
        'materia.no_se_cargaron': 'No se pudieron cargar las publicaciones.',

        /* ---------------- Avisos ---------------- */
        'avisos.titulo': 'Avisos',
        'avisos.desc': 'Entérate de los anuncios escolares recientes en esta parte de la página web',
        'avisos.cargando': 'Cargando avisos...',
        'avisos.publicado_el': 'Publicado el',
        'avisos.sin_avisos': 'No hay avisos publicados por ahora.',
        'avisos.no_se_cargaron': 'No se pudieron cargar los avisos.',

        /* ---------------- Recursos ---------------- */
        'recursos.titulo': 'Recursos',
        'recursos.desc': 'Explora materiales de clase y publicaciones académicas recientes.',
        'recursos.material_clases': 'Material de clases',
        'recursos.reciente': 'Reciente',
        'recursos.importante': 'Importante',
        'recursos.sin_recientes': 'No hay publicaciones recientes.',
        'recursos.sin_preferencias': 'No hay publicaciones con tus preferencias activas.',

        /* ---------------- Inicio (landing) ---------------- */
        'inicio.bienvenido': 'Bienvenido a Lumina',
        'inicio.eslogan': 'Claridad a la información académica',
        'inicio.desc': 'Plataforma de publicación digital para instituciones académicas.',
        'inicio.publicaciones_recientes': 'Publicaciones recientes',
        'inicio.cargando_recientes': 'Cargando publicaciones recientes...',
        'inicio.sin_recientes': 'Aún no hay publicaciones recientes.',
        'inicio.no_recientes': 'No se pudieron cargar las publicaciones.',
        'inicio.sin_importantes': 'No hay publicaciones importantes',
        'inicio.no_importantes': 'No se pudo cargar la publicación importante',

        /* ---------------- Búsqueda ---------------- */
        'busqueda.titulo': 'Búsqueda',
        'busqueda.resultados_para': 'Resultados para',
        'busqueda.buscando': 'Buscando...',
        'busqueda.sin_publicaciones': 'No se encontraron publicaciones.',
        'busqueda.sin_resultados_para': 'Sin resultados para',
        'busqueda.intenta_otras': 'Intenta con otras palabras clave.',
        'busqueda.resultado_singular': 'publicación encontrada.',
        'busqueda.resultado_plural': 'publicaciones encontradas.',
        'busqueda.escribe': 'Escribe algo en la barra de búsqueda y presiona Enter.',
        'busqueda.error': 'Error al buscar. Intenta de nuevo.',
        'landing.hero_desc': 'La plataforma de publicación digital que centraliza avisos, recursos y convocatorias de tu institución académica en un solo lugar.',
        'landing.que_es_titulo': '¿Qué es Lumina?',
        'landing.que_es_desc': 'Lumina reúne las noticias educativas, los recursos de cada materia y las convocatorias de becas en un mismo espacio. Así estudiantes y docentes encuentran lo que necesitan sin perderse entre canales dispersos.',
        'landing.func_avisos': 'Avisos',
        'landing.func_avisos_desc': 'Mantente al día con los anuncios escolares más recientes.',
        'landing.func_recursos': 'Recursos',
        'landing.func_recursos_desc': 'Accede a material de apoyo organizado por cada materia.',
        'landing.func_calendario': 'Calendario',
        'landing.func_calendario_desc': 'Consulta fechas de exámenes, entregas y eventos importantes.',
        'landing.cta_titulo': '¿Listo para empezar?',
        'landing.cta_btn': 'Crea tu cuenta',
        'landing.iniciar_sesion': 'Iniciar sesión',

        /* ---------------- Calendario ---------------- */
        'calendario.titulo': 'Calendario',
        'calendario.titulo_completo': 'Calendario Académico',
        'calendario.desc': 'Aquí encontrarás las fechas importantes del calendario académico, incluyendo inscripciones, exámenes y eventos.',
        'calendario.alt': 'Calendario académico Lumina',

        /* ---------------- Login / Registro ---------------- */
        'login.titulo': 'Iniciar Sesión',
        'login.bienvenida': '¡Bienvenido de vuelta! Por favor ingresa tus datos',
        'login.correo': 'Correo',
        'login.password': 'Contraseña',
        'login.mantener': 'Mantener sesión iniciada',
        'login.entrar': 'Entrar',
        'login.google': 'Iniciar sesión con Google',
        'login.sin_cuenta': '¿No tienes cuenta?',
        'login.registrate': 'Regístrate aquí',
        'registro.titulo': 'Registrarse',
        'registro.bienvenida': '¡Bienvenido! Por favor ingresa tus datos',
        'registro.nombre': 'Nombre',
        'registro.usuario': 'Nombre de usuario',
        'registro.recordar': 'Recordar contraseña',
        'registro.btn': 'Registrar',

        /* ---------------- Cuenta ---------------- */
        'cuenta.titulo': 'Cuenta',
        'cuenta.ajustes': 'Ajustes',
        'cuenta.desc': 'Administra tus datos, preferencias y actividad dentro de Lumina.',
        'cuenta.publicaciones_guardadas': 'Publicaciones guardadas',
        'cuenta.datos_personales': 'Datos Personales',
        'cuenta.nombre': 'Nombre',
        'cuenta.usuario_label': 'Usuario',
        'cuenta.correo': 'Correo',
        'cuenta.password': 'Contraseña',
        'cuenta.avatar_hint': 'Haz click para cambiar tu foto',
        'cuenta.cambiar_foto': 'Cambiar foto de perfil',
        'cuenta.upload_main': 'Selecciona una imagen para tu perfil',
        'cuenta.upload_sub': 'JPG, PNG o WEBP. Máximo 5 MB.',
        'cuenta.seleccionar_imagen': 'Seleccionar imagen',
        'cuenta.imagen_seleccionada': 'Imagen seleccionada',
        'cuenta.guardar_foto': 'Guardar foto',
        'cuenta.preferencias': 'Preferencias de contenido',

        /* ---------------- Admin panel ---------------- */
        'admin.titulo': 'Panel Admin',
        'admin.desc': 'Crea nuevos post y mándalos a revisión.',
        'admin.usuarios': 'Usuarios',
        'admin.categorias': 'Categorías',
        'admin.materias': 'Materias',
        'admin.buscar_usuario': 'Buscar usuario...',
        'admin.buscar_materia': 'Buscar materia...',
        'admin.todos_los_roles': 'Todos los roles',
        'admin.todos_los_estados': 'Todos los estados',
        'admin.activo': 'Activo',
        'admin.inactivo': 'Inactivo',
        'admin.editar': 'Editar',
        'admin.eliminar': 'Eliminar',
        'admin.nueva_categoria': 'Nueva Categoría',
        'admin.col_usuario': 'Usuario',
        'admin.col_username': 'Username',
        'admin.col_correo': 'Correo',
        'admin.col_estado': 'Estado',
        'admin.col_rol': 'Rol',
        'admin.col_acciones': 'Acciones',
        'admin.titulo_pagina': 'Panel de administración',
        'admin.desc_pagina': 'Control total del sistema',
        'admin.publicaciones_creadas': 'Publicaciones creadas',
        'admin.usuarios_creados': 'Usuarios creados',
        'admin.usuarios_por_rol': 'Usuarios por rol',
        'admin.gestion': 'Gestión',
        'admin.gestion_usuarios': 'Gestión de usuarios',
        'admin.gestion_categorias': 'Gestión de categorías',
        'admin.agregar_usuario': 'Agregar usuario',
        'admin.agregar_categoria': 'Agregar categoría',
        'admin.col_nombre': 'Nombre',
        'admin.col_email': 'Email',
        'admin.modal_user_titulo': 'Agregar Usuario',
        'admin.modal_user_nombre': 'Nombre',
        'admin.modal_user_usuario': 'Usuario',
        'admin.modal_user_email': 'Email',
        'admin.modal_user_password': 'Contraseña',
        'admin.modal_user_rol': 'Rol',
        'admin.modal_user_materias': 'Materias Asignadas',
        'admin.modal_user_ph_nombre': 'Ej. Juan Pérez',
        'admin.modal_user_ph_usuario': 'Ej. juanperez',
        'admin.modal_user_ph_email': 'ejemplo@correo.com',
        'admin.modal_user_ph_password': 'Contraseña para el usuario',
        'admin.modal_cat_nombre_ph': 'Ej. Matemáticas',
        'admin.modal_cat_desc': 'Descripción',
        'admin.modal_cat_desc_ph': 'Breve descripción...',
        'admin.modal_cat_selecciona_imagen': 'Selecciona una imagen',
        'admin.modal_cat_estado_activa': 'Activa',
        'admin.modal_cat_estado_inactiva': 'Inactiva',
        'admin.btn_crear_cat': 'Crear Categoría',
        'admin.btn_guardar_user': 'Guardar Usuario',
        'admin.sin_datos': 'Sin datos',

        /* ---------------- Likes / Saved ---------------- */
        'likes.titulo': 'Me Gusta',
        'likes.desc': 'Consulta las publicaciones que marcaste con me gusta.',
        'likes.vacio': 'No tienes publicaciones con me gusta.',
        'saved.titulo': 'Guardados',
        'saved.desc': 'Consulta las publicaciones que guardaste para revisar después.',
        'saved.vacio': 'No tienes publicaciones guardadas.',
        'lista.cargando': 'Cargando publicaciones...',

        /* ---------------- Dashboards ---------------- */
        'dash.autor_titulo': 'Panel Autor',
        'dash.autor_desc': 'Crea nuevos posts y mándalos a revisión.',
        'dash.editor_titulo': 'Panel del Editor',
        'dash.editor_desc': 'Revisa los posts y publícalos.',
        'dash.admin_titulo': 'Panel Admin',
        'dash.borradores': 'Borradores',
        'dash.borradores_desc': 'Tus borradores se mostrarán en este apartado.',
        'dash.revision': 'En revisión',
        'dash.revision_desc': 'Tu contenido está siendo evaluado por un editor.',
        'dash.publicados': 'Publicados',
        'dash.publicados_desc': 'Tu contenido está publicado.',
        'dash.sin_borradores': 'No tienes borradores guardados. ¡Crea tu primer post!',
        'dash.sin_revision': 'No tienes posts en revisión. Envía un borrador para que el editor lo revise.',
        'dash.sin_publicados': 'Aún no tienes posts publicados. ¡Sigue adelante!',
        'dash.sin_posts_revision': 'No hay posts en revisión',

        /* ---------------- Crear post / aviso ---------------- */
        'crear.titulo': 'Crear',
        'crear.subir_post': 'Subir post',
        'crear.subir_post_desc': 'Publicación para materias, videos o recursos académicos.',
        'crear.subir_aviso': 'Subir aviso',
        'crear.subir_aviso_desc': 'Anuncio para la sección de avisos.',
        'crear.crear_post': 'Crear post',
        'crear.crear_aviso': 'Crear aviso',
        'crear.editar_post': 'Editar post',
        'crear.editar_aviso': 'Editar aviso',
        'crear.detalles': 'Detalles',
        'crear.titulo_label': 'Título',
        'crear.descripcion': 'Descripción',
        'crear.tipo': 'Tipo',
        'crear.materia': 'Materia',
        'crear.tipo_aviso': 'Tipo de aviso',
        'crear.urgencia': 'Urgencia',
        'crear.marcar_importante': 'Marcar como Importante',
        'crear.subir_imagen': 'Subir imagen',
        'crear.cambiar_imagen': 'Cambiar imagen',
        'crear.volver': 'Volver',
        'crear.guardar': 'Guardar',
        'crear.enviar_revision': 'Enviar a revisión',
        'crear.url_video': 'URL del video',
        'crear.archivo_video': 'Archivo de video (.mp4)',
        'crear.archivo_recurso': 'Archivo de recurso',
        'crear.enlace': 'Enlace',
        'crear.archivo': 'Archivo',
        'crear.subir_post_strong': 'Subir post',
        'crear.subir_aviso_strong': 'Subir aviso',
        'crear.arrastra': 'Arrastra y suelta archivos para subirlos',
        'crear.privadas': 'Tus publicaciones serán privadas hasta que el editor las apruebe.',
        'crear.seleccionar_archivos': 'Seleccionar Archivos',
        'crear.seleccionar_video': 'Seleccionar video (.mp4)',
        'crear.seleccionar_recurso': 'Seleccionar recurso',
        'crear.no_video': 'No se ha seleccionado video',
        'crear.no_archivo': 'No se ha seleccionado archivo',
        'crear.video_subiendo': 'Subiendo video...',
        'crear.video_note': 'Máximo 500 MB. Formato permitido: .mp4',
        'crear.recurso_note': 'PDF, Word, PowerPoint, Excel, ZIP o archivos de programación. Máximo 100 MB.',
        'crear.imagen_post': 'Imagen del post',
        'crear.selecciona_imagen': 'Selecciona una imagen',
        'crear.imagen_opcional': 'Imagen opcional para publicaciones de video.',
        'crear.vista_previa_video': 'Vista previa del video',
        'crear.selecciona_archivo': 'Selecciona un archivo',
        'crear.titulo_aviso_ph': 'Título del aviso',
        'crear.vista_previa': 'Vista previa',
        'crear.desc_aviso_ph': 'La descripción del aviso aparecerá aquí.',
        'crear.imagen_aviso': 'Imagen del aviso',
        'crear.tipo_academico': 'Académico',
        'crear.tipo_plataforma': 'Plataforma',
        'crear.opcion_no_urgente': 'No urgente',
        'crear.opcion_urgente': 'Urgente',
        'crear.opcion_articulo': 'Artículo',
        'crear.opcion_video': 'Video',
        'crear.opcion_recurso': 'Recurso',
        'editor.editar': 'Editar',
        'editor.aprobar': 'Aprobar',
        'editor.rechazar': 'Rechazar',
        'crear.subir_imagen_opc': 'Subir imagen (opcional)',
        'crear.cambiar_video': 'Cambiar video',
        'crear.seleccionar_video_corto': 'Seleccionar video',
        'crear.cambiar_archivo': 'Cambiar archivo',
        'crear.imagen_actual': 'Imagen actual',
        'crear.video_youtube_preview': 'Vista previa del video de YouTube',
        'crear.url_youtube_invalida': 'Ingresa una URL válida de YouTube para vista previa.',
        'crear.selecciona_mp4_preview': 'Selecciona un archivo .mp4 para vista previa.',
        'crear.cambiar_imagen': 'Cambiar imagen',
        'estado.borrador': 'Borrador',
        'estado.rechazado': 'Rechazado',
        'estado.publicado': 'Publicado',
        'estado.revision': 'En revisión',
        'meta.tipo': 'Tipo:',
        'meta.materia': 'Materia:',
        'meta.urgente': 'Urgente:',
        'meta.importante': 'Importante:',
        'meta.autor_desconocido': 'Autor desconocido',
        'meta.sin_materia': 'Sin materia',
        'meta.materia_sin_asignar': 'Materia sin asignar',
        'meta.publicacion_sin_titulo': 'Publicación sin título',
        'meta.recurso_adjunto': 'Recurso adjunto',
        'meta.usuario': 'Usuario',
        'meta.observacion': 'Observación:',
        'comun.si': 'Sí',
        'comun.no': 'No',
        'comun.eliminar_post_title': 'Eliminar post',

        /* ---------------- Alerts comunes ---------------- */
        'alert.completa_campos': 'Completa todos los campos',
        'alert.post_aprobado': '✅ Post aprobado',
        'alert.post_rechazado': '❌ Post rechazado',
        'alert.observaciones_prompt': 'Ingrese la observación o motivo de rechazo para el autor:',
        'alert.observaciones_vacia': 'Debes ingresar una observación para rechazar.',
        'alert.error_servidor': '❌ Error al conectar con el servidor',
        'alert.cambios_guardados': '✅ Cambios guardados',
        'alert.publicacion_actualizada': 'Publicación actualizada',
        'alert.publicacion_creada': 'Publicación creada',
        'alert.error_guardar': 'Error al guardar',
        'alert.confirmar_eliminar_post': '¿Seguro que quieres eliminar este post? Esta acción no se puede deshacer.',
        'alert.post_enviado_revision': 'Post enviado a revisión',
        'alert.necesita_imagen': 'Los posts requieren una imagen adjunta',
        'alert.aviso_importante_imagen': 'Los avisos importantes requieren una imagen adjunta',
        'alert.necesita_youtube': 'Debes agregar un link de YouTube',
        'alert.necesita_noticia': 'Debes agregar un link de noticia',
        'alert.debes_iniciar_sesion': 'Debes iniciar sesión para reaccionar.',
        'alert.iniciar_sesion_funcion': 'Debes iniciar sesión para usar esta función.',
        'alert.iniciar_sesion_comentar': 'Inicia sesión para comentar',
        'alert.no_guardar_reaccion': 'No se pudo guardar la reacción',
        'alert.sesion_expirada': 'Tu sesión ha expirado. Inicia sesión de nuevo.',
        'alert.no_cargar_comentarios': 'No se pudieron cargar los comentarios.',
        'alert.no_publicar_comentario': 'No se pudo publicar el comentario',
        'recursos.cargando_materias': 'Cargando materias...',
        'recursos.sin_categorias': 'No hay categorías disponibles.',
        'recursos.error_categorias': 'Error al cargar las categorías.',
        'recursos.no_categorias': 'No se pudieron cargar las categorías',
    },

    en: {
        /* ---------------- Navbar ---------------- */
        'nav.buscar': 'Search...',
        'nav.inicio': 'Home',
        'nav.avisos': 'Notices',
        'nav.recursos': 'Resources',
        'nav.calendario': 'Calendar',
        'nav.cuenta': 'Account',
        'nav.iniciar_sesion': 'Log In',
        'nav.cerrar_sesion': 'Log Out',
        'nav.registrarse': 'Sign Up',
        'nav.ajustes': 'Settings',
        'nav.panel_autor': 'Author Panel',
        'nav.panel_editor': 'Editor Panel',
        'nav.panel_admin': 'Admin Panel',
        'nav.me_gusta': 'Liked',
        'nav.guardados': 'Saved',

        /* ---------------- Footer ---------------- */
        'footer.tagline': 'Academic digital publishing platform',
        'footer.aria_enlaces': 'Site links',
        'footer.materia1': 'OOP',
        'footer.materia2': 'Internet Services',
        'footer.materia3': 'Software Life Cycle',
        'footer.materia4': 'Numerical Methods',
        'footer.materia5': 'Entrepreneurship',
        'footer.materia6': 'Digital Systems',
        'footer.materia7': 'English',
        'footer.materia8': 'Guidance and Tutoring',
        'footer.copy': '© 2026 Lumina: Clarity for information',

        /* ---------------- Page Titles ---------------- */
        'page.inicio': 'Lumina - Home',
        'page.avisos': 'Lumina - Notices',
        'page.recursos': 'Lumina - Resources',
        'page.calendario': 'Lumina - Calendar',
        'page.busqueda': 'Lumina - Search',
        'page.login': 'Lumina - Log In',
        'page.registro': 'Lumina - Sign Up',
        'page.cuenta': 'Lumina - Account',
        'page.likes': 'Lumina - Liked',
        'page.saved': 'Lumina - Saved',
        'page.dashboard_autor': 'Lumina - Author Panel',
        'page.dashboard_editor': 'Lumina - Editor Panel',
        'page.dashboard_admin': 'Lumina - Admin Panel',

        /* ---------------- Comunes ---------------- */
        'comun.leer_mas': 'Read more',
        'comun.descargar': 'Download',
        'comun.me_gusta': 'Like',
        'comun.guardar': 'Save',
        'comun.publicar': 'Publish',
        'comun.cancelar': 'Cancel',
        'comun.guardar_cambios': 'Save changes',
        'comun.enviar_revision': 'Send for review',
        'comun.cerrar': 'Close',
        'comun.cargando': 'Loading...',
        'comun.por': 'By',
        'comun.maestro_asignado': 'Assigned teacher:',
        'comun.sin_asignar': 'Unassigned',
        'comun.ver_todas': 'View all →',
        'comun.crear': 'Create',
        'comun.editar': 'Edit',
        'comun.eliminar': 'Delete',
        'comun.aprobar': 'Approve',
        'comun.rechazar': 'Reject',
        'comun.mandar_revision': 'Send for review',
        'comun.abrir_cuenta': 'Open account menu',
        'comun.foto_perfil': 'Profile photo',
        'comun.cambiar_modo_noche': 'Switch to dark mode',
        'comun.ver_contenido': 'View content',

        /* ---------------- Tipos de publicación ---------------- */
        'tipo.articulo': 'Article',
        'tipo.video': 'Video',
        'tipo.recurso': 'Resource',
        'tipo.publicacion': 'Post',
        'tipo.academico': 'Academic',
        'tipo.plataforma': 'Platform',
        'tipo.urgente': 'Urgent',
        'tipo.no_urgente': 'Not urgent',

        /* ---------------- Roles ---------------- */
        'rol.visitante': 'Visitor',
        'rol.autor': 'Author',
        'rol.editor': 'Editor',
        'rol.administrador': 'Administrator',

        /* ---------------- Toggle idioma ---------------- */
        'toggle.idioma_aria': 'Change language',

        /* ---------------- Comentarios ---------------- */
        'comentarios.titulo': 'Comments',
        'comentarios.placeholder': 'Add a comment...',
        'comentarios.vacio': 'No comments yet on this subject.',
        'comentarios.cargando': 'Loading comments...',
        'comentarios.borrar_titulo': 'Delete comment',
        'comentarios.confirmar_borrar': 'Delete this comment? This cannot be undone.',
        'comentarios.no_se_borro': 'Could not delete the comment',
        'comentarios.escribe': 'Write a comment',

        /* ---------------- Nombres completos de materias ---------------- */
        'materia.poo': 'Object-Oriented Programming',
        'materia.si': 'Internet Services',
        'materia.cv': 'Software Development Life Cycle',
        'materia.mn': 'Numerical Methods',
        'materia.de': 'Entrepreneurship',
        'materia.sd': 'Digital Systems',
        'materia.ing': 'English',
        'materia.ot': 'Guidance and Tutoring',

        /* ---------------- Materias ---------------- */
        'materia.explora': 'Explore the class',
        'materia.filtro_todo': 'All',
        'materia.filtro_articulos': 'Articles',
        'materia.filtro_videos': 'Videos',
        'materia.filtro_recursos': 'Resources',
        'materia.sin_publicaciones': 'No posts yet',
        'materia.no_se_cargaron': 'Could not load the posts.',

        /* ---------------- Avisos ---------------- */
        'avisos.titulo': 'Notices',
        'avisos.desc': 'Check out the latest school notices here.',
        'avisos.cargando': 'Loading notices...',
        'avisos.publicado_el': 'Published on',
        'avisos.sin_avisos': 'No notices published yet.',
        'avisos.no_se_cargaron': 'Could not load the notices.',

        /* ---------------- Recursos ---------------- */
        'recursos.titulo': 'Resources',
        'recursos.desc': 'Browse class materials and recent academic posts.',
        'recursos.material_clases': 'Class materials',
        'recursos.reciente': 'Recent',
        'recursos.importante': 'Featured',
        'recursos.sin_recientes': 'No recent posts yet.',
        'recursos.sin_preferencias': 'No posts match your active preferences.',

        /* ---------------- Inicio (landing) ---------------- */
        'inicio.bienvenido': 'Welcome to Lumina',
        'inicio.eslogan': 'Clarity for academic information',
        'inicio.desc': 'Digital publishing platform for academic institutions.',
        'inicio.publicaciones_recientes': 'Recent posts',
        'inicio.cargando_recientes': 'Loading recent posts...',
        'inicio.sin_recientes': 'No recent posts yet.',
        'inicio.no_recientes': 'Could not load the posts.',
        'inicio.sin_importantes': 'No featured posts yet.',
        'inicio.no_importantes': 'Could not load the featured post',

        /* ---------------- Search ---------------- */
        'busqueda.titulo': 'Search',
        'busqueda.resultados_para': 'Results for',
        'busqueda.buscando': 'Searching...',
        'busqueda.sin_publicaciones': 'No posts found.',
        'busqueda.sin_resultados_para': 'No results for',
        'busqueda.intenta_otras': 'Try different keywords.',
        'busqueda.resultado_singular': 'post found.',
        'busqueda.resultado_plural': 'posts found.',
        'busqueda.escribe': 'Type something in the search bar and press Enter.',
        'busqueda.error': 'Search error. Please try again.',
        'landing.hero_desc': 'The digital publishing platform that brings together notices, resources and scholarship calls from your academic institution in one place.',
        'landing.que_es_titulo': 'What is Lumina?',
        'landing.que_es_desc': 'Lumina gathers educational news, subject resources, and scholarship calls in one space, so students and teachers can find what they need without getting lost across scattered channels.',
        'landing.func_avisos': 'Notices',
        'landing.func_avisos_desc': 'Stay up to date with the latest school notices.',
        'landing.func_recursos': 'Resources',
        'landing.func_recursos_desc': 'Access supporting materials organized by subject.',
        'landing.func_calendario': 'Calendar',
        'landing.func_calendario_desc': 'See exam dates, deadlines, and important events.',
        'landing.cta_titulo': 'Ready to start?',
        'landing.cta_btn': 'Create your account',
        'landing.iniciar_sesion': 'Log in',

        /* ---------------- Calendario ---------------- */
        'calendario.titulo': 'Calendar',
        'calendario.titulo_completo': 'Academic Calendar',
        'calendario.desc': 'Here you will find the important dates of the academic calendar, including registrations, exams and events.',
        'calendario.alt': 'Lumina academic calendar',

        /* ---------------- Login / Registro ---------------- */
        'login.titulo': 'Log In',
        'login.bienvenida': 'Welcome back! Please enter your details',
        'login.correo': 'Email',
        'login.password': 'Password',
        'login.mantener': 'Keep me logged in',
        'login.entrar': 'Sign in',
        'login.google': 'Sign in with Google',
        'login.sin_cuenta': "Don't have an account?",
        'login.registrate': 'Sign up here',
        'registro.titulo': 'Sign Up',
        'registro.bienvenida': 'Welcome! Please enter your details',
        'registro.nombre': 'Name',
        'registro.usuario': 'Username',
        'registro.recordar': 'Remember password',
        'registro.btn': 'Sign up',

        /* ---------------- Cuenta ---------------- */
        'cuenta.titulo': 'Account',
        'cuenta.ajustes': 'Settings',
        'cuenta.desc': 'Manage your data, preferences and activity in Lumina.',
        'cuenta.publicaciones_guardadas': 'Saved posts',
        'cuenta.datos_personales': 'Personal data',
        'cuenta.nombre': 'Name',
        'cuenta.usuario_label': 'Username',
        'cuenta.correo': 'Email',
        'cuenta.password': 'Password',
        'cuenta.avatar_hint': 'Click to change your photo',
        'cuenta.cambiar_foto': 'Change profile photo',
        'cuenta.upload_main': 'Select an image for your profile',
        'cuenta.upload_sub': 'JPG, PNG or WEBP. Max 5 MB.',
        'cuenta.seleccionar_imagen': 'Select image',
        'cuenta.imagen_seleccionada': 'Selected image',
        'cuenta.guardar_foto': 'Save photo',
        'cuenta.preferencias': 'Content preferences',

        /* ---------------- Admin panel ---------------- */
        'admin.titulo': 'Admin Panel',
        'admin.desc': 'Create new posts and send them for review.',
        'admin.usuarios': 'Users',
        'admin.categorias': 'Categories',
        'admin.materias': 'Subjects',
        'admin.buscar_usuario': 'Search user...',
        'admin.buscar_materia': 'Search subject...',
        'admin.todos_los_roles': 'All roles',
        'admin.todos_los_estados': 'All statuses',
        'admin.activo': 'Active',
        'admin.inactivo': 'Inactive',
        'admin.editar': 'Edit',
        'admin.eliminar': 'Delete',
        'admin.nueva_categoria': 'New Category',
        'admin.col_usuario': 'User',
        'admin.col_username': 'Username',
        'admin.col_correo': 'Email',
        'admin.col_estado': 'Status',
        'admin.col_rol': 'Role',
        'admin.col_acciones': 'Actions',
        'admin.titulo_pagina': 'Administration Panel',
        'admin.desc_pagina': 'Full system control',
        'admin.publicaciones_creadas': 'Posts created',
        'admin.usuarios_creados': 'Users created',
        'admin.usuarios_por_rol': 'Users by role',
        'admin.gestion': 'Management',
        'admin.gestion_usuarios': 'User management',
        'admin.gestion_categorias': 'Category management',
        'admin.agregar_usuario': 'Add user',
        'admin.agregar_categoria': 'Add category',
        'admin.col_nombre': 'Name',
        'admin.col_email': 'Email',
        'admin.modal_user_titulo': 'Add User',
        'admin.modal_user_nombre': 'Name',
        'admin.modal_user_usuario': 'Username',
        'admin.modal_user_email': 'Email',
        'admin.modal_user_password': 'Password',
        'admin.modal_user_rol': 'Role',
        'admin.modal_user_materias': 'Assigned subjects',
        'admin.modal_user_ph_nombre': 'E.g. John Doe',
        'admin.modal_user_ph_usuario': 'E.g. johndoe',
        'admin.modal_user_ph_email': 'example@email.com',
        'admin.modal_user_ph_password': 'Password for the user',
        'admin.modal_cat_nombre_ph': 'E.g. Mathematics',
        'admin.modal_cat_desc': 'Description',
        'admin.modal_cat_desc_ph': 'Brief description...',
        'admin.modal_cat_selecciona_imagen': 'Select an image',
        'admin.modal_cat_estado_activa': 'Active',
        'admin.modal_cat_estado_inactiva': 'Inactive',
        'admin.btn_crear_cat': 'Create Category',
        'admin.btn_guardar_user': 'Save User',
        'admin.sin_datos': 'No data',

        /* ---------------- Likes / Saved ---------------- */
        'likes.titulo': 'Liked',
        'likes.desc': 'Posts you liked.',
        'likes.vacio': 'You have no liked posts.',
        'saved.titulo': 'Saved',
        'saved.desc': 'Posts you saved to review later.',
        'saved.vacio': 'You have no saved posts.',
        'lista.cargando': 'Loading posts...',

        /* ---------------- Dashboards ---------------- */
        'dash.autor_titulo': 'Author Panel',
        'dash.autor_desc': 'Create new posts and send them for review.',
        'dash.editor_titulo': 'Editor Panel',
        'dash.editor_desc': 'Review posts and publish them.',
        'dash.admin_titulo': 'Admin Panel',
        'dash.borradores': 'Drafts',
        'dash.borradores_desc': 'Your drafts will appear in this section.',
        'dash.revision': 'In review',
        'dash.revision_desc': 'Your content is being evaluated by an editor.',
        'dash.publicados': 'Published',
        'dash.publicados_desc': 'Your content is published.',
        'dash.sin_borradores': 'You have no saved drafts. Create your first post!',
        'dash.sin_revision': 'You have no posts in review. Submit a draft so an editor can review it.',
        'dash.sin_publicados': 'You have no published posts yet. Keep going!',
        'dash.sin_posts_revision': 'No posts in review',

        /* ---------------- Crear post / aviso ---------------- */
        'crear.titulo': 'Create',
        'crear.subir_post': 'Upload post',
        'crear.subir_post_desc': 'Post for subjects, videos or academic resources.',
        'crear.subir_aviso': 'Upload notice',
        'crear.subir_aviso_desc': 'Notice for the notices section.',
        'crear.crear_post': 'Create post',
        'crear.crear_aviso': 'Create notice',
        'crear.editar_post': 'Edit post',
        'crear.editar_aviso': 'Edit notice',
        'crear.detalles': 'Details',
        'crear.titulo_label': 'Title',
        'crear.descripcion': 'Description',
        'crear.tipo': 'Type',
        'crear.materia': 'Subject',
        'crear.tipo_aviso': 'Notice type',
        'crear.urgencia': 'Urgency',
        'crear.marcar_importante': 'Mark as Featured',
        'crear.subir_imagen': 'Upload image',
        'crear.cambiar_imagen': 'Change image',
        'crear.volver': 'Back',
        'crear.guardar': 'Save',
        'crear.enviar_revision': 'Send for review',
        'crear.url_video': 'Video URL',
        'crear.archivo_video': 'Video file (.mp4)',
        'crear.archivo_recurso': 'Resource file',
        'crear.enlace': 'Link',
        'crear.archivo': 'File',
        'crear.subir_post_strong': 'Upload post',
        'crear.subir_aviso_strong': 'Upload notice',
        'crear.arrastra': 'Drag and drop files to upload',
        'crear.privadas': 'Your posts will be private until the editor approves them.',
        'crear.seleccionar_archivos': 'Select Files',
        'crear.seleccionar_video': 'Select video (.mp4)',
        'crear.seleccionar_recurso': 'Select resource',
        'crear.no_video': 'No video selected',
        'crear.no_archivo': 'No file selected',
        'crear.video_subiendo': 'Uploading video...',
        'crear.video_note': 'Maximum 500 MB. Allowed format: .mp4',
        'crear.recurso_note': 'PDF, Word, PowerPoint, Excel, ZIP or programming files. Maximum 100 MB.',
        'crear.imagen_post': 'Post image',
        'crear.selecciona_imagen': 'Select an image',
        'crear.imagen_opcional': 'Optional image for video posts.',
        'crear.vista_previa_video': 'Video preview',
        'crear.selecciona_archivo': 'Select a file',
        'crear.titulo_aviso_ph': 'Notice title',
        'crear.vista_previa': 'Preview',
        'crear.desc_aviso_ph': 'The notice description will appear here.',
        'crear.imagen_aviso': 'Notice image',
        'crear.tipo_academico': 'Academic',
        'crear.tipo_plataforma': 'Platform',
        'crear.opcion_no_urgente': 'Not urgent',
        'crear.opcion_urgente': 'Urgent',
        'crear.opcion_articulo': 'Article',
        'crear.opcion_video': 'Video',
        'crear.opcion_recurso': 'Resource',
        'editor.editar': 'Edit',
        'editor.aprobar': 'Approve',
        'editor.rechazar': 'Reject',
        'crear.subir_imagen_opc': 'Upload image (optional)',
        'crear.cambiar_video': 'Change video',
        'crear.seleccionar_video_corto': 'Select video',
        'crear.cambiar_archivo': 'Change file',
        'crear.imagen_actual': 'Current image',
        'crear.video_youtube_preview': 'YouTube video preview',
        'crear.url_youtube_invalida': 'Enter a valid YouTube URL for preview.',
        'crear.selecciona_mp4_preview': 'Select a .mp4 file for preview.',
        'crear.cambiar_imagen': 'Change image',
        'estado.borrador': 'Draft',
        'estado.rechazado': 'Rejected',
        'estado.publicado': 'Published',
        'estado.revision': 'In review',
        'meta.tipo': 'Type:',
        'meta.materia': 'Subject:',
        'meta.urgente': 'Urgent:',
        'meta.importante': 'Featured:',
        'meta.autor_desconocido': 'Unknown author',
        'meta.sin_materia': 'No subject',
        'meta.materia_sin_asignar': 'Unassigned subject',
        'meta.publicacion_sin_titulo': 'Untitled post',
        'meta.recurso_adjunto': 'Attached resource',
        'meta.usuario': 'User',
        'meta.observacion': 'Note:',
        'comun.si': 'Yes',
        'comun.no': 'No',
        'comun.eliminar_post_title': 'Delete post',

        /* ---------------- Alerts comunes ---------------- */
        'alert.completa_campos': 'Please fill in all fields',
        'alert.post_aprobado': '✅ Post approved',
        'alert.post_rechazado': '❌ Post rejected',
        'alert.observaciones_prompt': 'Enter the rejection reason for the author:',
        'alert.observaciones_vacia': 'You must provide a reason to reject.',
        'alert.error_servidor': '❌ Connection error',
        'alert.cambios_guardados': '✅ Changes saved',
        'alert.publicacion_actualizada': 'Post updated',
        'alert.publicacion_creada': 'Post created',
        'alert.error_guardar': 'Error saving',
        'alert.confirmar_eliminar_post': 'Are you sure you want to delete this post? This cannot be undone.',
        'alert.post_enviado_revision': 'Post sent for review',
        'alert.necesita_imagen': 'Posts require an attached image',
        'alert.aviso_importante_imagen': 'Featured notices require an attached image',
        'alert.necesita_youtube': 'You must add a YouTube link',
        'alert.necesita_noticia': 'You must add a news link',
        'alert.debes_iniciar_sesion': 'You must log in to react.',
        'alert.iniciar_sesion_funcion': 'You must log in to use this feature.',
        'alert.iniciar_sesion_comentar': 'Log in to comment',
        'alert.no_guardar_reaccion': 'Could not save the reaction',
        'alert.sesion_expirada': 'Your session has expired. Please log in again.',
        'alert.no_cargar_comentarios': 'Could not load comments.',
        'alert.no_publicar_comentario': 'Could not post the comment',
        'recursos.cargando_materias': 'Loading subjects...',
        'recursos.sin_categorias': 'No categories available.',
        'recursos.error_categorias': 'Error loading categories.',
        'recursos.no_categorias': 'Could not load categories',
    }
};

// Formatea una fecha ISO al idioma actual.
// `formato` admite: 'larga' (por defecto), 'larga-hora', 'corta-mes'.
function formatearFechaLumina(iso, formato) {
    if (!iso) return '';
    const fechaObj = new Date(String(iso).replace(' ', 'T'));
    if (Number.isNaN(fechaObj.getTime())) return String(iso);
    const lang = obtenerIdiomaLumina();
    const locale = lang === 'en' ? 'en-US' : 'es-MX';
    let opciones;
    switch (formato) {
        case 'larga-hora':
            opciones = { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' };
            break;
        case 'corta-mes':
            opciones = { day: 'numeric', month: 'short', year: 'numeric' };
            break;
        case 'larga':
        default:
            opciones = { day: '2-digit', month: 'long', year: 'numeric' };
    }
    return fechaObj.toLocaleDateString(locale, opciones);
}

function obtenerIdiomaLumina() {
    const guardado = localStorage.getItem('lumina_language');
    if (guardado === 'es' || guardado === 'en') return guardado;
    return 'es';
}

function setIdiomaLumina(lang) {
    if (lang !== 'es' && lang !== 'en') lang = 'es';
    localStorage.setItem('lumina_language', lang);
    document.documentElement.lang = lang;
    aplicarTraducciones(document);
    document.dispatchEvent(new CustomEvent('lumina-idioma-cambiado', { detail: { lang } }));
}

function t(clave, fallback) {
    const lang = obtenerIdiomaLumina();
    const dict = LUMINA_TRANSLATIONS[lang] || LUMINA_TRANSLATIONS.es;
    if (dict[clave] !== undefined) return dict[clave];
    if (LUMINA_TRANSLATIONS.es[clave] !== undefined) return LUMINA_TRANSLATIONS.es[clave];
    return fallback !== undefined ? fallback : clave;
}

const LUMINA_MATERIAS_KEYS = {
    1: 'materia.poo',
    2: 'materia.si',
    3: 'materia.cv',
    4: 'materia.mn',
    5: 'materia.de',
    6: 'materia.sd',
    7: 'materia.ing',
    8: 'materia.ot'
};

const LUMINA_MATERIAS_NOMBRES = {
    'programacion orientada a objetos': 'materia.poo',
    'programación orientada a objetos': 'materia.poo',
    'poo': 'materia.poo',
    'servicios de internet': 'materia.si',
    'ciclo de vida': 'materia.cv',
    'ciclo de vida del desarrollo de software': 'materia.cv',
    'ciclo de vida del desarrollo del software': 'materia.cv',
    'metodos numericos': 'materia.mn',
    'métodos numéricos': 'materia.mn',
    'desarrollo emprendedor': 'materia.de',
    'sistemas digitales': 'materia.sd',
    'ingles': 'materia.ing',
    'inglés': 'materia.ing',
    'orientacion y tutoria': 'materia.ot',
    'orientación y tutoría': 'materia.ot'
};

function normalizarMateriaLumina(nombre) {
    return String(nombre || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ');
}

function claveMateriaLumina(nombre, id) {
    const idNormalizado = Number(id || 0);
    if (LUMINA_MATERIAS_KEYS[idNormalizado]) return LUMINA_MATERIAS_KEYS[idNormalizado];

    const normalizado = normalizarMateriaLumina(nombre);
    return LUMINA_MATERIAS_NOMBRES[normalizado] || null;
}

function traducirMateriaLumina(nombre, id) {
    const clave = claveMateriaLumina(nombre, id);
    return clave ? t(clave, nombre) : String(nombre || '');
}

const LUMINA_ROLES_NOMBRES = {
    'visitante': 'rol.visitante',
    'autor': 'rol.autor',
    'editor': 'rol.editor',
    'administrador': 'rol.administrador',
    'admin': 'rol.administrador'
};

function claveRolLumina(nombre) {
    const normalizado = normalizarMateriaLumina(nombre);
    return LUMINA_ROLES_NOMBRES[normalizado] || null;
}

function traducirRolLumina(nombre) {
    const clave = claveRolLumina(nombre);
    return clave ? t(clave, nombre) : String(nombre || '');
}

function aplicarTraducciones(root) {
    const raiz = root || document;

    if (raiz === document) {
        const tituloPagina = document.querySelector('title[data-i18n-title-key]');
        const claveTitulo = tituloPagina?.getAttribute('data-i18n-title-key');
        if (claveTitulo) document.title = t(claveTitulo);
    }

    raiz.querySelectorAll('[data-i18n]').forEach((el) => {
        const clave = el.getAttribute('data-i18n');
        if (clave) el.textContent = t(clave);
    });

    raiz.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const clave = el.getAttribute('data-i18n-placeholder');
        if (clave) el.placeholder = t(clave);
    });

    raiz.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        const clave = el.getAttribute('data-i18n-aria');
        if (clave) el.setAttribute('aria-label', t(clave));
    });

    raiz.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const clave = el.getAttribute('data-i18n-title');
        if (clave) el.title = t(clave);
    });

    raiz.querySelectorAll('[data-i18n-alt]').forEach((el) => {
        const clave = el.getAttribute('data-i18n-alt');
        if (clave) el.alt = t(clave);
    });

    // Re-formatea fechas marcadas con data-fecha-iso al idioma actual.
    raiz.querySelectorAll('[data-fecha-iso]').forEach((el) => {
        const iso = el.getAttribute('data-fecha-iso');
        if (!iso) return;
        const formato = el.getAttribute('data-fecha-formato') || 'larga';
        el.textContent = formatearFechaLumina(iso, formato);
    });

    // Cambia el `src` de <img>/<source> entre versiones por idioma.
    // Uso: <img src="ruta_es.webp" data-src-en="ruta_en.webp">
    const lang = obtenerIdiomaLumina();
    raiz.querySelectorAll('[data-src-en]').forEach((el) => {
        const srcEn = el.getAttribute('data-src-en');
        if (!srcEn) return;
        if (!el.dataset.srcEsOriginal) {
            el.dataset.srcEsOriginal = el.getAttribute('src') || '';
        }
        if (lang === 'en') {
            if (el.getAttribute('src') !== srcEn) el.setAttribute('src', srcEn);
        } else {
            if (el.getAttribute('src') !== el.dataset.srcEsOriginal) {
                el.setAttribute('src', el.dataset.srcEsOriginal);
            }
        }
    });

    actualizarTextoToggleIdioma();
}

function actualizarTextoToggleIdioma() {
    const lang = obtenerIdiomaLumina();
    document.querySelectorAll('[data-toggle-idioma]').forEach((btn) => {
        btn.textContent = lang === 'es' ? 'EN' : 'ES';
        btn.setAttribute('aria-label', t('toggle.idioma_aria'));
        btn.title = t('toggle.idioma_aria');
    });
}

// Aplica el lang del documento desde el inicio
document.documentElement.lang = obtenerIdiomaLumina();

document.addEventListener('DOMContentLoaded', () => {
    aplicarTraducciones(document);
});

window.t = t;
window.setIdiomaLumina = setIdiomaLumina;
window.obtenerIdiomaLumina = obtenerIdiomaLumina;
window.aplicarTraducciones = aplicarTraducciones;
window.formatearFechaLumina = formatearFechaLumina;
window.traducirMateriaLumina = traducirMateriaLumina;
window.claveMateriaLumina = claveMateriaLumina;
window.traducirRolLumina = traducirRolLumina;
window.claveRolLumina = claveRolLumina;
