<?php
require_once __DIR__ . '/config.php';

$conexion = new mysqli(
    DB_HOST,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
    defined('DB_PORT') ? DB_PORT : 3306
);

if ($conexion->connect_error) {
    error_log('Lumina DB error: ' . $conexion->connect_error);
    http_response_code(500);
    die('No se pudo conectar con la base de datos.');
}

$conexion->set_charset('utf8mb4');
