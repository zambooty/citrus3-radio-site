<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$name = $body['name'] ?? '';
$email = $body['email'] ?? '';
$subject = $body['subject'] ?? '';
$message = $body['message'] ?? '';

if (!$name || !$email || !$subject || !$message) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$DATA_DIR = __DIR__ . '/../data/';
$filePath = $DATA_DIR . 'messages.json';

if (!file_exists($DATA_DIR)) {
    mkdir($DATA_DIR, 0755, true);
}

// Auto-protect data directory if not already protected
$htaccessFile = $DATA_DIR . '.htaccess';
file_put_contents($htaccessFile, '<FilesMatch "^(messages|requests|analytics)\.json$">\n    Require all denied\n    Deny from all\n</FilesMatch>');

$messages = [];
if (file_exists($filePath)) {
    $messages = json_decode(file_get_contents($filePath), true) ?: [];
}

$newMessage = [
    'id' => uniqid('msg_', true),
    'name' => htmlspecialchars($name),
    'email' => htmlspecialchars($email),
    'subject' => htmlspecialchars($subject),
    'message' => htmlspecialchars($message),
    'date' => date('c'),
    'read' => false
];

array_unshift($messages, $newMessage);

// Secure file write
$fp = fopen($filePath, 'c');
$writeSuccess = false;
if ($fp) {
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, json_encode($messages, JSON_PRETTY_PRINT));
        flock($fp, LOCK_UN);
        $writeSuccess = true;
    }
    fclose($fp);
}

if ($writeSuccess) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message. We will get back to you soon.'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message.']);
}
