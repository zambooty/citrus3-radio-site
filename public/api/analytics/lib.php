<?php
/**
 * Listener stats for the admin dashboard.
 * Live listener count comes from the Citrus3 stream. Device, country, and
 * listen length come from people using the website player.
 */

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === 'lib.php') {
    http_response_code(404);
    exit;
}

if (!function_exists('citrus_analytics_file')) {
    function citrus_analytics_file(): string {
        return dirname(__DIR__, 2) . '/data/analytics.json';
    }

    function citrus_analytics_today(): string {
        $now = new DateTime('now', new DateTimeZone('America/Halifax'));
        return $now->format('Y-m-d');
    }

    function citrus_analytics_default_state(): array {
        return [
            'version' => 2,
            'sessions' => [],
            'day' => citrus_analytics_today(),
            'peak' => 0,
            'peakTime' => null,
            'completedDurations' => [],
            'countryCache' => [],
        ];
    }

    function citrus_analytics_device(string $userAgent): string {
        $ua = strtolower($userAgent);
        if (preg_match('/ipad|tablet|playbook|silk/', $ua)) {
            return 'tablet';
        }
        if (preg_match('/mobile|iphone|ipod|android/', $ua)) {
            return 'mobile';
        }
        if (preg_match('/windows|macintosh|linux|cros/', $ua)) {
            return 'desktop';
        }
        return 'unknown';
    }

    function citrus_http_get(string $url, int $timeout = 4): ?string {
        if (function_exists('curl_init')) {
            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_CONNECTTIMEOUT => min(2, $timeout),
                CURLOPT_TIMEOUT => $timeout,
                CURLOPT_USERAGENT => 'CASFRadio/1.0',
            ]);
            $raw = curl_exec($ch);
            $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            if ($raw === false || $code >= 400) {
                return null;
            }
            return $raw;
        }

        $context = stream_context_create([
            'http' => [
                'timeout' => $timeout,
                'header' => "User-Agent: CASFRadio/1.0\r\n",
            ],
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
            ],
        ]);
        $raw = @file_get_contents($url, false, $context);
        return $raw === false ? null : $raw;
    }

    function citrus_analytics_lookup_country(string $ip): string {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return '';
        }

        $raw = citrus_http_get('http://ip-api.com/json/' . rawurlencode($ip) . '?fields=status,country', 2);
        $data = json_decode((string) $raw, true);
        if (!is_array($data) || ($data['status'] ?? '') !== 'success') {
            return '';
        }
        return trim((string) ($data['country'] ?? ''));
    }

    function citrus_analytics_finish_session(array &$state, array $session): void {
        $duration = (int) ($session['lastPing'] ?? 0) - (int) ($session['connectedAt'] ?? 0);
        if ($duration <= 0 || $duration > 12 * 60 * 60) {
            return;
        }
        $state['completedDurations'][] = $duration;
        if (count($state['completedDurations']) > 200) {
            $state['completedDurations'] = array_slice($state['completedDurations'], -200);
        }
    }

    function citrus_analytics_prune(array &$state): void {
        $now = time();
        foreach ($state['sessions'] as $id => $session) {
            if ($now - (int) ($session['lastPing'] ?? 0) > 75) {
                citrus_analytics_finish_session($state, $session);
                unset($state['sessions'][$id]);
            }
        }
    }

    function citrus_analytics_roll_day(array &$state): void {
        $today = citrus_analytics_today();
        if (($state['day'] ?? '') === $today) {
            return;
        }
        $state['day'] = $today;
        $state['peak'] = 0;
        $state['peakTime'] = null;
        $state['completedDurations'] = [];
    }

    function citrus_analytics_update(callable $mutator) {
        $path = citrus_analytics_file();
        $dir = dirname($path);
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }

        $fp = fopen($path, 'c+');
        if (!$fp) {
            return null;
        }

        try {
            if (!flock($fp, LOCK_EX)) {
                return null;
            }

            $state = json_decode((string) stream_get_contents($fp), true);
            if (!is_array($state) || ($state['version'] ?? null) !== 2) {
                $state = citrus_analytics_default_state();
            }

            citrus_analytics_roll_day($state);
            $result = $mutator($state);

            rewind($fp);
            ftruncate($fp, 0);
            fwrite($fp, json_encode($state, JSON_PRETTY_PRINT));
            fflush($fp);
            flock($fp, LOCK_UN);
            return $result;
        } finally {
            fclose($fp);
        }
    }

    function citrus_note_stream_listeners(int $connections): void {
        if ($connections < 0) {
            return;
        }
        try {
            citrus_analytics_update(function (array &$state) use ($connections) {
                if ($connections > (int) $state['peak']) {
                    $state['peak'] = $connections;
                    $state['peakTime'] = (int) round(microtime(true) * 1000);
                }
                return true;
            });
        } catch (Throwable $e) {
            // Public now-playing must keep working if the stats file is locked.
        }
    }

    function citrus_track_listener(string $event, string $sessionId, string $userAgent, string $ip): bool {
        if (!in_array($event, ['connect', 'ping', 'disconnect'], true)) {
            return false;
        }
        if (!preg_match('/^[A-Za-z0-9-]{8,64}$/', $sessionId)) {
            return false;
        }

        $knownCountry = '';
        if ($event === 'connect') {
            $cacheKey = md5($ip);
            $cached = citrus_analytics_update(function (array &$state) use ($cacheKey) {
                return array_key_exists($cacheKey, $state['countryCache'])
                    ? (string) $state['countryCache'][$cacheKey]
                    : false;
            });
            $knownCountry = $cached === false || $cached === null
                ? citrus_analytics_lookup_country($ip)
                : (string) $cached;
        }

        $saved = citrus_analytics_update(function (array &$state) use ($event, $sessionId, $userAgent, $ip, $knownCountry) {
            citrus_analytics_prune($state);
            $now = time();

            if ($event === 'disconnect') {
                if (isset($state['sessions'][$sessionId])) {
                    $state['sessions'][$sessionId]['lastPing'] = $now;
                    citrus_analytics_finish_session($state, $state['sessions'][$sessionId]);
                    unset($state['sessions'][$sessionId]);
                }
                return true;
            }

            if (!isset($state['sessions'][$sessionId])) {
                if ($event === 'connect') {
                    $cacheKey = md5($ip);
                    $state['countryCache'][$cacheKey] = $knownCountry;
                    if (count($state['countryCache']) > 400) {
                        $state['countryCache'] = array_slice($state['countryCache'], -300, null, true);
                    }
                }

                $state['sessions'][$sessionId] = [
                    'connectedAt' => $now,
                    'lastPing' => $now,
                    'device' => citrus_analytics_device($userAgent),
                    'country' => $event === 'connect' ? $knownCountry : '',
                ];
                return true;
            }

            $state['sessions'][$sessionId]['lastPing'] = $now;
            return true;
        });

        return $saved === true;
    }

    function citrus_fetch_stream_connections(): ?int {
        $raw = citrus_http_get('https://s3.citrus3.com:2000/json/stream/casf', 4);
        $data = json_decode((string) $raw, true);
        if (!is_array($data) || !isset($data['connections']) || !is_numeric($data['connections'])) {
            return null;
        }
        return (int) $data['connections'];
    }

    function citrus_listener_stats(): array {
        $streamListeners = citrus_fetch_stream_connections();
        if ($streamListeners !== null) {
            citrus_note_stream_listeners($streamListeners);
        }

        $snapshot = citrus_analytics_update(function (array &$state) {
            citrus_analytics_prune($state);
            return [
                'sessions' => $state['sessions'],
                'peak' => (int) $state['peak'],
                'peakTime' => $state['peakTime'],
                'completedDurations' => $state['completedDurations'],
            ];
        });
        if (!is_array($snapshot)) {
            $snapshot = [
                'sessions' => [],
                'peak' => 0,
                'peakTime' => null,
                'completedDurations' => [],
            ];
        }

        $sessions = is_array($snapshot['sessions'] ?? null) ? $snapshot['sessions'] : [];
        $geographic = [];
        $devices = [];
        $activeDurations = [];
        $now = time();

        foreach ($sessions as $session) {
            $device = (string) ($session['device'] ?? 'unknown');
            $devices[$device] = ($devices[$device] ?? 0) + 1;
            $country = trim((string) ($session['country'] ?? ''));
            if ($country !== '') {
                $geographic[$country] = ($geographic[$country] ?? 0) + 1;
            }
            $activeDurations[] = max(0, $now - (int) ($session['connectedAt'] ?? $now));
        }

        $completed = array_values(array_filter(
            is_array($snapshot['completedDurations'] ?? null) ? $snapshot['completedDurations'] : [],
            'is_numeric'
        ));
        $durationSample = count($completed) > 0 ? $completed : $activeDurations;
        $average = count($durationSample) > 0
            ? (int) round(array_sum($durationSample) / count($durationSample))
            : 0;

        $websiteListeners = count($sessions);

        return [
            'currentListeners' => $streamListeners ?? $websiteListeners,
            'streamListeners' => $streamListeners,
            'websiteListeners' => $websiteListeners,
            'listenerSource' => $streamListeners === null ? 'website' : 'stream',
            'geographic' => $geographic,
            'devices' => $devices,
            'averageDuration' => $average,
            'peakListeners' => (int) ($snapshot['peak'] ?? 0),
            'peakTime' => $snapshot['peakTime'] ?? null,
        ];
    }
}
