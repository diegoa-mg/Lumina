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
    die("Error de conexion: " . $conexion->connect_error);
}
