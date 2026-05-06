<?php
// backend/publicar_post.php
header('Content-Type: application/json');
include 'conexion.php'; // Asegúrate de que este archivo tenga tu $conexion a lumina_bd

// Recibimos el JSON del fetch
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if ($data) {
    // Escapamos los datos para evitar inyecciones SQL
    $titulo = mysqli_real_escape_string($conexion, $data['titulo']);
    $descripcion = mysqli_real_escape_string($conexion, $data['descripcion']);
    $imagen = $data['imagen']; // Al ser LONGTEXT para Base64, lo pasamos directo
    $status = mysqli_real_escape_string($conexion, $data['status']);
    
    // Aquí deberías usar el ID del usuario logueado desde la sesión[cite: 1]
    // Por ahora usaremos el 1 para pruebas
    $autor_id = 1; 

    $query = "INSERT INTO publicaciones (titulo, description, imagen, status, autor_id) 
              VALUES ('$titulo', '$descripcion', '$imagen', '$status', '$autor_id')";

    if (mysqli_query($conexion, $query)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => mysqli_error($conexion)]);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'No se recibieron datos']);
}
?>