<?php

session_start();
header('Content-Type: application/json; charset=utf-8');
ini_set('display_errors', '0');

require_once __DIR__ . '/conexion_bd.php';
require_once __DIR__ . '/correo_verificacion_helpers.php';
require_once __DIR__ . '/mail_helper.php';

try {
if (!isset($_SESSION['usuario_id'])) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No hay una sesion activa.', 'error' => 'No hay una sesion activa.'], 401);
}

$usuarioId = intval($_SESSION['usuario_id']);

asegurar_columna_email_verificado($conexion);
asegurar_tabla_cuenta_verificaciones($conexion);
limpiar_cuenta_verificaciones_expiradas($conexion);

$stmtUsuario = $conexion->prepare('SELECT correo, email_verificado FROM usuarios WHERE id = ? LIMIT 1');
if (!$stmtUsuario) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Error al consultar la cuenta.', 'error' => 'Error al consultar la cuenta.'], 500);
}

$stmtUsuario->bind_param('i', $usuarioId);
$stmtUsuario->execute();
$usuario = $stmtUsuario->get_result()->fetch_assoc();
$stmtUsuario->close();

if (!$usuario) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Usuario no encontrado.', 'error' => 'Usuario no encontrado.'], 404);
}

if (intval($usuario['email_verificado']) === 1) {
    responder_json_correo(['ok' => true, 'success' => true, 'mensaje' => 'Tu correo ya esta verificado.', 'verificado' => true]);
}

$correo = trim($usuario['correo'] ?? '');
if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'Tu correo actual no es valido.', 'error' => 'Tu correo actual no es valido.'], 400);
}

$stmtPendiente = $conexion->prepare(
    'SELECT actualizado_en FROM cuenta_verificaciones WHERE usuario_id = ? AND actualizado_en > DATE_SUB(NOW(), INTERVAL 45 SECOND) LIMIT 1'
);
if ($stmtPendiente) {
    $stmtPendiente->bind_param('i', $usuarioId);
    $stmtPendiente->execute();
    $stmtPendiente->store_result();
    if ($stmtPendiente->num_rows > 0) {
        $stmtPendiente->close();
        responder_json_correo([
            'ok' => false,
            'success' => false,
            'mensaje' => 'Espera unos segundos antes de solicitar otro codigo.',
            'error' => 'Espera unos segundos antes de solicitar otro codigo.'
        ], 429);
    }
    $stmtPendiente->close();
}

$codigo = (string) random_int(100000, 999999);
$codigoHash = password_hash($codigo, PASSWORD_DEFAULT);
$expiraEn = date('Y-m-d H:i:s', time() + 15 * 60);

$stmt = $conexion->prepare(
    "INSERT INTO cuenta_verificaciones (usuario_id, correo, codigo_hash, expira_en, intentos)
     VALUES (?, ?, ?, ?, 0)
     ON DUPLICATE KEY UPDATE
        correo = VALUES(correo),
        codigo_hash = VALUES(codigo_hash),
        expira_en = VALUES(expira_en),
        intentos = 0"
);
if (!$stmt) {
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No se pudo preparar el codigo.', 'error' => 'No se pudo preparar el codigo.'], 500);
}

$stmt->bind_param('isss', $usuarioId, $correo, $codigoHash, $expiraEn);
if (!$stmt->execute()) {
    $stmt->close();
    responder_json_correo(['ok' => false, 'success' => false, 'mensaje' => 'No se pudo guardar el codigo.', 'error' => 'No se pudo guardar el codigo.'], 500);
}
$stmt->close();

$asunto = 'Verifica tu correo en Lumina';
$html = '
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h1 style="color: #001430;">Lumina</h1>
        <p>Usa este codigo para verificar tu correo:</p>
        <p style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #2643d4;">' . htmlspecialchars($codigo, ENT_QUOTES, 'UTF-8') . '</p>
        <p>Este codigo vence en 15 minutos.</p>
        <p>Si no solicitaste esta verificacion, puedes ignorar este correo.</p>
    </div>
';
$texto = "Tu codigo de verificacion de Lumina es: {$codigo}\nVence en 15 minutos.";

$envio = enviar_correo_lumina($correo, $asunto, $html, $texto);
if (!$envio['success']) {
    responder_json_correo([
        'ok' => false,
        'success' => false,
        'mensaje' => 'No se pudo enviar el correo de verificacion.',
        'error' => 'No se pudo enviar el correo de verificacion.',
        'detalle' => $envio['message'] ?? ''
    ], 500);
}

responder_json_correo([
    'ok' => true,
    'success' => true,
    'mensaje' => 'Codigo enviado. Revisa tu correo.',
    'correo' => $correo,
    'debug' => !empty($envio['debug'])
]);
} catch (Throwable $error) {
    responder_json_correo([
        'ok' => false,
        'success' => false,
        'mensaje' => 'Error interno al solicitar la verificacion.',
        'error' => 'Error interno al solicitar la verificacion.',
        'detalle' => $error->getMessage()
    ], 500);
}
