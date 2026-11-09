<?php
header('Content-Type: application/json; charset=utf-8');

// EMAIL CONFIGURATION
// During testing, this goes to mckale.g.jonas@gmail.com.
// Change this email address to your station's DJ or production email for launch.
$TO_EMAIL = "casfinfo18@gmail.com";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
$artist = $body['artist'] ?? '';
$song = $body['song'] ?? $body['title'] ?? '';
$name = $body['name'] ?? $body['sender'] ?? '';
$email = $body['email'] ?? '';
$dedication = $body['dedication'] ?? '';

if (!$artist || !$song) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing artist or song']);
    exit;
}

$DATA_DIR = __DIR__ . '/../data/';
$filePath = $DATA_DIR . 'requests.json';

if (!file_exists($DATA_DIR)) {
    mkdir($DATA_DIR, 0755, true);
}

// Auto-protect data directory if not already protected
$htaccessFile = $DATA_DIR . '.htaccess';
file_put_contents($htaccessFile, '<FilesMatch "^(messages|requests|analytics)\.json$">\n    Require all denied\n    Deny from all\n</FilesMatch>');

$requests = [];
if (file_exists($filePath)) {
    $requests = json_decode(file_get_contents($filePath), true) ?: [];
}

$newRequest = [
    'id' => uniqid('req_', true),
    'artist' => htmlspecialchars($artist),
    'song' => htmlspecialchars($song),
    'name' => htmlspecialchars($name),
    'email' => htmlspecialchars($email),
    'dedication' => htmlspecialchars($dedication),
    'date' => date('c'),
];

array_unshift($requests, $newRequest);

// Secure file write
$fp = fopen($filePath, 'c');
$writeSuccess = false;
if ($fp) {
    if (flock($fp, LOCK_EX)) {
        ftruncate($fp, 0);
        fwrite($fp, json_encode($requests, JSON_PRETTY_PRINT));
        flock($fp, LOCK_UN);
        $writeSuccess = true;
    }
    fclose($fp);
}

if ($writeSuccess) {
    // Send email notification
    $subject = "[CASF Radio] New Song Request: " . $song . " by " . $artist;
    
    $message = "You have received a new song request on CASF Radio!\n\n";
    $message .= "Request Details:\n";
    $message .= "----------------------------------------\n";
    $message .= "Artist:       " . $artist . "\n";
    $message .= "Song Title:   " . $song . "\n";
    $message .= "Dedicated To: " . ($dedication ? $dedication : "None") . "\n\n";
    $message .= "Listener Details:\n";
    $message .= "----------------------------------------\n";
    $message .= "Name:         " . $name . "\n";
    $message .= "Email:        " . $email . "\n\n";
    $message .= "Date:         " . date('Y-m-d H:i:s') . "\n";
    
    // Set headers
    $headers = "From: noreply@casfradio.ca\r\n";
    if (!empty($email) && filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $headers .= "Reply-To: " . $email . "\r\n";
    }
    $headers .= "X-Mailer: PHP/" . phpversion();
    
    // Suppress warning if mail server is not configured in local environment
    @mail($TO_EMAIL, $subject, $message, $headers);

    echo json_encode([
        'success' => true,
        'message' => 'Your request has been submitted!'
    ]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save request.']);
}
