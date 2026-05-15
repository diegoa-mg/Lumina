<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion_bd.php';

$metodo = $_SERVER['REQUEST_METHOD'];

function formatear_fecha_comentario($fecha) {
    if (!$fecha) {
        return '';
    }

    $timestamp = strtotime($fecha);
    return $timestamp ? date('d/m/Y H:i', $timestamp) : $fecha;
}

function responder_json_comentarios($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function normalizar_utf8_comentario($texto) {
    if (function_exists('mb_check_encoding') && mb_check_encoding($texto, 'UTF-8')) {
        return $texto;
    }

    if (function_exists('mb_convert_encoding')) {
        return mb_convert_encoding($texto, 'UTF-8', 'UTF-8, ISO-8859-1, Windows-1252');
    }

    return utf8_encode($texto);
}

if ($metodo === 'GET') {
    $categoria_id = intval($_GET['categoria_id'] ?? 0);

    if ($categoria_id <= 0) {
        responder_json_comentarios([
            'ok' => false,
            'mensaje' => 'Materia invalida.'
        ], 400);
    }

    $stmt = $conexion->prepare(
        "SELECT
            cm.id,
            cm.comentario,
            cm.fecha_creacion,
            u.nombre,
            u.foto_url
        FROM comentarios_materia cm
        INNER JOIN usuarios u ON u.id = cm.usuario_id
        WHERE cm.categoria_id = ?
        ORDER BY cm.fecha_creacion DESC"
    );
    $stmt->bind_param('i', $categoria_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $comentarios = [];

    while ($fila = $resultado->fetch_assoc()) {
        $comentarios[] = [
            'id' => intval($fila['id']),
            'comentario' => $fila['comentario'],
            'fecha' => formatear_fecha_comentario($fila['fecha_creacion']),
            'usuario' => $fila['nombre'] ?: 'Usuario',
            'foto_url' => $fila['foto_url'] ?: null
        ];
    }

    $stmt->close();

    responder_json_comentarios([
        'ok' => true,
        'comentarios' => $comentarios
    ]);
}

if ($metodo === 'POST') {
    if (!isset($_SESSION['usuario_id'])) {
        responder_json_comentarios([
            'ok' => false,
            'mensaje' => 'Debes iniciar sesion para comentar.'
        ], 401);
    }

    $data = json_decode(file_get_contents('php://input'), true);

    if (!is_array($data)) {
        $data = $_POST;
    }

    $usuario_id = intval($_SESSION['usuario_id']);
    $categoria_id = intval($data['categoria_id'] ?? 0);
    $comentario = trim(normalizar_utf8_comentario($data['comentario'] ?? ''));

    if ($categoria_id <= 0 || $comentario === '') {
        responder_json_comentarios([
            'ok' => false,
            'mensaje' => 'Escribe un comentario antes de publicarlo.'
        ], 400);
    }

    $longitud_comentario = function_exists('mb_strlen')
        ? mb_strlen($comentario, 'UTF-8')
        : strlen($comentario);

    if ($longitud_comentario > 500) {
        responder_json_comentarios([
            'ok' => false,
            'mensaje' => 'El comentario no puede superar 500 caracteres.'
        ], 400);
    }

    $stmt = $conexion->prepare(
        "INSERT INTO comentarios_materia (categoria_id, usuario_id, comentario)
        VALUES (?, ?, ?)"
    );
    $stmt->bind_param('iis', $categoria_id, $usuario_id, $comentario);

    if (!$stmt->execute()) {
        responder_json_comentarios([
            'ok' => false,
            'mensaje' => 'No se pudo guardar el comentario.'
        ], 500);
    }

    $comentario_id = $conexion->insert_id;
    $stmt->close();

    $stmt = $conexion->prepare(
        "SELECT
            cm.id,
            cm.comentario,
            cm.fecha_creacion,
            u.nombre,
            u.foto_url
        FROM comentarios_materia cm
        INNER JOIN usuarios u ON u.id = cm.usuario_id
        WHERE cm.id = ?
        LIMIT 1"
    );
    $stmt->bind_param('i', $comentario_id);
    $stmt->execute();
    $fila = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    responder_json_comentarios([
        'ok' => true,
        'comentario' => [
            'id' => intval($fila['id']),
            'comentario' => $fila['comentario'],
            'fecha' => formatear_fecha_comentario($fila['fecha_creacion']),
            'usuario' => $fila['nombre'] ?: 'Usuario',
            'foto_url' => $fila['foto_url'] ?: null
        ]
    ]);
}

responder_json_comentarios([
    'ok' => false,
    'mensaje' => 'Metodo no permitido.'
], 405);
