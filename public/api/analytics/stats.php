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

echo json_encode(citrus_listener_stats());
