<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexion_bd.php';

if (!isset($_SESSION['usuario_id'])) {
    http_response_code(401);
    echo json_encode([
        'ok' => false,
        'mensaje' => 'Debes iniciar sesion.'
    ]);
    exit;
}

$usuario_id = intval($_SESSION['usuario_id']);
$accion = $_GET['accion'] ?? 'resumen';

function formatear_fecha_reaccion($fecha) {
    if (!$fecha) {
        return '';
    }

    $timestamp = strtotime($fecha);
    return $timestamp ? date('d/m/Y', $timestamp) : $fecha;
}

if ($accion === 'estado') {
    $ids = array_values(array_filter(array_map('intval', explode(',', $_GET['ids'] ?? ''))));
    $seccion = trim($_GET['seccion'] ?? 'recursos');

    if (count($ids) === 0) {
        echo json_encode([
            'ok' => true,
            'reacciones' => []
        ]);
        exit;
    }

    $ids_sql = implode(',', $ids);

    $sql = "SELECT elemento_id, tipo_reaccion
        FROM reacciones
        WHERE elemento_id IN ($ids_sql)
        AND usuario_id = ?
        AND seccion = ?";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('is', $usuario_id, $seccion);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $reacciones = [];

    while ($fila = $resultado->fetch_assoc()) {
        $id = strval($fila['elemento_id']);

        if (!isset($reacciones[$id])) {
            $reacciones[$id] = [
                'like' => false,
                'guardado' => false
            ];
        }

        if (isset($reacciones[$id][$fila['tipo_reaccion']])) {
            $reacciones[$id][$fila['tipo_reaccion']] = true;
        }
    }

    $stmt->close();

    echo json_encode([
        'ok' => true,
        'reacciones' => $reacciones
    ]);
    exit;
}

if ($accion === 'resumen') {
    $stmt = $conexion->prepare(
        "SELECT r.tipo_reaccion, COUNT(*) AS total
        FROM reacciones r
        INNER JOIN publicaciones p ON p.id = r.elemento_id
        WHERE r.usuario_id = ?
        AND p.status = 'publicado'
        AND NOT (r.tipo_reaccion = 'like' AND p.seccion = 'aviso')
        GROUP BY r.tipo_reaccion"
    );
    $stmt->bind_param('i', $usuario_id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $resumen = [
        'like' => 0,
        'guardado' => 0
    ];

    while ($fila = $resultado->fetch_assoc()) {
        if (isset($resumen[$fila['tipo_reaccion']])) {
            $resumen[$fila['tipo_reaccion']] = intval($fila['total']);
        }
    }

    $stmt->close();

    echo json_encode([
        'ok' => true,
        'resumen' => $resumen
    ]);
    exit;
}

if ($accion === 'listado') {
    $tipo = trim($_GET['tipo'] ?? '');

    if (!in_array($tipo, ['like', 'guardado'], true)) {
        http_response_code(400);
        echo json_encode([
            'ok' => false,
            'mensaje' => 'Tipo de listado invalido.'
        ]);
        exit;
    }

    $stmt = $conexion->prepare(
        "SELECT
            p.id,
            p.titulo,
            p.descripcion,
            p.imagen_url,
            p.tipo,
            p.seccion,
            p.importante,
            p.fecha_creacion,
            c.nombre_categoria AS materia,
            u.nombre AS autor,
            u.foto_url AS autor_foto
        FROM reacciones r
        INNER JOIN publicaciones p ON p.id = r.elemento_id
        LEFT JOIN categorias c ON c.id = p.categoria_id
        LEFT JOIN usuarios u ON u.id = p.autor_id
        WHERE r.usuario_id = ?
        AND r.tipo_reaccion = ?
        AND p.status = 'publicado'
        AND NOT (r.tipo_reaccion = 'like' AND p.seccion = 'aviso')
        ORDER BY r.fecha DESC"
    );
    $stmt->bind_param('is', $usuario_id, $tipo);
    $stmt->execute();
    $resultado = $stmt->get_result();
    $publicaciones = [];

    while ($fila = $resultado->fetch_assoc()) {
        $fila['id'] = intval($fila['id']);
        $fila['importante'] = intval($fila['importante'] ?? 0);
        $fila['fecha_formateada'] = formatear_fecha_reaccion($fila['fecha_creacion'] ?? '');
        $publicaciones[] = $fila;
    }

    $stmt->close();

    echo json_encode([
        'ok' => true,
        'publicaciones' => $publicaciones
    ]);
    exit;
}

http_response_code(400);
echo json_encode([
    'ok' => false,
    'mensaje' => 'Accion invalida.'
]);
