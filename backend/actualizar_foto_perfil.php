<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No hay una sesion activa.'
    ]);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);
$imagen = $datos['imagen'] ?? '';

if (!$imagen || strpos($imagen, 'data:image') !== 0) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Selecciona una imagen valida.'
    ]);
    exit;
}

if (!preg_match('/^data:image\/(\w+);base64,(.*)$/', $imagen, $matches)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Formato de imagen invalido.'
    ]);
    exit;
}

$formato = strtolower($matches[1]);
$base64 = $matches[2];
$formatosPermitidos = ['jpg', 'jpeg', 'png', 'webp'];

if (!in_array($formato, $formatosPermitidos, true)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Formato de imagen no permitido.'
    ]);
    exit;
}

$tamanioKb = (strlen($base64) * 0.75) / 1024;

if ($tamanioKb > 5120) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'La imagen es demasiado pesada.'
    ]);
    exit;
}

$usuarioId = (int) $_SESSION['usuario_id'];
$directorio = __DIR__ . '/../frontend/uploads/perfiles/';

if (!is_dir($directorio) && !mkdir($directorio, 0777, true)) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo crear la carpeta de perfiles.'
    ]);
    exit;
}

$contenido = base64_decode($base64, true);

if ($contenido === false) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo procesar la imagen.'
    ]);
    exit;
}

$nombreArchivo = 'perfil_' . $usuarioId . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $formato;
$rutaArchivo = $directorio . $nombreArchivo;

if (file_put_contents($rutaArchivo, $contenido) === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo guardar la imagen.'
    ]);
    exit;
}

$fotoUrl = 'uploads/perfiles/' . $nombreArchivo;
$stmt = $conexion->prepare('UPDATE usuarios SET foto_url = ? WHERE id = ?');
$stmt->bind_param('si', $fotoUrl, $usuarioId);

if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'No se pudo actualizar la foto de perfil.'
    ]);
    exit;
}

echo json_encode([
    'ok' => true,
    'foto_url' => $fotoUrl,
    'mensaje' => 'Foto de perfil actualizada correctamente.'
]);

?>
