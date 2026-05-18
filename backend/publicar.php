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

$data = json_decode(file_get_contents('php://input'), true);
if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos invalidos']);
    exit;
}

$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$seccion = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
$tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
$urgente = normalizar_booleano($data['urgente'] ?? 0);
$importante = normalizar_booleano($data['importante'] ?? 0);
$categoria_id = obtener_categoria_post_desde_data($data);
$status = normalizar_status_post($data['status'] ?? 'borrador');
$youtube_url = trim($data['youtube_url'] ?? '');
$noticia_url = trim($data['noticia_url'] ?? '');

if ($seccion === 'aviso') {
    $categoria_id = 9;
}

if (!$status) {
    echo json_encode(['success' => false, 'error' => 'Estado de publicacion no valido']);
    exit;
}

if ($titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Titulo y descripcion son obligatorios']);
    exit;
}

if ($seccion === 'post') {
    if ($tipo === 'video' && $youtube_url === '') {
        echo json_encode(['success' => false, 'error' => 'Debes agregar un link de YouTube']);
        exit;
    }
    if ($tipo === 'noticia' && $noticia_url === '') {
        echo json_encode(['success' => false, 'error' => 'Debes agregar un link de noticia']);
        exit;
    }
}

$autor_id = intval($_SESSION['usuario_id']);
$imagen_url = null;
$resultado_imagen = guardar_imagen_post_base64($data['imagen'] ?? null, $seccion . '_' . $autor_id);

if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
    echo json_encode($resultado_imagen);
    exit;
}

if (is_array($resultado_imagen)) {
    $imagen_url = $resultado_imagen['imagen_url'];
}

if ($seccion === 'aviso' && $importante === 1 && !$imagen_url) {
    echo json_encode(['success' => false, 'error' => 'Los avisos importantes requieren imagen']);
    exit;
}

$tiene_tipo = publicaciones_tiene_columna($conexion, 'tipo');
$tiene_youtube_url = publicaciones_tiene_columna($conexion, 'youtube_url');
$tiene_noticia_url = publicaciones_tiene_columna($conexion, 'noticia_url');
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$tiene_tipo_aviso = publicaciones_tiene_columna($conexion, 'tipo_aviso');
$tiene_urgente = publicaciones_tiene_columna($conexion, 'urgente');
$tiene_importante = publicaciones_tiene_columna($conexion, 'importante');

$columnas = ['titulo', 'descripcion', 'imagen_url'];
$tipos_bind = 'sss';
$valores = [$titulo, $descripcion, $imagen_url];

if ($tiene_tipo) {
    $columnas[] = 'tipo';
    $tipos_bind .= 's';
    $valores[] = $tipo;
}

$columnas[] = 'categoria_id';
$tipos_bind .= 'i';
$valores[] = $categoria_id;

$columnas[] = 'status';
$tipos_bind .= 's';
$valores[] = $status;

$columnas[] = 'autor_id';
$tipos_bind .= 'i';
$valores[] = $autor_id;

if ($tiene_youtube_url) {
    $columnas[] = 'youtube_url';
    $tipos_bind .= 's';
    $valores[] = $youtube_url;
}

if ($tiene_noticia_url) {
    $columnas[] = 'noticia_url';
    $tipos_bind .= 's';
    $valores[] = $noticia_url;
}

if ($tiene_seccion) {
    $columnas[] = 'seccion';
    $tipos_bind .= 's';
    $valores[] = $seccion;
}

if ($tiene_tipo_aviso) {
    $columnas[] = 'tipo_aviso';
    $tipos_bind .= 's';
    $valores[] = $tipo_aviso;
}

if ($tiene_urgente) {
    $columnas[] = 'urgente';
    $tipos_bind .= 'i';
    $valores[] = $urgente;
}

if ($tiene_importante) {
    $columnas[] = 'importante';
    $tipos_bind .= 'i';
    $valores[] = $importante;
}

$placeholders = implode(', ', array_fill(0, count($columnas), '?'));
$sql = "INSERT INTO publicaciones (" . implode(', ', $columnas) . ") VALUES ($placeholders)";
$stmt = $conexion->prepare($sql);

if (!$stmt) {
    echo json_encode(['success' => false, 'error' => 'Error SQL: ' . $conexion->error]);
    exit;
}

$stmt->bind_param($tipos_bind, ...$valores);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'post_id' => $conexion->insert_id,
        'imagen_url' => $imagen_url,
        'tipo' => $tipo,
        'categoria_id' => $categoria_id,
        'status' => $status,
        'youtube_url' => $youtube_url,
        'noticia_url' => $noticia_url,
        'seccion' => $seccion,
        'tipo_aviso' => $tipo_aviso,
        'urgente' => $urgente,
        'importante' => $importante,
        'mensaje' => 'Publicacion creada correctamente'
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Error al guardar: ' . $stmt->error]);
}

$stmt->close();
$conexion->close();
?>
