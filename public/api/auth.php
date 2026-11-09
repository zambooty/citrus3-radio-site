<?php
require_once __DIR__ . '/bootstrap.php';
citrus_start_session();

header('Content-Type: application/json; charset=utf-8');

function citrus_session_payload(): array {
    return [
        'authenticated' => citrus_is_authenticated(),
        'username' => citrus_is_authenticated() ? ($_SESSION['username'] ?? citrus_admin_username()) : null,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    $action = $_GET['action'] ?? '';
    if ($action === 'session') {
        echo json_encode(citrus_session_payload());
        exit;
    }
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) {
        $data = [];
    }
    $action = $data['action'] ?? '';

    if ($action === 'session') {
        echo json_encode(citrus_session_payload());
        exit;
    }

    if ($action === 'login') {
        $username = (string) ($data['username'] ?? '');
        $password = (string) ($data['password'] ?? '');

        $attempts = (int) ($_SESSION['login_attempts'] ?? 0);
        $lockedUntil = (int) ($_SESSION['login_locked_until'] ?? 0);
        if ($lockedUntil > time()) {
            http_response_code(429);
            echo json_encode([
                'success' => false,
                'error' => 'Too many attempts. Wait a minute and try again.',
            ]);
            exit;
        }

        $userOk = hash_equals(citrus_admin_username(), $username);
        $passOk = password_verify($password, citrus_admin_password_hash());

        if ($userOk && $passOk) {
            session_regenerate_id(true);
            $_SESSION['authenticated'] = true;
            $_SESSION['username'] = citrus_admin_username();
            unset($_SESSION['login_attempts'], $_SESSION['login_locked_until']);
            echo json_encode(['success' => true, 'username' => citrus_admin_username()]);
            exit;
        }

        $attempts++;
        $_SESSION['login_attempts'] = $attempts;
        if ($attempts >= 5) {
            $_SESSION['login_locked_until'] = time() + 60;
            $_SESSION['login_attempts'] = 0;
        }

        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Invalid credentials']);
        exit;
    }

    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        echo json_encode(['success' => true]);
        exit;
    }
}

http_response_code(400);
echo json_encode(['error' => 'Invalid request']);
