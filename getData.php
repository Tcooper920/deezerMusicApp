<?php

require("config.php"); // Include API keys

$artist_name = $_GET['q'] ?? '';

$ch = curl_init(); // cURL handle

curl_setopt_array($ch, [
    CURLOPT_URL => "https://deezerdevs-deezer.p.rapidapi.com/search?q=" . urlencode($artist_name),
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "x-rapidapi-host: deezerdevs-deezer.p.rapidapi.com",
        "x-rapidapi-key: $myKey"
    ]
]);

$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
