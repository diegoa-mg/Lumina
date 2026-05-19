<?php
header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'No autorizado. La sesión del usuario no está activa.']);
    exit;
}

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

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
    echo json_encode(['success' => false, 'error' => 'Datos invalidos']);
    exit;
}

$post_id = intval($data['post_id'] ?? 0);
$autor_id = intval($_SESSION['usuario_id']);
$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$seccion = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
$tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
$urgente = normalizar_booleano($data['urgente'] ?? 0);
$importante = normalizar_booleano($data['importante'] ?? 0);
$categoria_id = obtener_categoria_post_desde_data($data);
$youtube_url = trim($data['youtube_url'] ?? '');
$video_url_solicitado = trim($data['video_url'] ?? '');
$archivo_url_solicitado = trim($data['archivo_url'] ?? $data['noticia_url'] ?? '');
$imagen = $data['imagen'] ?? null;

if ($seccion === 'aviso') {
    $categoria_id = 9;
}

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
    exit;
}

$video_upload_present = upload_archivo_intentado($_FILES['video_file'] ?? null);
$recurso_upload_present = upload_archivo_intentado($_FILES['resource_file'] ?? null);

if ($seccion === 'post') {
    if ($tipo === 'video' && $youtube_url === '' && $video_url_solicitado === '' && !$video_upload_present) {
        echo json_encode(['success' => false, 'error' => 'Debes agregar un link de video o subir un archivo']);
        exit;
    }
    if ($tipo === 'recurso' && $archivo_url_solicitado === '' && !$recurso_upload_present) {
        echo json_encode(['success' => false, 'error' => 'Debes subir un archivo de recurso']);
        exit;
    }
}

$tiene_video_url = publicaciones_tiene_columna($conexion, 'video_url');
$columna_archivo_inicial = publicaciones_columna_archivo($conexion);
$stmt = $conexion->prepare(
    "SELECT imagen_url"
    . ($tiene_video_url ? ", video_url" : "")
    . ($columna_archivo_inicial ? ", {$columna_archivo_inicial} AS archivo_url" : "")
    . " FROM publicaciones WHERE id = ? AND autor_id = ?"
);
if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param("ii", $post_id, $autor_id);
$stmt->execute();
$resultado = $stmt->get_result();
$post = $resultado->fetch_assoc();
$stmt->close();

if (!$post) {
    echo json_encode(['success' => false, 'error' => 'Post no encontrado']);
    exit;
}

$imagen_url = $post['imagen_url'];
$video_url_anterior = $post['video_url'] ?? '';
$video_url = $video_url_solicitado;
$archivo_url_anterior = $post['archivo_url'] ?? '';
$archivo_url = $archivo_url_solicitado;
$resultado_imagen = guardar_imagen_post_base64($imagen, $seccion . '_' . $autor_id);
if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
    echo json_encode($resultado_imagen);
    exit;
}
if (is_array($resultado_imagen)) {
    $imagen_url = $resultado_imagen['imagen_url'];
}

$video_archivo_resultado = null;

// Detectar si la tabla soporta columnas adicionales (necesario antes de procesar archivos)
$tiene_tipo = publicaciones_tiene_columna($conexion, 'tipo');
$tiene_youtube_url = publicaciones_tiene_columna($conexion, 'youtube_url');
$tiene_video_url = publicaciones_tiene_columna($conexion, 'video_url');
$columna_archivo = publicaciones_columna_archivo($conexion);
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$tiene_tipo_aviso = publicaciones_tiene_columna($conexion, 'tipo_aviso');
$tiene_urgente = publicaciones_tiene_columna($conexion, 'urgente');
$tiene_importante = publicaciones_tiene_columna($conexion, 'importante');

$video_archivo_resultado = null;

if ($video_upload_present && !$tiene_video_url) {
    echo json_encode(['success' => false, 'error' => 'La base de datos no soporta la carga de video de archivo.']);
    exit;
}

if ($recurso_upload_present && !$columna_archivo) {
    echo json_encode(['success' => false, 'error' => 'La base de datos no soporta la carga de recursos.']);
    exit;
}

