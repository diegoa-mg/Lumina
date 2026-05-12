<?php
// backend/obtener_posts.php
header('Content-Type: application/json');
session_start();
include 'conexion_bd.php';

// Validar sesión (Diego, asegúrate de haber iniciado sesión antes)
if (!isset($_SESSION['usuario_id'])) {
    echo json_encode([]); // Devolvemos lista vacía si no hay sesión
    exit;
}

$autor_id = $_SESSION['usuario_id'];

// Consulta para traer los posts del autor logueado
$query = "SELECT id, titulo, descripcion, imagen_url, tipo, status FROM publicaciones WHERE autor_id = ? ORDER BY id DESC";
$stmt = $conexion->prepare($query);
$stmt->bind_param("i", $autor_id);
$stmt->execute();
$resultado = $stmt->get_result();

$posts = [];
while ($fila = $resultado->fetch_assoc()) {
    $posts[] = $fila;
}

echo json_encode($posts);

$stmt->close();
$conexion->close();
?>