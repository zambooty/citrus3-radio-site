<?php
header('Content-Type: application/json');
header('Cache-Control: no-store');

require_once dirname(__DIR__) . '/bootstrap.php';
require_once __DIR__ . '/lib.php';

citrus_start_session();
if (!citrus_is_authenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $known = null;
    if (is_array($body) && isset($body['connections']) && is_numeric($body['connections'])) {
        $known = max(0, min(100000, (int) $body['connections']));
    }
    echo json_encode(citrus_listener_stats($known));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

echo json_encode(citrus_listener_stats());
