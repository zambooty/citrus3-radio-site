<?php
require dirname(__DIR__) . '/public/api/bootstrap.php';

$failed = false;
function fail(string $message): void {
    fwrite(STDERR, $message . PHP_EOL);
    $GLOBALS['failed'] = true;
}

if (citrus_admin_username() !== 'casfadmin') {
    fail('Admin username is not casfadmin');
}

$hash = citrus_admin_password_hash();
if (!str_starts_with($hash, '$2y$')) {
    fail('Admin password hash must use the $2y$ prefix');
}

$password = getenv('ADMIN_PASSWORD') ?: '';
if ($password === '') {
    $envPath = dirname(__DIR__) . '/.env';
    if (is_file($envPath)) {
        foreach (file($envPath, FILE_IGNORE_NEW_LINES) ?: [] as $line) {
            if (str_starts_with($line, 'ADMIN_PASSWORD=')) {
                $password = substr($line, strlen('ADMIN_PASSWORD='));
                break;
            }
        }
    }
}

if ($password !== '' && !password_verify($password, $hash)) {
    fail('ADMIN_PASSWORD does not match the hash in bootstrap.php');
}

$guard = file_get_contents(dirname(__DIR__) . '/public/data/.htaccess');
if (!is_string($guard) || !str_contains($guard, 'Require all denied') || str_contains($guard, '\\n')) {
    fail('data/.htaccess is missing a real newline after the deny rule');
}

if ($failed) {
    exit(1);
}

echo "admin ok\n";
