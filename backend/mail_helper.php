<?php

require_once __DIR__ . '/config.php';

function enviar_correo_lumina(string $para, string $asunto, string $html, string $texto = ''): array
{
    $driver = defined('MAIL_DRIVER') ? MAIL_DRIVER : 'log';

    if ($driver === 'smtp') {
        return enviar_correo_smtp_lumina($para, $asunto, $html, $texto);
    }

    return registrar_correo_lumina($para, $asunto, $html, $texto);
}

function registrar_correo_lumina(string $para, string $asunto, string $html, string $texto): array
{
    $contenido = [
        'fecha' => date('c'),
        'para' => $para,
        'asunto' => $asunto,
        'texto' => $texto,
        'html' => $html
    ];

    $ok = file_put_contents(
        __DIR__ . '/mail_debug.log',
        json_encode($contenido, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) . PHP_EOL . PHP_EOL,
        FILE_APPEND
    );

    return [
        'success' => $ok !== false,
        'debug' => true,
        'message' => $ok !== false
            ? 'Correo registrado en backend/mail_debug.log'
            : 'No se pudo registrar el correo local.'
    ];
}

function smtp_leer_lumina($socket): string
{
    $respuesta = '';
    while (($linea = fgets($socket, 515)) !== false) {
        $respuesta .= $linea;
        if (isset($linea[3]) && $linea[3] === ' ') {
            break;
        }
    }
    return $respuesta;
}

function smtp_comando_lumina($socket, string $comando, array $codigosEsperados): string
{
    fwrite($socket, $comando . "\r\n");
    $respuesta = smtp_leer_lumina($socket);
    $codigo = intval(substr($respuesta, 0, 3));

    if (!in_array($codigo, $codigosEsperados, true)) {
        throw new RuntimeException('SMTP error: ' . trim($respuesta));
    }

    return $respuesta;
}

function mime_header_lumina(string $valor): string
{
    return '=?UTF-8?B?' . base64_encode($valor) . '?=';
}

function enviar_correo_smtp_lumina(string $para, string $asunto, string $html, string $texto): array
{
    if (!defined('SMTP_HOST') || SMTP_HOST === '' || !defined('SMTP_USER') || SMTP_USER === '') {
        return ['success' => false, 'message' => 'SMTP no configurado.'];
    }

    $host = SMTP_HOST;
    $port = defined('SMTP_PORT') ? intval(SMTP_PORT) : 587;
    $secure = defined('SMTP_SECURE') ? SMTP_SECURE : 'tls';
    $from = defined('MAIL_FROM_EMAIL') ? MAIL_FROM_EMAIL : SMTP_USER;
    $fromName = defined('MAIL_FROM_NAME') ? MAIL_FROM_NAME : 'Lumina';
    $remote = $secure === 'ssl' ? "ssl://{$host}:{$port}" : "{$host}:{$port}";

    $socket = @stream_socket_client($remote, $errno, $errstr, 20);
    if (!$socket) {
        return ['success' => false, 'message' => "No se pudo conectar a SMTP: {$errstr}"];
    }

    stream_set_timeout($socket, 20);

    try {
        $saludo = smtp_leer_lumina($socket);
        if (intval(substr($saludo, 0, 3)) !== 220) {
            throw new RuntimeException('SMTP error: ' . trim($saludo));
        }

        smtp_comando_lumina($socket, 'EHLO lumina.local', [250]);

        if ($secure === 'tls') {
            smtp_comando_lumina($socket, 'STARTTLS', [220]);
            if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                throw new RuntimeException('No se pudo iniciar TLS.');
            }
            smtp_comando_lumina($socket, 'EHLO lumina.local', [250]);
        }

        smtp_comando_lumina($socket, 'AUTH LOGIN', [334]);
        smtp_comando_lumina($socket, base64_encode(SMTP_USER), [334]);
        smtp_comando_lumina($socket, base64_encode(SMTP_PASSWORD), [235]);

        smtp_comando_lumina($socket, 'MAIL FROM:<' . $from . '>', [250]);
        smtp_comando_lumina($socket, 'RCPT TO:<' . $para . '>', [250, 251]);
        smtp_comando_lumina($socket, 'DATA', [354]);

        $boundary = 'lumina_' . bin2hex(random_bytes(12));
        $headers = [
            'From: ' . mime_header_lumina($fromName) . ' <' . $from . '>',
            'To: <' . $para . '>',
            'Subject: ' . mime_header_lumina($asunto),
            'MIME-Version: 1.0',
            'Content-Type: multipart/alternative; boundary="' . $boundary . '"'
        ];
        $textoFinal = $texto !== '' ? $texto : strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $html));

        $mensaje = implode("\r\n", $headers)
            . "\r\n\r\n--{$boundary}\r\n"
            . "Content-Type: text/plain; charset=UTF-8\r\n\r\n"
            . $textoFinal
            . "\r\n\r\n--{$boundary}\r\n"
            . "Content-Type: text/html; charset=UTF-8\r\n\r\n"
            . $html
            . "\r\n\r\n--{$boundary}--\r\n.";

        fwrite($socket, $mensaje . "\r\n");
        $respuesta = smtp_leer_lumina($socket);
        if (intval(substr($respuesta, 0, 3)) !== 250) {
            throw new RuntimeException('SMTP error: ' . trim($respuesta));
        }

        smtp_comando_lumina($socket, 'QUIT', [221]);
        fclose($socket);

        return ['success' => true, 'message' => 'Correo enviado.'];
    } catch (Throwable $error) {
        fclose($socket);
        return ['success' => false, 'message' => $error->getMessage()];
    }
}
