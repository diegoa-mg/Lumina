<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion_bd.php';
require_once __DIR__ . '/registro_verificacion_helpers.php';
require_once __DIR__ . '/mail_helper.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json_registro(['success' => false, 'error' => 'Metodo no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

asegurar_tabla_registro_verificaciones($conexion);
limpiar_verificaciones_expiradas($conexion);

[$datos, $error] = validar_datos_registro($input);
if ($error) {
    responder_json_registro(['success' => false, 'error' => $error], 400);
}

$errorExistente = usuario_o_correo_existe($conexion, $datos['usuario'], $datos['correo']);
if ($errorExistente) {
    responder_json_registro(['success' => false, 'error' => $errorExistente], 409);
}

$stmtPendiente = $conexion->prepare(
    'SELECT actualizado_en FROM registro_verificaciones WHERE correo = ? AND actualizado_en > DATE_SUB(NOW(), INTERVAL 45 SECOND) LIMIT 1'
);
if ($stmtPendiente) {
    $stmtPendiente->bind_param('s', $datos['correo']);
    $stmtPendiente->execute();
    $stmtPendiente->store_result();
    if ($stmtPendiente->num_rows > 0) {
        $stmtPendiente->close();
        responder_json_registro([
            'success' => false,
            'error' => 'Espera unos segundos antes de solicitar otro codigo.'
        ], 429);
    }
    $stmtPendiente->close();
}

$codigo = (string) random_int(100000, 999999);
$codigoHash = password_hash($codigo, PASSWORD_DEFAULT);
$passwordHash = password_hash($datos['password'], PASSWORD_DEFAULT);
$expiraEn = date('Y-m-d H:i:s', time() + 15 * 60);

$stmt = $conexion->prepare(
    "INSERT INTO registro_verificaciones
        (nombre, usuario, correo, password_hash, codigo_hash, expira_en, intentos)
    VALUES (?, ?, ?, ?, ?, ?, 0)
    ON DUPLICATE KEY UPDATE
        nombre = VALUES(nombre),
        usuario = VALUES(usuario),
        password_hash = VALUES(password_hash),
        codigo_hash = VALUES(codigo_hash),
        expira_en = VALUES(expira_en),
        intentos = 0"
);

if (!$stmt) {
    responder_json_registro(['success' => false, 'error' => 'Error interno al preparar la verificacion.'], 500);
}

$stmt->bind_param(
    'ssssss',
    $datos['nombre'],
    $datos['usuario'],
    $datos['correo'],
    $passwordHash,
    $codigoHash,
    $expiraEn
);

if (!$stmt->execute()) {
    $stmt->close();
    responder_json_registro(['success' => false, 'error' => 'No se pudo guardar la verificacion.'], 500);
}
$stmt->close();

$asunto = 'Codigo de verificacion de Lumina';
$html = '
    <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <h1 style="color: #001430;">Lumina</h1>
        <p>Usa este codigo para confirmar tu registro:</p>
        <p style="font-size: 28px; font-weight: 800; letter-spacing: 6px; color: #2643d4;">' . htmlspecialchars($codigo, ENT_QUOTES, 'UTF-8') . '</p>
        <p>Este codigo vence en 15 minutos.</p>
        <p>Si no solicitaste este registro, puedes ignorar este correo.</p>
    </div>
';
$texto = "Tu codigo de verificacion de Lumina es: {$codigo}\nVence en 15 minutos.";

$envio = enviar_correo_lumina($datos['correo'], $asunto, $html, $texto);
if (!$envio['success']) {
    responder_json_registro([
        'success' => false,
        'error' => 'No se pudo enviar el correo de verificacion.',
        'detalle' => $envio['message'] ?? ''
    ], 500);
}

responder_json_registro([
    'success' => true,
    'message' => 'Codigo enviado. Revisa tu correo.',
    'correo' => $datos['correo'],
    'debug' => !empty($envio['debug'])
]);
