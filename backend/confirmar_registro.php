<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion_bd.php';
require_once __DIR__ . '/registro_verificacion_helpers.php';
require_once __DIR__ . '/correo_verificacion_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder_json_registro(['success' => false, 'error' => 'Metodo no permitido.'], 405);
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$correo = trim($input['correo'] ?? '');
$codigo = trim($input['codigo'] ?? '');

if (!filter_var($correo, FILTER_VALIDATE_EMAIL) || !preg_match('/^\d{6}$/', $codigo)) {
    responder_json_registro(['success' => false, 'error' => 'Codigo o correo invalido.'], 400);
}

asegurar_tabla_registro_verificaciones($conexion);
asegurar_columna_email_verificado($conexion);

$stmt = $conexion->prepare(
    'SELECT id, nombre, usuario, correo, password_hash, codigo_hash, expira_en, intentos
     FROM registro_verificaciones
     WHERE correo = ?
     LIMIT 1'
);

if (!$stmt) {
    responder_json_registro(['success' => false, 'error' => 'Error interno al validar el codigo.'], 500);
}

$stmt->bind_param('s', $correo);
$stmt->execute();
$registro = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$registro) {
    responder_json_registro(['success' => false, 'error' => 'No hay una verificacion pendiente para este correo.'], 404);
}

if (strtotime($registro['expira_en']) < time()) {
    $delete = $conexion->prepare('DELETE FROM registro_verificaciones WHERE id = ?');
    if ($delete) {
        $delete->bind_param('i', $registro['id']);
        $delete->execute();
        $delete->close();
    }
    responder_json_registro(['success' => false, 'error' => 'El codigo expiro. Solicita uno nuevo.'], 410);
}

if (intval($registro['intentos']) >= 5) {
    responder_json_registro(['success' => false, 'error' => 'Demasiados intentos. Solicita un codigo nuevo.'], 429);
}

if (!password_verify($codigo, $registro['codigo_hash'])) {
    $update = $conexion->prepare('UPDATE registro_verificaciones SET intentos = intentos + 1 WHERE id = ?');
    if ($update) {
        $update->bind_param('i', $registro['id']);
        $update->execute();
        $update->close();
    }
    responder_json_registro(['success' => false, 'error' => 'Codigo incorrecto.'], 400);
}

$errorExistente = usuario_o_correo_existe($conexion, $registro['usuario'], $registro['correo']);
if ($errorExistente) {
    responder_json_registro(['success' => false, 'error' => $errorExistente], 409);
}

$rolId = 1;
$insert = $conexion->prepare('INSERT INTO usuarios (nombre, usuarios, correo, email_verificado, password, rol_id) VALUES (?, ?, ?, 1, ?, ?)');
if (!$insert) {
    responder_json_registro(['success' => false, 'error' => 'Error interno al crear la cuenta.'], 500);
}

$insert->bind_param(
    'ssssi',
    $registro['nombre'],
    $registro['usuario'],
    $registro['correo'],
    $registro['password_hash'],
    $rolId
);

if (!$insert->execute()) {
    $insert->close();
    responder_json_registro(['success' => false, 'error' => 'No se pudo crear la cuenta.'], 500);
}
$insert->close();

$delete = $conexion->prepare('DELETE FROM registro_verificaciones WHERE id = ?');
if ($delete) {
    $delete->bind_param('i', $registro['id']);
    $delete->execute();
    $delete->close();
}

responder_json_registro([
    'success' => true,
    'message' => 'Cuenta verificada y creada correctamente.'
]);
