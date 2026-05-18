<?php
include 'conexion_bd.php'; // Usamos tu conexión de siempre

if (isset($_POST['nombre_categoria'])) {
    $nombre_categoria = $_POST['nombre_categoria'];

    // Insertamos la nueva categoría
    $sql = "INSERT INTO categorias (nombre_categoria) VALUES ('$nombre_categoria')";

    if ($conexion->query($sql) === TRUE) {
        echo '<script>
                alert("Categoría guardada con éxito");
                window.location.href = "../frontend/index.html"; 
              </script>';
    } else {
        echo "Error al guardar: " . $conexion->error;
    }
}
$conexion->close();
?>