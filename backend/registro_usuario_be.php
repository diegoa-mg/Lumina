<?php
// Reporte de errores para que NO se quede en blanco si algo falla
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'conexion_bd.php';

// Verificamos que los datos realmente lleguen
if (!isset($_POST['nombre']) || !isset($_POST['usuario']) || !isset($_POST['correo']) || !isset($_POST['password'])) {
    die("Error: Faltan datos en el formulario.");
}

$nombre = $_POST['nombre'];
$usuario = $_POST['usuario'];
$correo = $_POST['correo'];
$password = $_POST['password'];
$password_segura = password_hash($password, PASSWORD_DEFAULT);
$rol_id = 1;

$sql = "INSERT INTO usuarios (nombre, usuarios, correo, password, rol_id) 
        VALUES ('$nombre', '$usuario', '$correo', '$password_segura', '$rol_id')";

if ($conexion->query($sql) === TRUE) {
    header("Location: ../frontend/login.html?registro=exitoso");
    exit();
} else {
    echo "Error al registrar: " . $conexion->error;
}
$conexion->close();
?>