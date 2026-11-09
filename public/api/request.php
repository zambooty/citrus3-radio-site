<?php
require_once __DIR__ . '/bootstrap.php';
header('Content-Type: application/json; charset=utf-8');

$TO_EMAIL = 'casfinfo18@gmail.com';
$filePath = citrus_data_dir() . '/requests.json';
$REQUEST_LIMIT = 1000;

function citrus_request_slot(array $slots, int $minutes): ?array {
    $best = null;
    $bestMinutes = -1;
    foreach ($slots as $slot) {
        if (!is_array($slot) || !preg_match('/^(\d{1,2}):(\d{2})$/', (string) ($slot['time'] ?? ''), $match)) {
            continue;
        }
        $slotMinutes = ((int) $match[1]) * 60 + (int) $match[2];
        if ($slotMinutes > $minutes || $slotMinutes < $bestMinutes) {
            continue;
        }
        $bestMinutes = $slotMinutes;
        $best = $slot;
    }
    return $best;
}

function citrus_request_show(): array {
    $empty = ['show' => '', 'showId' => ''];
    $path = citrus_data_dir() . '/schedule.json';
    if (!is_file($path)) {
        return $empty;
    }
    $schedule = json_decode((string) file_get_contents($path), true);
    if (!is_array($schedule)) {
        return $empty;
    }

    $now = new DateTime('now', new DateTimeZone('America/Halifax'));
    $days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    $weekday = (int) $now->format('w');
    $minutes = ((int) $now->format('G')) * 60 + (int) $now->format('i');
    $slot = citrus_request_slot($schedule[$days[$weekday]] ?? [], $minutes);
    if ($slot === null) {
        $slot = citrus_request_slot($schedule[$days[($weekday + 6) % 7]] ?? [], 24 * 60);
    }
    if ($slot === null) {
        return $empty;
    }

    return [
        'show' => trim((string) ($slot['title'] ?? '')),
        'showId' => trim((string) ($slot['showId'] ?? '')),
    ];
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' || $_SERVER['REQUEST_METHOD'] === 'DELETE') {
    citrus_start_session();
    if (!citrus_is_authenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        echo json_encode(citrus_read_json_list($filePath));
        exit;
    }

    $id = (string) ($_GET['id'] ?? '');
    $requests = array_values(array_filter(
        citrus_read_json_list($filePath),
        function ($item) use ($id) {
            return is_array($item) && ($item['id'] ?? '') !== $id;
        }
    ));
    if (!citrus_write_json_list($filePath, $requests, $REQUEST_LIMIT)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete request.']);
        exit;
    }
    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    citrus_start_session();
    if (!citrus_is_authenticated()) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true);
    $id = is_array($body) ? (string) ($body['id'] ?? '') : '';
    if ($id === '' || ($body['action'] ?? '') !== 'done') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing request.']);
        exit;
    }

    $requests = citrus_read_json_list($filePath);
    $found = false;
    foreach ($requests as &$item) {
        if (is_array($item) && (string) ($item['id'] ?? '') === $id) {
            $item['status'] = 'done';
            $item['doneAt'] = date('c');
            $found = true;
            break;
        }
    }
    unset($item);

    if (!$found || !citrus_write_json_list($filePath, $requests, $REQUEST_LIMIT)) {
        http_response_code($found ? 500 : 404);
        echo json_encode(['error' => $found ? 'Failed to archive request.' : 'Request not found.']);
        exit;
    }

    echo json_encode(['success' => true]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

citrus_protect_private_data();
if (!citrus_rate_allow('request', 5, 600)) {
    http_response_code(429);
    echo json_encode(['error' => 'Too many requests. Please try again in a few minutes.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    $body = [];
}

$artist = citrus_clip((string) ($body['artist'] ?? ''), 120);
$song = citrus_clip((string) ($body['song'] ?? $body['title'] ?? ''), 160);
$name = citrus_clip((string) ($body['name'] ?? $body['sender'] ?? ''), 80);
$email = citrus_clip((string) ($body['email'] ?? ''), 120);
$dedication = citrus_clip((string) ($body['dedication'] ?? ''), 500);

if ($artist === '' || $song === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing artist or song']);
    exit;
}

$onAir = citrus_request_show();
$requests = citrus_read_json_list($filePath);
array_unshift($requests, [
    'id' => uniqid('req_', true),
    'artist' => $artist,
    'song' => $song,
    'name' => $name,
    'email' => $email,
    'dedication' => $dedication,
    'show' => $onAir['show'],
    'showId' => $onAir['showId'],
    'status' => 'open',
    'date' => date('c'),
]);

if (!citrus_write_json_list($filePath, $requests, $REQUEST_LIMIT)) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save request.']);
    exit;
}

$subject = '[CASF Radio] New Song Request: ' . $song . ' by ' . $artist;
$mail = "You have received a new song request on CASF Radio.\n\n";
$mail .= "Artist: " . $artist . "\n";
$mail .= "Song: " . $song . "\n";
$mail .= "Dedicated to: " . ($dedication !== '' ? $dedication : 'None') . "\n";
$mail .= "Show: " . ($onAir['show'] !== '' ? $onAir['show'] : 'Off the schedule') . "\n";
$mail .= "Name: " . $name . "\n";
$mail .= "Email: " . $email . "\n";
$mail .= "Date: " . date('Y-m-d H:i:s') . "\n";

$headers = "From: noreply@casfradio.ca\r\n";
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers .= 'Reply-To: ' . $email . "\r\n";
}
$headers .= 'X-Mailer: PHP/' . phpversion();
@mail($TO_EMAIL, $subject, $mail, $headers);

echo json_encode([
    'success' => true,
    'message' => 'Your request has been submitted!',
]);
