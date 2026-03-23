<?php
$conexion = new mysqli("localhost", "root", "", "login_bd");

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Recibimos los datos del formulario
$usuario = $_POST['usuario'];
$correo = $_POST['correo'];
$password = $_POST['password'];

// 🔐 Encriptar contraseña
$password_segura = password_hash($password, PASSWORD_DEFAULT);

// 👇 Rol por defecto (1 = usuario)
$rol_id = 1;

// 👇 Ahora insertamos también el rol
$sql = "INSERT INTO usuarios (usuarios, correo, password, rol_id) 
VALUES ('$usuario', '$correo', '$password_segura', '$rol_id')";

if ($conexion->query($sql) === TRUE) {
    echo "<h2>¡Registro exitoso!</h2>";
    echo "<a href='../frontend/login.html'>Volver al inicio</a>";
} else {
    echo "Error: " . $conexion->error;
}

$conexion->close();
?>