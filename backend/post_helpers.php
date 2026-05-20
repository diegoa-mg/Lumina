<?php

function publicaciones_tiene_columna($conexion, $columna) {
    static $cache = [];

    $columnas_permitidas = [
        'tipo' => true,
        'youtube_url' => true,
        'video_url' => true,
        'archivo_url' => true,
        'recurso_url' => true,
        'noticia_url' => true,
        'observaciones_editor' => true,
        'seccion' => true,
        'tipo_aviso' => true,
        'urgente' => true,
        'importante' => true
    ];

    if (!isset($columnas_permitidas[$columna])) {
        return false;
    }

    if (isset($cache[$columna])) {
        return $cache[$columna];
    }

    $stmt = $conexion->prepare(
        "SELECT COUNT(*) AS total
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'publicaciones'
        AND COLUMN_NAME = ?"
    );

    if (!$stmt) {
        $cache[$columna] = false;
        return false;
    }

    $stmt->bind_param("s", $columna);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $fila = $resultado ? $resultado->fetch_assoc() : null;

    $cache[$columna] = $fila && intval($fila['total']) > 0;

    $stmt->close();

    return $cache[$columna];
}

function publicaciones_columna_archivo($conexion) {
    if (publicaciones_tiene_columna($conexion, 'archivo_url')) {
        return 'archivo_url';
    }

    if (publicaciones_tiene_columna($conexion, 'recurso_url')) {
        return 'recurso_url';
    }

    if (publicaciones_tiene_columna($conexion, 'noticia_url')) {
        return 'noticia_url';
    }

    return null;
}

function normalizar_tipo_post($tipo) {
    $tipo = trim(strtolower($tipo ?: 'articulo'));
    $tipos_permitidos = ['articulo', 'video', 'recurso'];

    return in_array($tipo, $tipos_permitidos, true)
        ? $tipo
        : 'articulo';
}

