<?php
function citrus_share_image(string $image): string {
    $image = trim($image);
    if ($image === '') {
        return 'https://casfradio.ca/images/logo.png';
    }
    if (preg_match('#^https?://#i', $image)) {
        return citrus_share_large_image($image);
    }
    return 'https://casfradio.ca/' . ltrim($image, '/');
}

function citrus_share_large_image(string $image): string {
    $parts = parse_url($image);
    if (!is_array($parts) || empty($parts['host']) || stripos($parts['host'], 'images.unsplash.com') === false) {
        return $image;
    }
    $query = [];
    if (!empty($parts['query'])) {
        parse_str($parts['query'], $query);
    }
    $query['auto'] = 'format';
    $query['fit'] = 'crop';
    $query['w'] = '1200';
    $query['h'] = '630';
    $query['q'] = '80';
    $scheme = $parts['scheme'] ?? 'https';
    return $scheme . '://' . $parts['host'] . ($parts['path'] ?? '') . '?' . http_build_query($query);
}

function citrus_share_description(array $item, string $type): string {
    $body = trim(preg_replace('/\s+/', ' ', (string) ($item['description'] ?? $item['summary'] ?? '')));
    $text = $body;
    if ($type === 'programs/show') {
        $when = trim((string) ($item['airTime'] ?? ''));
        $host = trim((string) ($item['host'] ?? ''));
        $lead = $when;
        if ($host !== '') {
            $lead = $lead === '' ? 'Hosted by ' . $host : $when . ' with ' . $host;
        }
        $join = preg_match('/[.!?]$/', $lead) ? ' ' : '. ';
        $text = $lead === '' ? $body : ($body === '' ? $lead : $lead . $join . $body);
    }
    if (function_exists('mb_strimwidth') && mb_strlen($text) > 280) {
        return rtrim(mb_strimwidth($text, 0, 277, '', 'UTF-8')) . '...';
    }
    if (strlen($text) > 280) {
        return rtrim(substr($text, 0, 277)) . '...';
    }
    return $text;
}

$type = $_GET['type'] ?? '';
$id = $_GET['id'] ?? '';

$dataDir = __DIR__ . '/../data/';
$file = '';

if ($type === 'news/article') {
    $file = $dataDir . 'news.json';
} elseif ($type === 'programs/show') {
    $file = $dataDir . 'shows.json';
} else {
    // Fallback if not news or shows
    header("Location: /");
    exit;
}

if (!file_exists($file)) {
    header("Location: /");
    exit;
}

$items = json_decode(file_get_contents($file), true);
$found = null;
foreach ($items as $item) {
    if ($item['id'] === $id) {
        $found = $item;
        break;
    }
}

if (!$found) {
    header("Location: /");
    exit;
}

$title = htmlspecialchars($found['title'] ?? 'CASF Radio', ENT_QUOTES, 'UTF-8');
$description = htmlspecialchars(citrus_share_description($found, $type), ENT_QUOTES, 'UTF-8');
$image = htmlspecialchars(citrus_share_image($found['image'] ?? ''), ENT_QUOTES, 'UTF-8');
$url = htmlspecialchars('https://casfradio.ca/' . $type . '/?id=' . rawurlencode($id), ENT_QUOTES, 'UTF-8');
$ogType = $type === 'programs/show' ? 'website' : 'article';

// Output the raw HTML with just the head and Open Graph tags.
// Bots only care about the <head> tags for generating previews.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title><?= $title ?> | CASF Radio</title>
    <meta property="og:title" content="<?= $title ?>" />
    <meta property="og:description" content="<?= $description ?>" />
    <meta property="og:image" content="<?= $image ?>" />
    <meta property="og:image:alt" content="<?= $title ?>" />
    <meta property="og:url" content="<?= $url ?>" />
    <meta property="og:type" content="<?= $ogType ?>" />
    <meta property="og:site_name" content="CASF Community Radio" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="<?= $title ?>" />
    <meta name="twitter:description" content="<?= $description ?>" />
    <meta name="twitter:image" content="<?= $image ?>" />
</head>
<body>
    <h1><?= $title ?></h1>
    <p><?= $description ?></p>
    <p>Please click the link to view the full article on our website.</p>
</body>
</html>
