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

    function citrus_data_dir(): string {
        return dirname(__DIR__) . '/data';
    }

    function citrus_write_deny_file(string $path, string $rules): void {
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $current = is_file($path) ? (string) file_get_contents($path) : '';
        if ($current !== $rules) {
            file_put_contents($path, $rules);
        }
    }

    function citrus_protect_private_data(): void {
        $dir = citrus_data_dir();
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $private = "<FilesMatch \"^(messages|requests|analytics)\\.json$\">\n    Require all denied\n    Deny from all\n</FilesMatch>\n";
        citrus_write_deny_file($dir . '/.htaccess', $private);
        $denyAll = "Require all denied\nDeny from all\n";
        citrus_write_deny_file($dir . '/backups/.htaccess', $denyAll);
        citrus_write_deny_file($dir . '/ratelimit/.htaccess', $denyAll);
        citrus_write_deny_file($dir . '/sessions/.htaccess', $denyAll);
    }

    function citrus_clip(string $value, int $max): string {
        $value = str_replace(["\r", "\n", "\0"], ' ', $value);
        $value = trim(strip_tags($value));
        if (function_exists('mb_substr')) {
            return mb_substr($value, 0, $max);
        }
        return substr($value, 0, $max);
    }

    function citrus_client_ip(): string {
        $ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
        return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : '0.0.0.0';
    }

    function citrus_rate_allow(string $bucket, int $limit, int $windowSeconds): bool {
        citrus_protect_private_data();
        $dir = citrus_data_dir() . '/ratelimit';
        $path = $dir . '/' . hash('sha256', $bucket . '|' . citrus_client_ip()) . '.json';
        $now = time();
        $hits = [];
        if (is_file($path)) {
            $decoded = json_decode((string) file_get_contents($path), true);
            if (is_array($decoded)) {
                foreach ($decoded as $stamp) {
                    if (is_numeric($stamp) && ($now - (int) $stamp) < $windowSeconds) {
                        $hits[] = (int) $stamp;
                    }
                }
            }
        }
        if (count($hits) >= $limit) {
            file_put_contents($path, json_encode($hits));
            return false;
        }
        $hits[] = $now;
        file_put_contents($path, json_encode($hits));
        return true;
    }

    function citrus_backup_json(string $filePath): void {
        if (!is_file($filePath)) {
            return;
        }
        citrus_protect_private_data();
        $name = pathinfo($filePath, PATHINFO_FILENAME);
        $destDir = citrus_data_dir() . '/backups';
        $dest = $destDir . '/' . $name . '-' . date('Ymd-His') . '.json';
        if (!@copy($filePath, $dest)) {
            return;
        }
        $existing = glob($destDir . '/' . $name . '-*.json');
        if (!is_array($existing)) {
            return;
        }
        rsort($existing);
        foreach (array_slice($existing, 20) as $old) {
            if (is_string($old)) {
                @unlink($old);
            }
        }
    }

    function citrus_read_json_list(string $filePath): array {
        if (!is_file($filePath)) {
            return [];
        }
        $decoded = json_decode((string) file_get_contents($filePath), true);
        return is_array($decoded) ? array_values($decoded) : [];
    }

    function citrus_write_json_list(string $filePath, array $items, int $max): bool {
        if (count($items) > $max) {
            $items = array_slice($items, 0, $max);
        }
        $fp = fopen($filePath, 'c');
        if (!$fp) {
            return false;
        }
        $ok = false;
        if (flock($fp, LOCK_EX)) {
            ftruncate($fp, 0);
            fwrite($fp, json_encode(array_values($items), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
            fflush($fp);
            flock($fp, LOCK_UN);
            $ok = true;
        }
        fclose($fp);
        return $ok;
    }
}
