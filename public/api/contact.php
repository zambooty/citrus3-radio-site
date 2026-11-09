<?php
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

citrus_protect_private_data();
if (!citrus_rate_allow('contact', 5, 600)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many messages. Please try again in a few minutes.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = [];
}

$name = citrus_clip((string) ($body['name'] ?? ''), 80);
$email = citrus_clip((string) ($body['email'] ?? ''), 120);
$subject = citrus_clip((string) ($body['subject'] ?? ''), 140);
$message = citrus_clip((string) ($body['message'] ?? ''), 4000);

if ($name === '' || $email === '' || $subject === '' || $message === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$filePath = citrus_data_dir() . '/messages.json';
$messages = citrus_read_json_list($filePath);
array_unshift($messages, [
    'id' => uniqid('msg_', true),
    'name' => $name,
    'email' => $email,
    'subject' => $subject,
    'message' => $message,
    'date' => date('c'),
    'read' => false,
]);

if (citrus_write_json_list($filePath, $messages, 300)) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you for your message. We will get back to you soon.',
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message.']);
}
