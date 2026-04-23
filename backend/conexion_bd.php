<?php
require_once __DIR__ . '/config.php';
$conexion = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
// Solo la conexión, nada de $_POST aquí.
?>