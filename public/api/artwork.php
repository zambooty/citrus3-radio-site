<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=86400');

$artist = $_GET['artist'] ?? '';
$track = $_GET['track'] ?? '';
$fallback = $_GET['fallback'] ?? '';

if (empty($artist) || empty($track)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing artist or track']);
    exit;
}

$publicDir = __DIR__ . '/..';
$artworksDir = $publicDir . '/artworks';

if (!is_dir($artworksDir)) {
    if (!mkdir($artworksDir, 0755, true) && !is_dir($artworksDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create artworks directory']);
        exit;
    }
}

function normalizeText(string $text): string {
    return strtolower(preg_replace('/[^a-z0-9]/i', '_', trim($text)));
}

function fetchUrl(string $url): ?string {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_USERAGENT, 'CASFRadio/1.0');
        $res = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($res !== false && $httpCode >= 200 && $httpCode < 300) return $res;
    }
    
    $ctx = stream_context_create(['http' => ['timeout' => 10, 'header' => "User-Agent: CASFRadio/1.0\r\n"]]);
    $res = @file_get_contents($url, false, $ctx);
    return $res !== false ? $res : null;
}

function downloadAndSave(string $url, string $artist, string $track, string $artworksDir): ?string {
    $safeArtist = normalizeText($artist);
    $safeTrack = normalizeText($track);
    $hash = substr(md5($url), 0, 8);
    $filename = "{$safeArtist}-{$safeTrack}-{$hash}.jpg";
    $localPath = $artworksDir . '/' . $filename;
    $publicUrl = '/artworks/' . $filename;
    
    if (file_exists($localPath)) {
        return $publicUrl;
    }
    
    $imgData = fetchUrl($url);
    if ($imgData !== null) {
        // Basic check to see if it's actually an image
        if (substr($imgData, 0, 2) === "\xFF\xD8" || substr($imgData, 0, 4) === "\x89PNG") {
            if(file_put_contents($localPath, $imgData)) {
                return $publicUrl;
            }
        }
    }
    return null;
}

// iTunes Search
$searchTerms = [];
if (!empty($artist) && strcasecmp(trim($artist), 'unknown') !== 0) {
    $searchTerms[] = trim($artist);
}
if (!empty($track)) {
    $searchTerms[] = trim($track);
}
$query = urlencode(implode(' ', $searchTerms));
$itunesUrl = "https://itunes.apple.com/search?term={$query}&entity=song&limit=5";

$response = fetchUrl($itunesUrl);

if ($response) {
    $data = json_decode($response, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($data['results']) && count($data['results']) > 0) {
        // Try to get high res
        $artworkUrl = str_replace('100x100', '600x600', $data['results'][0]['artworkUrl100']);
        $realArtist = $data['results'][0]['artistName'] ?? $artist;
        $localUrl = downloadAndSave($artworkUrl, $artist, $track, $artworksDir);
        echo json_encode(['url' => $localUrl ?: $artworkUrl, 'source' => 'itunes', 'artist' => htmlspecialchars($realArtist)]);
        exit;
    }
}

// Fallback to deezer
if (!empty($artist) && strcasecmp(trim($artist), 'unknown') !== 0) {
    $deezerQuery = urlencode('artist:"' . trim($artist) . '" track:"' . trim($track) . '"');
} else {
    $deezerQuery = urlencode('track:"' . trim($track) . '"');
}
$deezerUrl = "https://api.deezer.com/search?q={$deezerQuery}&limit=1";
$dResponse = fetchUrl($deezerUrl);
if ($dResponse) {
    $dData = json_decode($dResponse, true);
    if (json_last_error() === JSON_ERROR_NONE && isset($dData['data'][0]['album']['cover_big'])) {
        $artworkUrl = $dData['data'][0]['album']['cover_big'];
        $realArtist = $dData['data'][0]['artist']['name'] ?? $artist;
        $localUrl = downloadAndSave($artworkUrl, $artist, $track, $artworksDir);
        echo json_encode(['url' => $localUrl ?: $artworkUrl, 'source' => 'deezer', 'artist' => htmlspecialchars($realArtist)]);
        exit;
    }
}

// Use fallback provided (only if it's an absolute URL and valid)
if (!empty($fallback) && filter_var($fallback, FILTER_VALIDATE_URL) && strpos($fallback, 'nocover') === false) {
    $localUrl = downloadAndSave($fallback, $artist, $track, $artworksDir);
    echo json_encode(['url' => $localUrl ?: htmlspecialchars($fallback), 'source' => 'fallback', 'artist' => htmlspecialchars($artist)]);
    exit;
}

echo json_encode(['url' => null, 'source' => 'none', 'artist' => htmlspecialchars($artist)]);
