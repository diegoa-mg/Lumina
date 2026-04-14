<?php
session_start(); // Siempre primero
include 'conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    echo "Error: Sesión no encontrada. Por favor, vuelve a loguearte.";
    exit;
}

$user = $_SESSION['usuario_id'];
$elem_id = $_POST['elemento_id'];
$seccion = $_POST['seccion'];
$tipo = $_POST['tipo'];

$query = "INSERT INTO reacciones (usuario_id, elemento_id, seccion, tipo_reaccion) 
          VALUES ('$user', '$elem_id', '$seccion', '$tipo')";

if (mysqli_query($conexion, $query)) {
    echo ($tipo == 'guardado') ? "Publicación guardada correctamente" : "Te gusta esta publicación";
} else {
    // Esto te dirá exactamente qué falló en el SQL
    echo "Error en la base de datos: " . mysqli_error($conexion);
}
?>