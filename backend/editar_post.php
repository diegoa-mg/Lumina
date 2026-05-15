<?php

header('Content-Type: application/json');

session_start();

include 'conexion_bd.php';
include 'post_helpers.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'error' => 'No autorizado'
    ]);

    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'error' => 'Datos invalidos'
    ]);

    exit;
}

$post_id = intval($data['post_id'] ?? 0);
$autor_id = intval($_SESSION['usuario_id']);
$titulo = trim($data['titulo'] ?? '');
$descripcion = trim($data['descripcion'] ?? '');
$seccion = normalizar_seccion_publicacion($data['seccion'] ?? 'post');
$tipo = normalizar_tipo_post($data['tipo'] ?? 'articulo');
$categoria_id = $seccion === 'aviso'
    ? 9
    : obtener_categoria_post_desde_data($data);
$tipo_aviso = normalizar_tipo_aviso($data['tipo_aviso'] ?? 'academico');
$urgente = normalizar_urgente_aviso($data['urgente'] ?? false);
$importante = normalizar_importante_post($data['importante'] ?? false, $seccion);
$imagen = $data['imagen'] ?? null;

if (!$post_id || $titulo === '' || $descripcion === '') {
    echo json_encode([
        'success' => false,
        'error' => 'Campos incompletos'
    ]);

    exit;
}

$stmt = $conexion->prepare(
    "SELECT imagen_url
    FROM publicaciones
    WHERE id = ? AND autor_id = ?"
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param("ii", $post_id, $autor_id);
$stmt->execute();
$resultado = $stmt->get_result();
$post = $resultado->fetch_assoc();
$stmt->close();

if (!$post) {
    echo json_encode([
        'success' => false,
        'error' => 'Post no encontrado'
    ]);

    exit;
}

$imagen_url = $post['imagen_url'];

$resultado_imagen = null;

if ($seccion !== 'aviso' || $importante) {
    $resultado_imagen = guardar_imagen_post_base64(
        $imagen,
        'post_' . $autor_id
    );
}

if (is_array($resultado_imagen) && empty($resultado_imagen['success'])) {
    echo json_encode($resultado_imagen);
    exit;
}

if (is_array($resultado_imagen)) {
    $imagen_url = $resultado_imagen['imagen_url'];
}

$tiene_tipo = publicaciones_tiene_columna($conexion, 'tipo');
$tiene_seccion = publicaciones_tiene_columna($conexion, 'seccion');
$tiene_tipo_aviso = publicaciones_tiene_columna($conexion, 'tipo_aviso');
$tiene_urgente = publicaciones_tiene_columna($conexion, 'urgente');
$tiene_importante = publicaciones_tiene_columna($conexion, 'importante');

$sets = ['titulo = ?', 'descripcion = ?', 'categoria_id = ?', 'imagen_url = ?'];
$types = 'ssis';
$valores = [
    &$titulo,
    &$descripcion,
    &$categoria_id,
    &$imagen_url
];

if ($tiene_tipo) {
    $sets[] = 'tipo = ?';
    $types .= 's';
    $valores[] = &$tipo;
}

if ($tiene_seccion) {
    $sets[] = 'seccion = ?';
    $types .= 's';
    $valores[] = &$seccion;
}

if ($tiene_tipo_aviso) {
    $sets[] = 'tipo_aviso = ?';
    $types .= 's';
    $valores[] = &$tipo_aviso;
}

if ($tiene_urgente) {
    $sets[] = 'urgente = ?';
    $types .= 'i';
    $valores[] = &$urgente;
}

if ($tiene_importante) {
    $sets[] = 'importante = ?';
    $types .= 'i';
    $valores[] = &$importante;
}

$types .= 'ii';
$valores[] = &$post_id;
$valores[] = &$autor_id;

$stmt = $conexion->prepare(
    "UPDATE publicaciones
    SET " . implode(', ', $sets) . "
    WHERE id = ? AND autor_id = ?"
);

if (!$stmt) {
    echo json_encode([
        'success' => false,
        'error' => 'Error SQL: ' . $conexion->error
    ]);

    exit;
}

$stmt->bind_param($types, ...$valores);

if ($stmt->execute()) {
    echo json_encode([
        'success' => true,
        'imagen_url' => $imagen_url,
        'tipo' => $tipo,
        'seccion' => $seccion,
        'tipo_aviso' => $tipo_aviso,
        'urgente' => $urgente,
        'importante' => $importante,
        'categoria_id' => $categoria_id
    ]);
} else {
    echo json_encode([
        'success' => false,
        'error' => $stmt->error
    ]);
}

$stmt->close();
$conexion->close();

?>
