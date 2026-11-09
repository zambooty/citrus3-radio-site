<?php
require_once __DIR__ . '/bootstrap.php';
citrus_start_session();
header('Content-Type: application/json');

function isAuthenticated() {
    return citrus_is_authenticated();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'No file uploaded or upload error occurred.']);
    exit;
}

$file = $_FILES['image'];
$allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Strict MIME type checking
$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mimeType, $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WEBP are allowed.']);
    exit;
}

// Ensure the uploads directory exists
$uploadDir = __DIR__ . '/../images/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// Generate a safe, unique filename
$ext = pathinfo($file['name'], PATHINFO_EXTENSION);
$filename = uniqid('upload_', true) . '_' . bin2hex(random_bytes(4)) . '.' . strtolower($ext);
$destination = $uploadDir . $filename;

if (move_uploaded_file($file['tmp_name'], $destination)) {
    // Return the absolute web path for Next.js to use
    echo json_encode(['success' => true, 'url' => '/images/uploads/' . $filename]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to move uploaded file. Check directory permissions.']);
}
