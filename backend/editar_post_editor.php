<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado']);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);

$rol_stmt = $conexion->prepare("SELECT rol_id FROM usuarios WHERE id = ?");
$rol_stmt->bind_param("i", $usuario_id);
$rol_stmt->execute();
$rol_row = $rol_stmt->get_result()->fetch_assoc();
$rol_stmt->close();

$rol_id = intval($rol_row['rol_id'] ?? 0);

if ($rol_id !== 3 && $rol_id !== 4) {
    http_response_code(403);
    echo json_encode(['success' => false, 'error' => 'Sin permisos de editor']);
    exit;
}

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true);

if (!$data) {
    $data = $_POST;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST'
    && stripos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false
    && empty($_POST)
    && empty($_FILES)
) {
    echo json_encode([
        'success' => false,
        'error' => 'Carga rechazada. Verifica upload_max_filesize y post_max_size en php.ini.'
    ]);
    exit;
}

if (!is_array($data)) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

$post_id     = intval($data['post_id'] ?? 0);
$titulo      = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$seccion     = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$imagen      = $data['imagen'] ?? null;

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
    exit;
}

// Se construye el UPDATE segun el tipo de publicacion (post o aviso).
$set = ['titulo = ?', 'descripcion = ?'];
$tipos_bind = 'ss';
$valores = [$titulo, $descripcion];

