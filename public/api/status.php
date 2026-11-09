<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/analytics/lib.php';

$API_URL = "https://s3.citrus3.com:2000/json/stream/casf";

function fetchJson(string $url) {
    if (function_exists('curl_init')) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        curl_setopt($ch, CURLOPT_USERAGENT, 'CASFRadio/1.0');
        $res = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        if ($res === false || $httpCode >= 400) return null;
        return json_decode($res, true);
    }

    $ctx = stream_context_create([
        'http' => [
            'timeout' => 5,
            'header' => "User-Agent: CASFRadio/1.0\r\n"
        ],
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
        ]
    ]);
    $res = @file_get_contents($url, false, $ctx);
    if ($res === false) return null;
    return json_decode($res, true);
}

try {
    $data = fetchJson($API_URL);
    
    if (!$data) {
        throw new Exception("Failed to fetch from Citrus3 API");
    }

    // Parse current track
    $currentTrack = null;
    $nowPlayingRaw = '';
    if (!empty($data['nowplaying'])) {
        $nowPlayingRaw = trim($data['nowplaying']);
        $songParts = preg_split('/\s*[-–]\s*/', $data['nowplaying']);
        $artist = trim($songParts[0] ?? 'Unknown');
        $title = isset($songParts[1]) ? implode(' - ', array_slice($songParts, 1)) : trim($data['nowplaying']);
        
        // If there's no dash, fallback to Unknown artist
        if (!isset($songParts[1])) {
            $artist = 'Unknown';
            $title = trim($data['nowplaying']);
        }

        // Clean up empty coverart URLs
        $coverart = !empty($data['coverart']) ? $data['coverart'] : null;
        
        $currentTrack = [
            'artist' => $artist,
            'title' => $title,
            'image' => $coverart,
            'time' => 'Live',
            'raw' => $nowPlayingRaw
        ];
    }
    
    // Maintain a local recent tracks cache to preserve artist names
    $dataDir = __DIR__ . '/../data/';
    if (!file_exists($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    citrus_protect_private_data();

    $cacheFile = $dataDir . 'recent_tracks_cache.json';
    $cachedHistory = [];
    if (file_exists($cacheFile)) {
        $cachedHistory = json_decode(file_get_contents($cacheFile), true) ?: [];
    }
    
    // Update cache if the current track has changed
    if ($currentTrack && (!isset($cachedHistory[0]) || $cachedHistory[0]['raw'] !== $nowPlayingRaw)) {
        // Prepend current track
        array_unshift($cachedHistory, $currentTrack);
        
        // Keep only the last 15 tracks
        $cachedHistory = array_slice($cachedHistory, 0, 15);
        
        // Save back to cache securely using file locking
        $fp = fopen($cacheFile, 'c');
        if ($fp) {
            if (flock($fp, LOCK_EX)) {
                ftruncate($fp, 0);
                fwrite($fp, json_encode($cachedHistory));
                flock($fp, LOCK_UN);
            }
            fclose($fp);
        }
    }
    
    // Build the final recent tracks array
    $recentTracks = [];
    // Start with our cached history (skipping the currently playing track which is at index 0)
    if (count($cachedHistory) > 1) {
        $recentTracks = array_slice($cachedHistory, 1, 5); // Take up to 5 recent tracks
    }
    
    // If we don't have enough history in our cache, fill the rest with Citrus3's history
    if (count($recentTracks) < 5 && !empty($data['trackhistory']) && is_array($data['trackhistory'])) {
        // Strip out tracks that are already in our cache to prevent duplicates
        $knownTitles = array_map(function($t) { return strtolower(trim($t['title'])); }, $cachedHistory);
        
        foreach ($data['trackhistory'] as $index => $trackStr) {
            if (count($recentTracks) >= 5) break;
            
            $songParts = preg_split('/\s*[-–]\s*/', $trackStr);
            $artist = trim($songParts[0] ?? 'Unknown');
            $title = isset($songParts[1]) ? implode(' - ', array_slice($songParts, 1)) : trim($trackStr);
            
            if (!isset($songParts[1])) {
                $artist = "Unknown";
                $title = trim($trackStr);
            }
            
            // Skip if this title is already in our cached history
            if (in_array(strtolower(trim($title)), $knownTitles)) continue;
            
            $cover = !empty($data['covers'][$index]) ? $data['covers'][$index] : null;

            $recentTracks[] = [
                'artist' => $artist,
                'title' => $title,
                'image' => $cover,
                'time' => ''
            ];
            
            // Add to known titles so we don't duplicate fallback items
            $knownTitles[] = strtolower(trim($title));
        }
    }
    
    if (isset($data['connections']) && is_numeric($data['connections'])) {
        citrus_note_stream_listeners((int) $data['connections']);
    }

    echo json_encode([
        'current' => $currentTrack,
        'recent' => $recentTracks
    ]);

} catch (Exception $e) {
    echo json_encode(['error' => 'Failed to fetch radio status: ' . $e->getMessage()]);
}
