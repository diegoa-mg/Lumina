<?php
// Reporte de errores para desarrollo
ini_set('display_errors', 1);
error_reporting(E_ALL);

include 'conexion_bd.php';

function redirectWithError(string $message): void
{
    header('Location: ../frontend/registro.html?error=' . urlencode($message));
    exit;
}

if (!isset($_POST['nombre'], $_POST['usuario'], $_POST['correo'], $_POST['password'])) {
    redirectWithError('Faltan datos en el formulario.');
}

$nombre = trim($_POST['nombre']);
$usuario = trim($_POST['usuario']);
$correo = trim($_POST['correo']);
$password = $_POST['password'];

if ($nombre === '' || $usuario === '' || $correo === '' || $password === '') {
    redirectWithError('Completa todos los campos.');
}

$usuario = preg_replace('/[^a-zA-Z0-9\.\-_]/', '', $usuario);

if ($usuario === '') {
    redirectWithError('El nombre de usuario no es válido.');
}

if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    redirectWithError('Ingresa un correo válido.');
}

if (strlen($password) < 8
    || !preg_match('/[A-Z]/', $password)
    || !preg_match('/[a-z]/', $password)
    || !preg_match('/\d/', $password)
    || !preg_match('/[\W_]/', $password)
) {
    redirectWithError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.');
}

$stmtCorreo = $conexion->prepare('SELECT id FROM usuarios WHERE correo = ? LIMIT 1');
if (!$stmtCorreo) {
    redirectWithError('Error interno al validar el correo.');
}
$stmtCorreo->bind_param('s', $correo);
$stmtCorreo->execute();
$stmtCorreo->store_result();

if ($stmtCorreo->num_rows > 0) {
    $stmtCorreo->close();
    redirectWithError('Ese correo ya está en uso.');
}
$stmtCorreo->close();

$stmtUsuario = $conexion->prepare('SELECT id FROM usuarios WHERE LOWER(usuarios) = LOWER(?) LIMIT 1');
if (!$stmtUsuario) {
    redirectWithError('Error interno al validar el usuario.');
}
$stmtUsuario->bind_param('s', $usuario);
$stmtUsuario->execute();
$stmtUsuario->store_result();

if ($stmtUsuario->num_rows > 0) {
    $stmtUsuario->close();
    redirectWithError('Ese nombre de usuario ya está en uso.');
}
$stmtUsuario->close();

$password_segura = password_hash($password, PASSWORD_DEFAULT);
$rol_id = 1;

$stmt = $conexion->prepare('INSERT INTO usuarios (nombre, usuarios, correo, password, rol_id) VALUES (?, ?, ?, ?, ?)');
if (!$stmt) {
    redirectWithError('Error interno al crear el usuario.');
}
$stmt->bind_param('ssssi', $nombre, $usuario, $correo, $password_segura, $rol_id);

if ($stmt->execute()) {
    header('Location: ../frontend/login.html?registro=exitoso');
    exit();
}

redirectWithError('Error al registrar. Intenta de nuevo.');
?>