if ($seccion === 'aviso') {
    $tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
    $urgente    = normalizar_booleano($data['urgente'] ?? 0);
    $importante = normalizar_booleano($data['importante'] ?? 0);
    $imagen_url = null;

    $imagen_stmt = $conexion->prepare("SELECT imagen_url FROM publicaciones WHERE id = ? AND status = 'revision'");
    if (!$imagen_stmt) {
        echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
        exit;
    }

    $imagen_stmt->bind_param('i', $post_id);
    $imagen_stmt->execute();
    $imagen_row = $imagen_stmt->get_result()->fetch_assoc();
    $imagen_stmt->close();

    if (!$imagen_row) {
        echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
        exit;
    }

    $imagen_url = $imagen_row['imagen_url'] ?? null;
    $resultado_imagen = guardar_imagen_post_base64($imagen, 'aviso_editor_' . $usuario_id);

    if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
        echo json_encode($resultado_imagen);
        exit;
    }

    if (is_array($resultado_imagen)) {
        $imagen_url = $resultado_imagen['imagen_url'];
    }

    if ($importante === 1 && !$imagen_url) {
        echo json_encode(['success' => false, 'error' => 'Los avisos importantes requieren imagen']);
        exit;
    }

    if (publicaciones_tiene_columna($conexion, 'seccion')) {
        $set[] = 'seccion = ?';
        $tipos_bind .= 's';
        $valores[] = 'aviso';
    }
    if (publicaciones_tiene_columna($conexion, 'tipo_aviso')) {
        $set[] = 'tipo_aviso = ?';
        $tipos_bind .= 's';
        $valores[] = $tipo_aviso;
    }
    if (publicaciones_tiene_columna($conexion, 'urgente')) {
        $set[] = 'urgente = ?';
        $tipos_bind .= 'i';
        $valores[] = $urgente;
    }
    if (publicaciones_tiene_columna($conexion, 'importante')) {
        $set[] = 'importante = ?';
        $tipos_bind .= 'i';
        $valores[] = $importante;
    }
    $set[] = 'imagen_url = ?';
    $tipos_bind .= 's';
    $valores[] = $imagen_url;
} else {
    $tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
    $categoria_id = intval($data['categoria_id'] ?? 1);
    $youtube_url = trim($data['youtube_url'] ?? '');
    $video_url_solicitado = trim($data['video_url'] ?? '');
    $archivo_url_solicitado = trim($data['archivo_url'] ?? $data['noticia_url'] ?? '');
    $video_upload_present = upload_archivo_intentado($_FILES['video_file'] ?? null);
    $recurso_upload_present = upload_archivo_intentado($_FILES['resource_file'] ?? null);

    if ($tipo === 'video' && $youtube_url === '' && $video_url_solicitado === '' && !$video_upload_present) {
        echo json_encode(['success' => false, 'error' => 'Debes agregar un link de video o subir un archivo']);
        exit;
    }
    if ($tipo === 'recurso' && $archivo_url_solicitado === '' && !$recurso_upload_present) {
        echo json_encode(['success' => false, 'error' => 'Debes subir un archivo de recurso']);
        exit;
    }

    $set[] = 'categoria_id = ?';
    $tipos_bind .= 'i';
    $valores[] = $categoria_id;

    if (publicaciones_tiene_columna($conexion, 'tipo')) {
        $set[] = 'tipo = ?';
        $tipos_bind .= 's';
        $valores[] = $tipo;
    }

    $tiene_youtube_url = publicaciones_tiene_columna($conexion, 'youtube_url');
    $tiene_video_url = publicaciones_tiene_columna($conexion, 'video_url');
    $columna_archivo = publicaciones_columna_archivo($conexion);

    $video_url_anterior = '';
    $archivo_url_anterior = '';
    if ($tiene_video_url || $columna_archivo) {
        $video_stmt = $conexion->prepare(
            "SELECT "
            . ($tiene_video_url ? "video_url" : "NULL AS video_url")
            . ($columna_archivo ? ", {$columna_archivo} AS archivo_url" : ", NULL AS archivo_url")
            . " FROM publicaciones WHERE id = ? AND status = 'revision'"
        );
        if (!$video_stmt) {
            echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
            exit;
        }
        $video_stmt->bind_param('i', $post_id);
        $video_stmt->execute();
        $video_row = $video_stmt->get_result()->fetch_assoc();
        $video_stmt->close();

        if (!$video_row) {
            echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
            exit;
        }

        $video_url_anterior = $video_row['video_url'] ?? '';
        $archivo_url_anterior = $video_row['archivo_url'] ?? '';
    }

    $video_url = $video_url_solicitado;
    $archivo_url = $archivo_url_solicitado;

    if ($video_upload_present && !$tiene_video_url) {
        echo json_encode(['success' => false, 'error' => 'La base de datos no soporta la carga de video de archivo.']);
        exit;
    }

    if ($recurso_upload_present && !$columna_archivo) {
        echo json_encode(['success' => false, 'error' => 'La base de datos no soporta la carga de recursos.']);
        exit;
    }

    if ($tiene_video_url && $video_upload_present) {
        $video_archivo_resultado = guardar_video_post_archivo($_FILES['video_file'] ?? null, 'post_editor_' . $usuario_id);

        if (is_array($video_archivo_resultado) && empty($video_archivo_resultado['success'])) {
            echo json_encode($video_archivo_resultado);
            exit;
        }

        if (is_array($video_archivo_resultado)) {
            $video_url = $video_archivo_resultado['video_url'];
        }
    }

    if ($columna_archivo && $recurso_upload_present) {
        $recurso_archivo_resultado = guardar_recurso_post_archivo($_FILES['resource_file'] ?? null, 'post_editor_' . $usuario_id);

        if (is_array($recurso_archivo_resultado) && empty($recurso_archivo_resultado['success'])) {
            echo json_encode($recurso_archivo_resultado);
            exit;
        }

        if (is_array($recurso_archivo_resultado)) {
            $archivo_url = $recurso_archivo_resultado['archivo_url'];
        }
    }

    if ($tiene_youtube_url) {
        $set[] = 'youtube_url = ?';
        $tipos_bind .= 's';
        $valores[] = $youtube_url;
    }

    if ($tiene_video_url) {
        $set[] = 'video_url = ?';
        $tipos_bind .= 's';
        $valores[] = $video_url;
    }

    if ($columna_archivo) {
        $set[] = "{$columna_archivo} = ?";
        $tipos_bind .= 's';
        $valores[] = $archivo_url;
    }
}

$tipos_bind .= 'i';
$valores[] = $post_id;

$sql = "UPDATE publicaciones
        SET " . implode(', ', $set) . "
        WHERE id = ? AND status = 'revision'";

$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param($tipos_bind, ...$valores);

if ($stmt->execute()) {
    if (isset($video_url_anterior, $video_url)
        && $video_url_anterior
        && $video_url_anterior !== $video_url
        && strpos($video_url_anterior, 'uploads/posts/') === 0
    ) {
        eliminar_archivo_frontend($video_url_anterior);
    }

    if (isset($archivo_url_anterior, $archivo_url)
        && $archivo_url_anterior
        && $archivo_url_anterior !== $archivo_url
        && strpos($archivo_url_anterior, 'uploads/') === 0
    ) {
        eliminar_archivo_frontend($archivo_url_anterior);
    }

    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();

?>
