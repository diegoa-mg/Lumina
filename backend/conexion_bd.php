<?php
$conexion = new mysqli("localhost", "root", "", "login_bd");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Recibimos los datos del formulario
$usuario = $_POST['usuario'];
$correo = $_POST['correo'];
$password = $_POST['password'];

// IMPORTANTE: He ajustado los nombres de las columnas para que coincidan con tu tabla
// 'usuarios' (plural) y 'correo' (como aparece en tu phpMyAdmin)
$sql = "INSERT INTO usuarios (usuarios, correo, password) VALUES ('$usuario', '$correo', '$password')";

if ($conexion->query($sql) === TRUE) {
    echo "<h2>¡Registro exitoso!</h2>";
    echo "<a href='index.html'>Volver al inicio</a>";
} else {
    echo "Error: " . $conexion->error;
}

$conexion->close();
?>
