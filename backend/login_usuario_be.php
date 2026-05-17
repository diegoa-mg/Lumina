<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$remember = isset($_POST['remember_me']) && $_POST['remember_me'] === 'on';

if ($remember) {
    session_set_cookie_params([
        'lifetime' => 60 * 60 * 24 * 30,
        'path' => '/',
        'secure' => isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on',
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

session_start();
include 'conexion_bd.php';

$correo = $_POST['email'];
$password = $_POST['pass'];

$validar_login = mysqli_query($conexion, "SELECT usuarios.id, usuarios.usuarios, usuarios.password, usuarios.rol_id, roles.nombre AS rol_nombre FROM usuarios JOIN roles ON usuarios.rol_id = roles.id WHERE usuarios.correo='$correo'");

if(mysqli_num_rows($validar_login) > 0){
    $usuario = mysqli_fetch_assoc($validar_login);
    
    if(password_verify($password, $usuario['password'])){
        $_SESSION['usuario_id'] = $usuario['id']; 
        $_SESSION['usuario'] = $usuario['usuarios'];
        $_SESSION['rol_id'] = $usuario['rol_id'];
        $_SESSION['rol'] = $usuario['rol_nombre'];
        
        echo '<script>
            localStorage.setItem("sesion_activa", "true");
            localStorage.setItem("user_role", "' . $usuario['rol_nombre'] . '");
            window.location.href = "../frontend/index.html";
        </script>';
        exit;
    }
}
echo '<script>alert("Correo o contraseña incorrectos"); window.location.href="../frontend/login.html";</script>';
?>