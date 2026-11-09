const { spawnSync } = require('child_process');
const path = require('path');

const node = spawnSync(process.execPath, ['--experimental-strip-types', '--test', 'scripts/checks.test.ts'], {
    stdio: 'inherit',
});
if (node.status !== 0) {
    process.exit(node.status || 1);
}

const php = path.join('tools', 'php', 'php.exe');
const admin = spawnSync(php, ['scripts/check-admin.php'], { stdio: 'inherit' });
process.exit(admin.status === 0 ? 0 : 1);
