<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include 'conexion_bd.php';

$correo = $_POST['email'];
$password = $_POST['pass'];

$validar_login = mysqli_query($conexion, "SELECT * FROM usuarios WHERE correo='$correo'");

if(mysqli_num_rows($validar_login) > 0){
    $usuario = mysqli_fetch_assoc($validar_login);
    
    if(password_verify($password, $usuario['password'])){
        // CLAVE: Guardamos el ID para las reacciones
        $_SESSION['usuario_id'] = $usuario['id']; 
        $_SESSION['usuario'] = $usuario['usuarios'];
        
        echo '<script>
            localStorage.setItem("sesion_activa", "true");
            window.location.href = "../frontend/index.html";
        </script>';
        exit;
    }
}
echo '<script>alert("Correo o contraseña incorrectos"); window.location.href="../frontend/login.html";</script>';
?>