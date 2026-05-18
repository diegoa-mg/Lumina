<?php

header('Content-Type: application/json');
session_start();

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Debes iniciar sesion']);
    exit;
}

$entrada = json_decode(file_get_contents('php://input'), true);
if (!is_array($entrada)) {
    $entrada = $_POST;
}

$usuario_id = intval($_SESSION['usuario_id']);
$elemento_id = intval($entrada['elemento_id'] ?? 0);
$seccion = trim(strtolower($entrada['seccion'] ?? 'recursos'));
$tipo = trim(strtolower($entrada['tipo'] ?? ''));

if ($elemento_id <= 0 || !in_array($tipo, ['like', 'guardado'], true)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos de reaccion invalidos']);
    exit;
}

if ($seccion === '') {
    $seccion = 'recursos';
}

$stmt_publicacion = $conexion->prepare("
    SELECT id
    FROM publicaciones
    WHERE id = ?
    AND status = 'publicado'
    LIMIT 1
");

if (!$stmt_publicacion) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt_publicacion->bind_param('i', $elemento_id);
$stmt_publicacion->execute();
$existe_publicacion = $stmt_publicacion->get_result()->num_rows > 0;
$stmt_publicacion->close();

if (!$existe_publicacion) {
    http_response_code(404);
    echo json_encode(['success' => false, 'error' => 'Publicacion no encontrada']);
    exit;
}

$stmt_buscar = $conexion->prepare("
    SELECT id
    FROM reacciones
    WHERE usuario_id = ?
    AND elemento_id = ?
    AND seccion = ?
    AND tipo_reaccion = ?
    LIMIT 1
");

if (!$stmt_buscar) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error SQL']);
    exit;
}

$stmt_buscar->bind_param('iiss', $usuario_id, $elemento_id, $seccion, $tipo);
$stmt_buscar->execute();
$reaccion = $stmt_buscar->get_result()->fetch_assoc();
$stmt_buscar->close();

$activo = false;

if ($reaccion) {
    $reaccion_id = intval($reaccion['id']);
    $stmt_eliminar = $conexion->prepare("DELETE FROM reacciones WHERE id = ?");
    $stmt_eliminar->bind_param('i', $reaccion_id);
    $stmt_eliminar->execute();
    $stmt_eliminar->close();
} else {
    $stmt_insertar = $conexion->prepare("
        INSERT INTO reacciones (usuario_id, elemento_id, seccion, tipo_reaccion)
        VALUES (?, ?, ?, ?)
    ");
    $stmt_insertar->bind_param('iiss', $usuario_id, $elemento_id, $seccion, $tipo);
    $stmt_insertar->execute();
    $stmt_insertar->close();
    $activo = true;
}

$stmt_conteos = $conexion->prepare("
    SELECT
        SUM(tipo_reaccion = 'like') AS likes,
        SUM(tipo_reaccion = 'guardado') AS guardados
    FROM reacciones
    WHERE elemento_id = ?
    AND seccion = ?
");
$stmt_conteos->bind_param('is', $elemento_id, $seccion);
$stmt_conteos->execute();
$conteos = $stmt_conteos->get_result()->fetch_assoc() ?: ['likes' => 0, 'guardados' => 0];
$stmt_conteos->close();

echo json_encode([
    'success' => true,
    'active' => $activo,
    'tipo' => $tipo,
    'elemento_id' => $elemento_id,
    'seccion' => $seccion,
    'counts' => [
        'likes' => intval($conteos['likes'] ?? 0),
        'guardados' => intval($conteos['guardados'] ?? 0)
    ]
]);

$conexion->close();

?>
