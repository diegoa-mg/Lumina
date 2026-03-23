<?php
session_start();
include 'conexion_bd.php';

$correo = $_POST['email'];
$password = $_POST['pass'];

$validar_login = mysqli_query($conexion, "SELECT * FROM usuarios WHERE correo='$correo'");

if(mysqli_num_rows($validar_login) > 0){
    $usuario = mysqli_fetch_assoc($validar_login);
    
    if(password_verify($password, $usuario['password'])){
        $_SESSION['usuario'] = $usuario['usuarios'];
        // Usamos JS para asegurar que el navegador guarde la sesión
        echo '<script>
            localStorage.setItem("sesion_activa", "true");
            window.location.href = "../frontend/index.html";
        </script>';
        exit;
    }
}
echo '<script>alert("Correo o contraseña incorrectos"); window.location.href="../frontend/login.html";</script>';
?>