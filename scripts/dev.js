/* Local dev server.
 * Next cannot execute the PHP admin API, and files in public/ are served as
 * static downloads. This starts a portable PHP server and sends /api/*.php
 * there, so login works the same way it will on the host before you upload.
 */
const { spawn } = require('child_process');
const { createServer } = require('http');
const { parse } = require('url');
const fs = require('fs');
const https = require('https');
const path = require('path');
const next = require('next');

const root = path.join(__dirname, '..');
const phpDir = path.join(root, 'tools', 'php');
const phpExe = path.join(phpDir, 'php.exe');
const publicDir = path.join(root, 'public');
const PHP_PORT = 9080;
const WEB_PORT = Number(process.env.PORT || 6767);
const PHP_ZIP_URLS = [
    'https://windows.php.net/downloads/releases/latest/php-8.3-nts-Win32-vs16-x64-latest.zip',
    'https://windows.php.net/downloads/releases/latest/php-8.4-nts-Win32-vs17-x64-latest.zip',
];

function download(url, dest) {
    return new Promise((resolve, reject) => {
        const request = https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                const nextUrl = new URL(response.headers.location, url).href;
                resolve(download(nextUrl, dest));
                return;
            }
            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`Download failed (${response.statusCode}) for ${url}`));
                return;
            }
            const file = fs.createWriteStream(dest);
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
            file.on('error', reject);
        });
        request.on('error', reject);
    });
}

function run(command, args) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', windowsHide: true });
        child.on('error', reject);
        child.on('exit', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${command} exited with ${code}`));
        });
    });
}

function writePhpIni() {
    const extensionDir = path.join(phpDir, 'ext').replace(/\\/g, '/');
    fs.writeFileSync(
        path.join(phpDir, 'php.ini'),
        [
            `extension_dir="${extensionDir}"`,
            'extension=curl',
            'extension=fileinfo',
            'extension=openssl',
            'expose_php=0',
            'date.timezone=America/Halifax',
            '',
        ].join('\n')
    );
}

async function ensurePhp() {
    if (fs.existsSync(phpExe)) {
        if (!fs.existsSync(path.join(phpDir, 'php.ini'))) writePhpIni();
        return;
    }

    fs.mkdirSync(path.join(root, 'tools'), { recursive: true });
    const zipPath = path.join(root, 'tools', 'php.zip');
    let downloaded = false;
    let lastError = null;
    for (const url of PHP_ZIP_URLS) {
        try {
            console.log(`Downloading PHP from ${url}`);
            await download(url, zipPath);
            downloaded = true;
            break;
        } catch (error) {
            lastError = error;
            console.warn(error.message);
        }
    }
    if (!downloaded) {
        throw lastError || new Error('Could not download PHP');
    }

    if (fs.existsSync(phpDir)) fs.rmSync(phpDir, { recursive: true, force: true });
    await run('powershell', [
        '-NoProfile',
        '-Command',
        `Expand-Archive -Force -Path '${zipPath}' -DestinationPath '${phpDir}'`,
    ]);
    fs.rmSync(zipPath, { force: true });

    if (!fs.existsSync(phpExe)) {
        const nested = fs.readdirSync(phpDir, { withFileTypes: true }).find((entry) => entry.isDirectory());
        if (nested && fs.existsSync(path.join(phpDir, nested.name, 'php.exe'))) {
            const nestedDir = path.join(phpDir, nested.name);
            for (const entry of fs.readdirSync(nestedDir)) {
                fs.renameSync(path.join(nestedDir, entry), path.join(phpDir, entry));
            }
            fs.rmdirSync(nestedDir);
        }
    }
    if (!fs.existsSync(phpExe)) {
        throw new Error('PHP downloaded, but php.exe was not found.');
    }
    writePhpIni();
}

function startPhp() {
    const php = spawn(phpExe, ['-S', `127.0.0.1:${PHP_PORT}`, '-t', publicDir], {
        cwd: phpDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });
    php.stdout.on('data', (chunk) => process.stdout.write(`[php] ${chunk}`));
    php.stderr.on('data', (chunk) => process.stderr.write(`[php] ${chunk}`));
    php.on('exit', (code) => {
        if (code && code !== 0) {
            console.error(`PHP exited with code ${code}`);
        }
    });
    return php;
}

function waitForPhp() {
    return new Promise((resolve, reject) => {
        const started = Date.now();
        const attempt = () => {
            const request = require('http').get(`http://127.0.0.1:${PHP_PORT}/api/auth.php?action=session`, (response) => {
                response.resume();
                if (response.statusCode === 200) resolve();
                else retry();
            });
            request.on('error', retry);
        };
        const retry = () => {
            if (Date.now() - started > 15000) {
                reject(new Error('PHP did not start. The Visual C++ runtime may be missing.'));
                return;
            }
            setTimeout(attempt, 250);
        };
        attempt();
    });
}

function proxyToPhp(req, res) {
    const proxy = require('http').request(
        {
            hostname: '127.0.0.1',
            port: PHP_PORT,
            path: req.url,
            method: req.method,
            headers: req.headers,
        },
        (upstream) => {
            res.writeHead(upstream.statusCode || 502, upstream.headers);
            upstream.pipe(res);
        }
    );
    proxy.on('error', (error) => {
        console.error('PHP proxy error:', error.message);
        if (!res.headersSent) {
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'PHP admin API is not running' }));
        }
    });
    req.pipe(proxy);
}

async function startWeb() {
    const dev = true;
    const hostname = 'localhost';
    const app = next({ dev, hostname, port: WEB_PORT, dir: root });
    await app.prepare();
    const handle = app.getRequestHandler();
    const upgrade = app.getUpgradeHandler();

    const server = createServer(async (req, res) => {
        try {
            const pathname = (req.url || '').split('?')[0];
            if (pathname.includes('/api/') && pathname.endsWith('.php')) {
                proxyToPhp(req, res);
                return;
            }
            await handle(req, res, parse(req.url, true));
        } catch (error) {
            console.error('Request failed:', req.url, error);
            if (!res.headersSent) {
                res.statusCode = 500;
                res.end('internal server error');
            }
        }
    });

    server.on('upgrade', (req, socket, head) => {
        upgrade(req, socket, head).catch((error) => {
            console.error('Upgrade failed:', error);
            socket.destroy();
        });
    });

    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(WEB_PORT, hostname, resolve);
    });
    console.log(`> Ready on http://${hostname}:${WEB_PORT}`);
    return server;
}

async function main() {
    await ensurePhp();
    const php = startPhp();
    const stop = () => {
        php.kill();
        process.exit(0);
    };
    process.on('SIGINT', stop);
    process.on('SIGTERM', stop);
    try {
        await waitForPhp();
        await startWeb();
    } catch (error) {
        php.kill();
        console.error(error.message || error);
        process.exit(1);
    }
}

main();
