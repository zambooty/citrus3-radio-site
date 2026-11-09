<?php
require_once __DIR__ . '/bootstrap.php';
citrus_start_session();
header('Content-Type: application/json; charset=utf-8');

function isAuthenticated() {
    return citrus_is_authenticated();
}

$ALLOWED_FILES = ["news", "shows", "schedule"];
$DATA_DIR = citrus_data_dir() . '/';
citrus_protect_private_data();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Both public and admin can read data from JSON files, but typically the frontend fetches JSON directly.
    // This endpoint can be used if needed.
    $file = $_GET['file'] ?? '';
    if (!in_array($file, $ALLOWED_FILES)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file']);
        exit;
    }
    
    $filePath = $DATA_DIR . $file . '.json';
    if (file_exists($filePath)) {
        echo file_get_contents($filePath);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!isAuthenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true);
    $file = $body['file'] ?? '';
    $content = $body['content'] ?? null;

    if (!$file || !in_array($file, $ALLOWED_FILES)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file']);
        exit;
    }

    if ($content === null) {
        http_response_code(400);
        echo json_encode(['error' => 'No content provided']);
        exit;
    }

    $filePath = $DATA_DIR . $file . '.json';
    citrus_backup_json($filePath);
    $jsonString = json_encode($content, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    if ($jsonString === false || strlen($jsonString) > 2000000) {
        http_response_code(400);
        echo json_encode(['error' => 'Content is too large']);
        exit;
    }
    
    // Secure file write
    $fp = fopen($filePath, 'c');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            fwrite($fp, $jsonString);
            flock($fp, LOCK_UN);
            echo json_encode(['success' => true]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to lock file for writing.']);
        }
        fclose($fp);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to write file. Check directory permissions.']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