if ($tiene_video_url && $video_upload_present) {
    $video_archivo_resultado = guardar_video_post_archivo($_FILES['video_file'] ?? null, $seccion . '_' . $autor_id);

    if (is_array($video_archivo_resultado) && empty($video_archivo_resultado['success'])) {
        echo json_encode($video_archivo_resultado);
        exit;
    }

    if (is_array($video_archivo_resultado)) {
        $video_url = $video_archivo_resultado['video_url'];
    }
}

if ($columna_archivo && $recurso_upload_present) {
    $recurso_archivo_resultado = guardar_recurso_post_archivo($_FILES['resource_file'] ?? null, $seccion . '_' . $autor_id);

    if (is_array($recurso_archivo_resultado) && empty($recurso_archivo_resultado['success'])) {
        echo json_encode($recurso_archivo_resultado);
        exit;
    }

    if (is_array($recurso_archivo_resultado)) {
        $archivo_url = $recurso_archivo_resultado['archivo_url'];
    }
}

if ($seccion === 'aviso' && $importante === 1 && !$imagen_url) {
    echo json_encode(['success' => false, 'error' => 'Los avisos importantes requieren imagen']);
    exit;
}


/* columnas ya detectadas anteriormente */

$set = ['titulo = ?', 'descripcion = ?', 'categoria_id = ?', 'imagen_url = ?'];
$tipos_bind = 'ssis';
$valores = [$titulo, $descripcion, $categoria_id, $imagen_url];

if ($tiene_tipo) {
    $set[] = 'tipo = ?';
    $tipos_bind .= 's';
    $valores[] = $tipo;
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
if ($tiene_seccion) {
    $set[] = 'seccion = ?';
    $tipos_bind .= 's';
    $valores[] = $seccion;
}
if ($tiene_tipo_aviso) {
    $set[] = 'tipo_aviso = ?';
    $tipos_bind .= 's';
    $valores[] = $tipo_aviso;
}
if ($tiene_urgente) {
    $set[] = 'urgente = ?';
    $tipos_bind .= 'i';
    $valores[] = $urgente;
}
if ($tiene_importante) {
    $set[] = 'importante = ?';
    $tipos_bind .= 'i';
    $valores[] = $importante;
}

$tipos_bind .= 'ii';
$valores[] = $post_id;
$valores[] = $autor_id;

$sql = "UPDATE publicaciones SET " . implode(', ', $set) . " WHERE id = ? AND autor_id = ?";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param($tipos_bind, ...$valores);

if ($stmt->execute()) {
    if ($tiene_video_url
        && $video_url_anterior
        && $video_url_anterior !== $video_url
        && strpos($video_url_anterior, 'uploads/posts/') === 0
    ) {
        eliminar_archivo_frontend($video_url_anterior);
    }

    if ($columna_archivo
        && $archivo_url_anterior
        && $archivo_url_anterior !== $archivo_url
        && strpos($archivo_url_anterior, 'uploads/') === 0
    ) {
        eliminar_archivo_frontend($archivo_url_anterior);
    }

    // Si el autor pidio enviar a revision, solo se promueven borradores/rechazados.
    if (($data['status'] ?? '') === 'revision') {
        $promo = $conexion->prepare(
            "UPDATE publicaciones SET status = 'revision'
             WHERE id = ? AND autor_id = ? AND status IN ('borrador', 'rechazado')"
        );
        if ($promo) {
            $promo->bind_param('ii', $post_id, $autor_id);
            $promo->execute();
            $promo->close();
        }
    }

    echo json_encode([
        'success' => true,
        'imagen_url' => $imagen_url,
        'tipo' => $tipo,
        'categoria_id' => $categoria_id,
        'youtube_url' => $youtube_url,
        'video_url' => $video_url,
        'archivo_url' => $archivo_url,
        'seccion' => $seccion,
        'tipo_aviso' => $tipo_aviso,
        'urgente' => $urgente,
        'importante' => $importante
    ]);
} else {
    echo json_encode(['success' => false, 'error' => $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