function guardar_recurso_post_archivo($archivo, $prefijo = 'recurso') {
    if (empty($archivo) || !is_array($archivo)) {
        return null;
    }

    $error = intval($archivo['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($error !== UPLOAD_ERR_OK) {
        $mensajes = [
            UPLOAD_ERR_INI_SIZE => 'El archivo supera el limite configurado en PHP.',
            UPLOAD_ERR_FORM_SIZE => 'El archivo supera el limite permitido por el formulario.',
            UPLOAD_ERR_PARTIAL => 'El archivo se subio incompleto. Intentalo otra vez.',
            UPLOAD_ERR_NO_TMP_DIR => 'No existe carpeta temporal para subir archivos.',
            UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el archivo en el servidor.',
            UPLOAD_ERR_EXTENSION => 'Una extension de PHP detuvo la subida del archivo.'
        ];

        return [
            'success' => false,
            'error' => $mensajes[$error] ?? 'Error al subir el archivo.'
        ];
    }

    if (!isset($archivo['tmp_name']) || !is_uploaded_file($archivo['tmp_name'])) {
        return [
            'success' => false,
            'error' => 'No se recibio correctamente el archivo.'
        ];
    }

    if ($archivo['size'] > 100 * 1024 * 1024) {
        return [
            'success' => false,
            'error' => 'El archivo es demasiado pesado. Maximo 100 MB.'
        ];
    }

    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $formatos_permitidos = [
        'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx',
        'txt', 'csv', 'zip', 'rar', '7z',
        'py', 'html', 'css', 'js', 'java', 'c', 'cpp', 'h',
        'json', 'xml', 'sql', 'md'
    ];

    if (!in_array($extension, $formatos_permitidos, true)) {
        return [
            'success' => false,
            'error' => 'Formato de recurso no permitido.'
        ];
    }

    $ruta_directorio = __DIR__ . '/../frontend/uploads/recursos/';

    if (!is_dir($ruta_directorio) && !mkdir($ruta_directorio, 0777, true)) {
        return [
            'success' => false,
            'error' => 'Error al crear carpeta de recursos'
        ];
    }

    $nombre_seguro = preg_replace('/[^a-zA-Z0-9_-]+/', '_', pathinfo($archivo['name'], PATHINFO_FILENAME));
    $nombre_seguro = trim($nombre_seguro, '_') ?: 'archivo';
    $nombre_archivo = $prefijo . '_' . time() . '_' . bin2hex(random_bytes(4)) . '_' . $nombre_seguro . '.' . $extension;
    $ruta_archivo = $ruta_directorio . $nombre_archivo;

    if (!move_uploaded_file($archivo['tmp_name'], $ruta_archivo)) {
        return [
            'success' => false,
            'error' => 'Error al guardar el recurso.'
        ];
    }

    return [
        'success' => true,
        'archivo_url' => 'uploads/recursos/' . $nombre_archivo
    ];
}

function normalizar_categoria_post($categoria_id) {
    $categoria_id = intval($categoria_id ?: 1);
    $categorias_permitidas = [1, 2, 3, 4, 5, 6, 7, 8, 9];

    return in_array($categoria_id, $categorias_permitidas, true)
        ? $categoria_id
        : 1;
}

function obtener_categoria_post_desde_data($data) {
    return normalizar_categoria_post(
        $data['categoria_id']
        ?? $data['materia_id']
        ?? $data['materia']
        ?? $data['postMateria']
        ?? 1
    );
}

function normalizar_status_post($status) {
    $status = trim($status ?: 'borrador');
    $status_permitidos = ['borrador', 'revision', 'publicado', 'rechazado'];

    return in_array($status, $status_permitidos, true)
        ? $status
        : null;
}

function normalizar_seccion_publicacion($seccion) {
    $seccion = trim(strtolower($seccion ?: 'post'));
    $secciones_permitidas = ['post', 'aviso'];

    return in_array($seccion, $secciones_permitidas, true)
        ? $seccion
        : 'post';
}

function normalizar_tipo_aviso($tipo_aviso) {
    $tipo_aviso = trim(strtolower($tipo_aviso ?: 'academico'));
    $tipos_permitidos = ['academico', 'plataforma'];

    return in_array($tipo_aviso, $tipos_permitidos, true)
        ? $tipo_aviso
        : 'academico';
}

function normalizar_booleano($valor) {
    if (is_bool($valor)) {
        return $valor ? 1 : 0;
    }

    if (is_numeric($valor)) {
        return intval($valor) ? 1 : 0;
    }

    $texto = trim(strtolower((string) $valor));

    return in_array($texto, ['1', 'true', 'si', 'yes', 'on'], true)
        ? 1
        : 0;
}

function guardar_imagen_post_base64($imagen, $prefijo = 'post') {
    if (empty($imagen) || strpos($imagen, 'data:image') !== 0) {
        return null;
    }

    if (!preg_match('/^data:image\/(\w+);base64,(.*)$/', $imagen, $matches)) {
        return [
            'success' => false,
            'error' => 'Imagen invalida'
        ];
    }

    $formato = strtolower($matches[1]);
    $base64_puro = $matches[2];
    $formatos_permitidos = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($formato, $formatos_permitidos, true)) {
        return [
            'success' => false,
            'error' => 'Formato de imagen no permitido'
        ];
    }

    $tamanio_kb = (strlen($base64_puro) * 0.75) / 1024;

    if ($tamanio_kb > 5120) {
        return [
            'success' => false,
            'error' => 'La imagen es demasiado pesada'
        ];
    }

    $ruta_directorio = __DIR__ . '/../frontend/uploads/posts/';

    if (!is_dir($ruta_directorio) && !mkdir($ruta_directorio, 0777, true)) {
        return [
            'success' => false,
            'error' => 'Error al crear carpeta de imagenes'
        ];
    }

    $nombre_archivo = $prefijo . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $formato;
    $ruta_archivo = $ruta_directorio . $nombre_archivo;
    $imagen_decodificada = base64_decode($base64_puro, true);

    if ($imagen_decodificada === false) {
        return [
            'success' => false,
            'error' => 'Error al decodificar imagen'
        ];
    }

    if (file_put_contents($ruta_archivo, $imagen_decodificada) === false) {
        return [
            'success' => false,
            'error' => 'Error al guardar imagen'
        ];
    }

    return [
        'success' => true,
        'imagen_url' => 'uploads/posts/' . $nombre_archivo
    ];
}

