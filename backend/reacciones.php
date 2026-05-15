<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Debes iniciar sesion para reaccionar.'
    ]);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$elemento_id = intval($_POST['elemento_id'] ?? 0);
$seccion = trim($_POST['seccion'] ?? 'recursos');
$tipo = trim($_POST['tipo'] ?? '');

$tipos_permitidos = ['like', 'guardado'];

if ($elemento_id <= 0 || !in_array($tipo, $tipos_permitidos, true)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Reaccion invalida.'
    ]);
    exit;
}

$stmt = $conexion->prepare(
    "SELECT id, seccion
    FROM publicaciones
    WHERE id = ? AND status = 'publicado'
    LIMIT 1"
);
$stmt->bind_param('i', $elemento_id);
$stmt->execute();
$publicacion = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$publicacion) {
    http_response_code(404);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Publicacion no encontrada.'
    ]);
    exit;
}

if ($tipo === 'like' && ($publicacion['seccion'] ?? 'post') === 'aviso') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Los avisos no pueden recibir Me gusta.'
    ]);
    exit;
}

$stmt = $conexion->prepare(
    "SELECT id
    FROM reacciones
    WHERE usuario_id = ? AND elemento_id = ? AND seccion = ? AND tipo_reaccion = ?
    LIMIT 1"
);
$stmt->bind_param('iiss', $usuario_id, $elemento_id, $seccion, $tipo);
$stmt->execute();
$reaccion = $stmt->get_result()->fetch_assoc();
$stmt->close();

if ($reaccion) {
    $stmt = $conexion->prepare("DELETE FROM reacciones WHERE id = ?");
    $stmt->bind_param('i', $reaccion['id']);
    $stmt->execute();
    $stmt->close();
    $activo = false;
} else {
    $stmt = $conexion->prepare(
        "INSERT INTO reacciones (usuario_id, elemento_id, seccion, tipo_reaccion)
        VALUES (?, ?, ?, ?)"
    );
    $stmt->bind_param('iiss', $usuario_id, $elemento_id, $seccion, $tipo);
    $stmt->execute();
    $stmt->close();
    $activo = true;
}

$stmt = $conexion->prepare(
    "SELECT tipo_reaccion, COUNT(*) AS total
    FROM reacciones
    WHERE elemento_id = ? AND seccion = ?
    GROUP BY tipo_reaccion"
);
$stmt->bind_param('is', $elemento_id, $seccion);
$stmt->execute();
$resultado = $stmt->get_result();
$totales = [
    'like' => 0,
    'guardado' => 0
];

while ($fila = $resultado->fetch_assoc()) {
    if (isset($totales[$fila['tipo_reaccion']])) {
        $totales[$fila['tipo_reaccion']] = intval($fila['total']);
    }
}

$stmt->close();

echo json_encode([
    'ok' => true,
    'activo' => $activo,
    'tipo' => $tipo,
    'elemento_id' => $elemento_id,
    'seccion' => $seccion,
    'totales' => $totales
]);
