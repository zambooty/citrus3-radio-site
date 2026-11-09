<?php
header('Content-Type: application/json');

require_once __DIR__ . '/lib.php';

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = [];
}

$event = (string) ($body['event'] ?? '');
$sessionId = (string) ($body['sessionId'] ?? '');
$userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');

if (!citrus_track_listener($event, $sessionId, $userAgent, $ip)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing event or sessionId']);
    exit;
}

echo json_encode(['success' => true]);
