<?php
$conexion = new mysqli("localhost", "root", "", "login_bd");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
// Solo la conexión, nada de $_POST aquí.
?>