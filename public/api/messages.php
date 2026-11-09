<?php
require_once __DIR__ . '/bootstrap.php';
citrus_start_session();
header('Content-Type: application/json; charset=utf-8');

function isAuthenticated() {
    return citrus_is_authenticated();
}

if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

citrus_protect_private_data();
$filePath = citrus_data_dir() . '/messages.json';

function saveMessagesSecurely($filePath, $messages) {
    $fp = fopen($filePath, 'c');
    if ($fp) {
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            fwrite($fp, json_encode($messages, JSON_PRETTY_PRINT));
            flock($fp, LOCK_UN);
            fclose($fp);
            return true;
        }
        fclose($fp);
    }
    return false;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($filePath)) {
        echo file_get_contents($filePath);
    } else {
        echo json_encode([]);
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    
    $messages = [];
    if (file_exists($filePath)) {
        $messages = json_decode(file_get_contents($filePath), true) ?: [];
    }
    
    // Mark as read
    if (isset($body['markRead']) && isset($body['id'])) {
        foreach ($messages as &$msg) {
            if ($msg['id'] === $body['id']) {
                $msg['read'] = true;
                break;
            }
        }
        saveMessagesSecurely($filePath, $messages);
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Mark all as read
    if (isset($body['markAllRead'])) {
        foreach ($messages as &$msg) {
            $msg['read'] = true;
        }
        saveMessagesSecurely($filePath, $messages);
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $body = json_decode(file_get_contents('php://input'), true);
    
    $messages = [];
    if (file_exists($filePath)) {
        $messages = json_decode(file_get_contents($filePath), true) ?: [];
    }
    
    if (isset($body['id'])) {
        foreach ($messages as &$msg) {
            if ($msg['id'] === $body['id']) {
                $msg['read'] = true;
                break;
            }
        }
        saveMessagesSecurely($filePath, $messages);
        echo json_encode(['success' => true]);
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? '';
    if ($id) {
        $messages = [];
        if (file_exists($filePath)) {
            $messages = json_decode(file_get_contents($filePath), true) ?: [];
        }
        $messages = array_filter($messages, function($msg) use ($id) {
            return $msg['id'] !== $id;
        });
        saveMessagesSecurely($filePath, array_values($messages));
        echo json_encode(['success' => true]);
        exit;
    }
}

http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
