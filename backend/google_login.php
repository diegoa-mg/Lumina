<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include 'conexion_bd.php';

if (!isset($_POST['credential']) || empty($_POST['credential'])) {
    echo '<script>alert("No se recibió la credencial de Google."); window.location.href = "../frontend/login.html";</script>';
    exit;
}

$id_token = $_POST['credential'];
$google_client_id = defined('GOOGLE_CLIENT_ID') ? GOOGLE_CLIENT_ID : '';

if (empty($google_client_id) || $google_client_id === 'TU_CLIENT_ID_DE_GOOGLE_AQUI') {
    echo '<script>alert("El ID de cliente de Google no está configurado. Por favor actualiza backend/config.php."); window.location.href = "../frontend/login.html";</script>';
    exit;
}

$tokeninfo_url = 'https://oauth2.googleapis.com/tokeninfo?id_token=' . urlencode($id_token);
$response = false;

if (function_exists('curl_version')) {
    $ch = curl_init($tokeninfo_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    $response = curl_exec($ch);
    curl_close($ch);
} else {
    $response = @file_get_contents($tokeninfo_url);
}

if ($response === false) {
    echo '<script>alert("Error al validar el token de Google."); window.location.href = "../frontend/login.html";</script>';
    exit;
}

$data = json_decode($response, true);
if (!is_array($data) || empty($data['aud']) || $data['aud'] !== $google_client_id) {
    echo '<script>alert("Token de Google inválido o no autorizado."); window.location.href = "../frontend/login.html";</script>';
    exit;
}

$email = $conexion->real_escape_string($data['email'] ?? '');
$nombre = $conexion->real_escape_string($data['name'] ?? 'Usuario Google');
$picture = $conexion->real_escape_string($data['picture'] ?? '');
$username = preg_replace('/[^a-z0-9\.\-_]/', '', strtolower(strtok($email, '@')));
if (empty($username)) {
    $username = 'usuario' . rand(10000, 99999);
}

$stmt = $conexion->prepare('SELECT usuarios.id, usuarios.usuarios, usuarios.rol_id, roles.nombre AS rol_nombre FROM usuarios JOIN roles ON usuarios.rol_id = roles.id WHERE usuarios.correo = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $usuario = $result->fetch_assoc();
    $_SESSION['usuario_id'] = $usuario['id'];
    $_SESSION['usuario'] = $usuario['usuarios'];
    $_SESSION['rol_id'] = $usuario['rol_id'];
    $_SESSION['rol'] = $usuario['rol_nombre'];
    echo '<script>localStorage.setItem("sesion_activa", "true"); localStorage.setItem("user_role", "' . $usuario['rol_nombre'] . '"); window.location.href = "../frontend/index.html";</script>';
    exit;
}

$base_username = $username;
$counter = 1;
while (true) {
    $check = $conexion->prepare('SELECT id FROM usuarios WHERE usuarios = ? LIMIT 1');
    $check->bind_param('s', $username);
    $check->execute();
    $existing = $check->get_result();
    $check->close();

    if ($existing && $existing->num_rows === 0) {
        break;
    }

    $username = $base_username . $counter;
    $counter++;
}

$password_random = bin2hex(random_bytes(16));
$password_hash = password_hash($password_random, PASSWORD_DEFAULT);

$insert = $conexion->prepare('INSERT INTO usuarios (nombre, usuarios, correo, password, foto_url, rol_id) VALUES (?, ?, ?, ?, ?, 1)');
$insert->bind_param('sssss', $nombre, $username, $email, $password_hash, $picture);

if ($insert->execute()) {
    $new_user_id = $conexion->insert_id;
    $_SESSION['usuario_id'] = $new_user_id;
    $_SESSION['usuario'] = $username;
    $_SESSION['rol_id'] = 1;
    $_SESSION['rol'] = 'Usuario';
    echo '<script>localStorage.setItem("sesion_activa", "true"); localStorage.setItem("user_role", "Usuario"); window.location.href = "../frontend/index.html";</script>';
    exit;
}

echo '<script>alert("No se pudo crear el usuario de Google. Intenta nuevamente."); window.location.href = "../frontend/login.html";</script>';
exit;
?>