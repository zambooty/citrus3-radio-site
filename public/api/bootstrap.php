<?php
/**
 * Shared admin session for the station control panel.
 * Credentials live here so every PHP endpoint uses the same login.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'bootstrap.php') {
    http_response_code(404);
    exit;
}

if (!function_exists('citrus_admin_username')) {
    function citrus_admin_username(): string {
        return 'casfadmin';
    }

    function citrus_admin_password_hash(): string {
        // password_verify() accepts this bcrypt hash. Generate a replacement with:
        // php -r "echo password_hash('your-new-password', PASSWORD_BCRYPT), PHP_EOL;"
        return '$2y$10$4eHiUgn6wFSWr90atf4xQe23ALWYvkQC55uETlAyxFSGrCCa0EurW';
    }

    function citrus_is_https(): bool {
        $https = strtolower((string) ($_SERVER['HTTPS'] ?? ''));
        if ($https !== '' && $https !== 'off') {
            return true;
        }
        if ((int) ($_SERVER['SERVER_PORT'] ?? 0) === 443) {
            return true;
        }
        $proto = strtolower((string) ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''));
        return $proto === 'https';
    }

    function citrus_start_session(): void {
        if (session_status() === PHP_SESSION_ACTIVE) {
            return;
        }

        $sessionDir = dirname(__DIR__) . '/data/sessions';
        if (!is_dir($sessionDir)) {
            mkdir($sessionDir, 0700, true);
        }
        $guard = $sessionDir . '/.htaccess';
        if (!is_file($guard)) {
            file_put_contents($guard, "Require all denied\nDeny from all\n");
        }

        // Host-only cookie. Setting domain to HTTP_HOST includes the port and
        // browsers drop the cookie, which made login bounce back every time.
        session_save_path($sessionDir);
        session_name('CASFADMIN');
        session_set_cookie_params([
            'lifetime' => 60 * 60 * 12,
            'path' => '/',
            'secure' => citrus_is_https(),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }

    function citrus_is_authenticated(): bool {
        return isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true;
    }
}