function guardar_imagen_post_archivo($archivo, $prefijo = 'post') {
    if (empty($archivo) || !is_array($archivo)) {
        return null;
    }

    $error = intval($archivo['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($error !== UPLOAD_ERR_OK) {
        $mensajes = [
            UPLOAD_ERR_INI_SIZE => 'La imagen supera el limite configurado en PHP.',
            UPLOAD_ERR_FORM_SIZE => 'La imagen supera el limite permitido por el formulario.',
            UPLOAD_ERR_PARTIAL => 'La imagen se subio incompleta. Intentalo otra vez.',
            UPLOAD_ERR_NO_TMP_DIR => 'No existe carpeta temporal para subir archivos.',
            UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir la imagen en el servidor.',
            UPLOAD_ERR_EXTENSION => 'Una extension de PHP detuvo la subida de la imagen.'
        ];

        return [
            'success' => false,
            'error' => $mensajes[$error] ?? 'Error al subir la imagen.'
        ];
    }

    if (!isset($archivo['tmp_name']) || !is_uploaded_file($archivo['tmp_name'])) {
        return [
            'success' => false,
            'error' => 'No se recibio correctamente la imagen.'
        ];
    }

    if ($archivo['size'] > 5 * 1024 * 1024) {
        return [
            'success' => false,
            'error' => 'La imagen es demasiado pesada'
        ];
    }

    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $formatos_permitidos = ['jpg', 'jpeg', 'png', 'webp'];

    if (!in_array($extension, $formatos_permitidos, true)) {
        return [
            'success' => false,
            'error' => 'Formato de imagen no permitido'
        ];
    }

    $mime_permitidos = [
        'image/jpeg' => true,
        'image/png' => true,
        'image/webp' => true
    ];
    $mime_detectado = function_exists('mime_content_type') ? mime_content_type($archivo['tmp_name']) : ($archivo['type'] ?? '');

    if (!isset($mime_permitidos[$mime_detectado])) {
        return [
            'success' => false,
            'error' => 'Formato de imagen no permitido'
        ];
    }

    $ruta_directorio = __DIR__ . '/../frontend/uploads/posts/';

    if (!is_dir($ruta_directorio) && !mkdir($ruta_directorio, 0777, true)) {
        return [
            'success' => false,
            'error' => 'Error al crear carpeta de imagenes'
        ];
    }

    $nombre_archivo = $prefijo . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $ruta_archivo = $ruta_directorio . $nombre_archivo;

    if (!move_uploaded_file($archivo['tmp_name'], $ruta_archivo)) {
        return [
            'success' => false,
            'error' => 'Error al guardar imagen'
        ];
    }

    return [
        'success' => true,
        'imagen_url' => 'uploads/posts/' . $nombre_archivo
    ];
}

function guardar_imagen_post_desde_request($imagen_base64, $archivo, $prefijo = 'post') {
    $resultado_archivo = guardar_imagen_post_archivo($archivo, $prefijo);

    if (is_array($resultado_archivo)) {
        return $resultado_archivo;
    }

    return guardar_imagen_post_base64($imagen_base64, $prefijo);
}

function guardar_video_post_archivo($archivo, $prefijo = 'post') {
    if (empty($archivo) || !is_array($archivo)) {
        return null;
    }

    $error = intval($archivo['error'] ?? UPLOAD_ERR_NO_FILE);

    if ($error === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ($error !== UPLOAD_ERR_OK) {
        $mensajes = [
            UPLOAD_ERR_INI_SIZE => 'El video supera el limite configurado en PHP.',
            UPLOAD_ERR_FORM_SIZE => 'El video supera el limite permitido por el formulario.',
            UPLOAD_ERR_PARTIAL => 'El video se subio incompleto. Intentalo otra vez.',
            UPLOAD_ERR_NO_TMP_DIR => 'No existe carpeta temporal para subir archivos.',
            UPLOAD_ERR_CANT_WRITE => 'No se pudo escribir el video en el servidor.',
            UPLOAD_ERR_EXTENSION => 'Una extension de PHP detuvo la subida del video.'
        ];

        return [
            'success' => false,
            'error' => $mensajes[$error] ?? 'Error al subir el archivo de video.'
        ];
    }

    if (!isset($archivo['tmp_name']) || !is_uploaded_file($archivo['tmp_name'])) {
        return [
            'success' => false,
            'error' => 'No se recibio correctamente el archivo de video.'
        ];
    }

    if ($archivo['size'] > 500 * 1024 * 1024) {
        return [
            'success' => false,
            'error' => 'El video es demasiado pesado. Maximo 500 MB.'
        ];
    }

    // Only accept MP4 files server-side
    if (($archivo['type'] ?? '') !== 'video/mp4') {
        return [
            'success' => false,
            'error' => 'Formato de video no permitido. Solo .mp4'
        ];
    }

    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    $formatos_permitidos = ['mp4'];

    if (!in_array($extension, $formatos_permitidos, true)) {
        return [
            'success' => false,
            'error' => 'Formato de video no permitido. Solo .mp4'
        ];
    }

    $ruta_directorio = __DIR__ . '/../frontend/uploads/posts/';

    if (!is_dir($ruta_directorio) && !mkdir($ruta_directorio, 0777, true)) {
        return [
            'success' => false,
            'error' => 'Error al crear carpeta de videos'
        ];
    }

    $nombre_archivo = $prefijo . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
    $ruta_archivo = $ruta_directorio . $nombre_archivo;

    if (!move_uploaded_file($archivo['tmp_name'], $ruta_archivo)) {
        return [
            'success' => false,
            'error' => 'Error al guardar el video.'
        ];
    }

    return [
        'success' => true,
        'video_url' => 'uploads/posts/' . $nombre_archivo
    ];
}

function upload_archivo_intentado($archivo) {
    return is_array($archivo)
        && intval($archivo['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE;
}

function eliminar_archivo_frontend($ruta_relativa, $prefijo_permitido = null) {
    $ruta_relativa = trim((string) $ruta_relativa);
    $prefijos_permitidos = $prefijo_permitido
        ? [$prefijo_permitido]
        : ['uploads/posts/', 'uploads/recursos/'];

    if ($ruta_relativa === ''
        || strpos($ruta_relativa, "\0") !== false
        || strpos($ruta_relativa, '..') !== false
    ) {
        return false;
    }

    $prefijo_valido = false;
    foreach ($prefijos_permitidos as $prefijo) {
        if (strpos($ruta_relativa, $prefijo) === 0) {
            $prefijo_valido = true;
            break;
        }
    }

    if (!$prefijo_valido) {
        return false;
    }

    $ruta_archivo = __DIR__ . '/../frontend/' . $ruta_relativa;

    if (is_file($ruta_archivo)) {
        return @unlink($ruta_archivo);
    }

    return false;
}

?>
