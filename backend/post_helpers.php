<?php

function publicaciones_tiene_columna($conexion, $columna) {
    static $cache = [];

    $columnas_permitidas = [
        'tipo' => true,
        'youtube_url' => true,
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

function normalizar_tipo_post($tipo) {
    $tipo = trim(strtolower($tipo ?: 'articulo'));
    $tipos_permitidos = ['articulo', 'video', 'noticia', 'recurso'];

    return in_array($tipo, $tipos_permitidos, true)
        ? $tipo
        : 'articulo';
}

function normalizar_categoria_post($categoria_id) {
    $categoria_id = intval($categoria_id ?: 1);
    $categorias_permitidas = [1, 2, 3, 4, 5, 6, 7, 8];

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
    return in_array($seccion, ['post', 'aviso'], true)
        ? $seccion
        : 'post';
}

function normalizar_tipo_aviso($tipo_aviso) {
    $tipo_aviso = trim(strtolower($tipo_aviso ?: 'academico'));
    return in_array($tipo_aviso, ['academico', 'plataforma'], true)
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

?>
