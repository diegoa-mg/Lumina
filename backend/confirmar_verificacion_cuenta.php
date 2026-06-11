<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');

require_once __DIR__ . '/conexion_bd.php';
require_once __DIR__ . '/correo_verificacion_helpers.php';

try {
if (!isset($_SESSION['usuario_id'])) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No hay una sesion activa.', 'error' => 'No hay una sesion activa.'], 401);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$codigo = trim($input['codigo'] ?? '');
if (!preg_match('/^\d{6}$/', $codigo)) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Codigo invalido.', 'error' => 'Codigo invalido.'], 400);
}

$usuarioId = intval($_SESSION['usuario_id']);

asegurar_columna_email_verificado($conexion);
asegurar_tabla_cuenta_verificaciones($conexion);

$stmt = $conexion->prepare(
    'SELECT cv.id, cv.correo, cv.codigo_hash, cv.expira_en, cv.intentos, u.correo AS correo_actual
     FROM cuenta_verificaciones cv
     INNER JOIN usuarios u ON u.id = cv.usuario_id
     WHERE cv.usuario_id = ?
     LIMIT 1'
);
if (!$stmt) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Error al validar el codigo.', 'error' => 'Error al validar el codigo.'], 500);
}

$stmt->bind_param('i', $usuarioId);
$stmt->execute();
$registro = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$registro) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No hay una verificacion pendiente.', 'error' => 'No hay una verificacion pendiente.'], 404);
}

if ($registro['correo'] !== $registro['correo_actual']) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'El correo cambio. Solicita un codigo nuevo.', 'error' => 'El correo cambio. Solicita un codigo nuevo.'], 409);
}

if (strtotime($registro['expira_en']) < time()) {
    $delete = $conexion->prepare('DELETE FROM cuenta_verificaciones WHERE id = ?');
    if ($delete) {
        $delete->bind_param('i', $registro['id']);
        $delete->execute();
        $delete->close();
    }
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'El codigo expiro. Solicita uno nuevo.', 'error' => 'El codigo expiro. Solicita uno nuevo.'], 410);
}

if (intval($registro['intentos']) >= 5) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Demasiados intentos. Solicita un codigo nuevo.', 'error' => 'Demasiados intentos. Solicita un codigo nuevo.'], 429);
}

if (!password_verify($codigo, $registro['codigo_hash'])) {
    $update = $conexion->prepare('UPDATE cuenta_verificaciones SET intentos = intentos + 1 WHERE id = ?');
    if ($update) {
        $update->bind_param('i', $registro['id']);
        $update->execute();
        $update->close();
    }
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Codigo incorrecto.', 'error' => 'Codigo incorrecto.'], 400);
}

$updateUsuario = $conexion->prepare('UPDATE usuarios SET email_verificado = 1 WHERE id = ?');
if (!$updateUsuario) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No se pudo verificar el correo.', 'error' => 'No se pudo verificar el correo.'], 500);
}
$updateUsuario->bind_param('i', $usuarioId);
$updateUsuario->execute();
$updateUsuario->close();

$delete = $conexion->prepare('DELETE FROM cuenta_verificaciones WHERE id = ?');
if ($delete) {
    $delete->bind_param('i', $registro['id']);
    $delete->execute();
    $delete->close();
}

responder_json_correo([
    'ok' => true,
    'success' => true,
    'mensaje' => 'Correo verificado correctamente.',
    'verificado' => true
]);
} catch (Throwable $error) {
    responder_json_correo([
        'ok' => false,
        'success' => false,
        'mensaje' => 'Error interno al confirmar la verificacion.',
        'error' => 'Error interno al confirmar la verificacion.',
        'detalle' => $error->getMessage()
    ], 500);
}
