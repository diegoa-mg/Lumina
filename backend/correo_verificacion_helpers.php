<?php

function responder_json_correo(array $payload, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

function columna_existe_correo(mysqli $conexion, string $tabla, string $columna): bool
{
    $stmt = $conexion->prepare(
        'SELECT COUNT(*) AS total
         FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME = ?
         AND COLUMN_NAME = ?'
    );

    if (!$stmt) return false;

    $stmt->bind_param('ss', $tabla, $columna);
    $stmt->execute();
    $fila = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    return intval($fila['total'] ?? 0) > 0;
}

function asegurar_columna_email_verificado(mysqli $conexion): void
{
    if (columna_existe_correo($conexion, 'usuarios', 'email_verificado')) {
        return;
    }

    $sql = 'ALTER TABLE usuarios ADD COLUMN email_verificado TINYINT(1) NOT NULL DEFAULT 0 AFTER correo';

    if (!$conexion->query($sql)) {
        responder_json_correo([
            'ok' => false,
            'success' => false,
            'mensaje' => 'No se pudo preparar la verificacion de correo.',
            'error' => 'No se pudo preparar la verificacion de correo.'
        ], 500);
    }
}

function asegurar_tabla_cuenta_verificaciones(mysqli $conexion): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS cuenta_verificaciones (
            id INT AUTO_INCREMENT PRIMARY KEY,
            usuario_id INT NOT NULL,
            correo VARCHAR(150) NOT NULL,
            codigo_hash VARCHAR(255) NOT NULL,
            expira_en DATETIME NOT NULL,
            intentos TINYINT UNSIGNED NOT NULL DEFAULT 0,
            creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY uniq_cuenta_usuario (usuario_id),
            KEY idx_cuenta_correo (correo),
            KEY idx_cuenta_expira (expira_en)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    ";

    if (!$conexion->query($sql)) {
        responder_json_correo([
            'ok' => false,
            'success' => false,
            'mensaje' => 'No se pudo preparar la verificacion de correo.',
            'error' => 'No se pudo preparar la verificacion de correo.'
        ], 500);
    }
}

function limpiar_cuenta_verificaciones_expiradas(mysqli $conexion): void
{
    $conexion->query("DELETE FROM cuenta_verificaciones WHERE expira_en < DATE_SUB(NOW(), INTERVAL 1 DAY)");
}
