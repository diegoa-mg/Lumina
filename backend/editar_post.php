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
$noticia_url = trim($data['noticia_url'] ?? '');
$imagen = $data['imagen'] ?? null;

if ($seccion === 'aviso') {
    $categoria_id = 9;
}

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode(['success' => false, 'error' => 'Campos incompletos']);
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

$stmt = $conexion->prepare("SELECT imagen_url FROM publicaciones WHERE id = ? AND autor_id = ?");
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
$resultado_imagen = guardar_imagen_post_base64($imagen, $seccion . '_' . $autor_id);
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
if ($tiene_noticia_url) {
    $set[] = 'noticia_url = ?';
    $tipos_bind .= 's';
    $valores[] = $noticia_url;
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
        'noticia_url' => $noticia_url,
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
