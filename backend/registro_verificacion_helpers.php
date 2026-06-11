<?php

function responder_json_registro(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function asegurar_tabla_registro_verificaciones(mysqli $conexion): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS registro_verificaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            nombre VARCHAR(150) NOT NULL,
            usuario VARCHAR(100) NOT NULL,
            correo VARCHAR(150) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            codigo_hash VARCHAR(255) NOT NULL,
            expira_en DATETIME NOT NULL,
            intentos TINYINT UNSIGNED NOT NULL DEFAULT 0,
            creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_registro_correo (correo),
            KEY idx_registro_usuario (usuario),
            KEY idx_registro_expira (expira_en)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ";

    if (!$conexion->query($sql)) {
        responder_json_registro([
            'success' => false,
            'error' => 'No se pudo preparar la verificacion de correo.'
        ], 500);
    }
}

function limpiar_verificaciones_expiradas(mysqli $conexion): void
{
    $conexion->query("DELETE FROM registro_verificaciones WHERE expira_en < DATE_SUB(NOW(), INTERVAL 1 DAY)");
}

function normalizar_usuario_registro(string $usuario): string
{
    return preg_replace('/[^a-zA-Z0-9\.\-_]/', '', trim($usuario));
}

function validar_password_registro(string $password): bool
{
    return strlen($password) >= 8
        && preg_match('/[A-Z]/', $password)
        && preg_match('/[a-z]/', $password)
        && preg_match('/\d/', $password)
        && preg_match('/[\W_]/', $password);
}

function usuario_o_correo_existe(mysqli $conexion, string $usuario, string $correo): ?string
{
    $stmtCorreo = $conexion->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
    if (!$stmtCorreo) {
        return 'Error interno al validar el correo.';
    }
    $stmtCorreo->bind_param('s', $correo);
    $stmtCorreo->execute();
    $stmtCorreo->store_result();

    if ($stmtCorreo->num_rows > 0) {
        $stmtCorreo->close();
        return 'Ese correo ya esta en uso.';
    }
    $stmtCorreo->close();

    $stmtUsuario = $conexion->prepare('SELECT id FROM usuarios WHERE LOWER(usuarios) = LOWER(?) LIMIT 1');
    if (!$stmtUsuario) {
        return 'Error interno al validar el usuario.';
    }
    $stmtUsuario->bind_param('s', $usuario);
    $stmtUsuario->execute();
    $stmtUsuario->store_result();

    if ($stmtUsuario->num_rows > 0) {
        $stmtUsuario->close();
        return 'Ese nombre de usuario ya esta en uso.';
    }
    $stmtUsuario->close();

    return null;
}

function validar_datos_registro(array $data): array
{
    $nombre = trim($data['nombre'] ?? '');
    $usuario = normalizar_usuario_registro($data['usuario'] ?? '');
    $correo = trim($data['correo'] ?? '');
    $password = $data['password'] ?? '';

    if ($nombre === '' || $usuario === '' || $correo === '' || $password === '') {
        return [null, 'Completa todos los campos.'];
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        return [null, 'Ingresa un correo valido.'];
    }

    if (!validar_password_registro($password)) {
        return [null, 'La contrasena debe tener al menos 8 caracteres, una mayuscula, una minuscula, un numero y un simbolo.'];
    }

    return [[
        'nombre' => $nombre,
        'usuario' => $usuario,
        'correo' => $correo,
        'password' => $password
    ], null];
}
