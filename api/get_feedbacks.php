<?php
// api/get_feedbacks.php

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
    echo json_encode(['error' => 'Forbidden: Origin not allowed.']);
    exit;
}
require_once 'config.php';
header('Content-Type: application/json');

if (mysqli_connect_errno()) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed", "details" => mysqli_connect_error()]);
    exit();
}
$sql = "SELECT id, user_name, rating, message, created_at FROM feedbacks ORDER BY created_at DESC";
$result = $conn->query($sql);

$feedbacks = [];
if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $feedbacks[] = $row;
    }
}

echo json_encode($feedbacks);
$conn->close();
?>
