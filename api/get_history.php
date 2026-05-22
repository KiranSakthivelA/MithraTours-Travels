<?php
// api/get_history.php

// --- CORS: Only allow requests from the live site or local dev ---
$allowed_origins = [
    'https://www.kpstravelscbe.com',
    'https://kpstravelscbe.com',
    'http://localhost',
    'http://127.0.0.1'
];
$origin = isset($_SERVER['HTTP_ORIGIN']) ? rtrim($_SERVER['HTTP_ORIGIN'], '/') : '';
if ($origin === '' || in_array($origin, $allowed_origins)) {
    if ($origin !== '') {
        header("Access-Control-Allow-Origin: $origin");
    }
} else {
    http_response_code(403);
    echo json_encode(['message' => 'Forbidden: Origin not allowed.']);
    exit;
}
header('Content-Type: application/json; charset=UTF-8');

include_once 'config.php';

$query = "SELECT * FROM inquiries WHERE status IN ('Completed', 'Cancelled') ORDER BY updated_at DESC";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    $history = array();
    while($row = $result->fetch_assoc()) {
        $history[] = $row;
    }
    echo json_encode(array("records" => $history));
} else {
    http_response_code(404);
    echo json_encode(array("message" => "No history found."));
}
?>
