<?php
// api/get_inquiries.php

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
    echo json_encode(['message' => 'Forbidden: Origin not allowed.', 'records' => []]);
    exit;
}
header("Content-Type: application/json; charset=UTF-8");

require_once 'config.php';

// If connection failed, return JSON error
if (mysqli_connect_errno()) {
    http_response_code(500);
    echo json_encode(array("message" => "Database connection failed", "records" => [], "error" => mysqli_connect_error()));
    exit();
}


// Check if a specific ID was requested
$id = isset($_GET['id']) ? $_GET['id'] : null;

$sql = "SELECT i.*, (SELECT COUNT(*) FROM inquiries i2 WHERE i2.phone = i.phone) as booking_count FROM inquiries i ORDER BY i.created_at DESC";

if ($id) {
    $sql = "SELECT i.*, (SELECT COUNT(*) FROM inquiries i2 WHERE i2.phone = i.phone) as booking_count FROM inquiries i WHERE i.id = " . $conn->real_escape_string($id);
}

$result = $conn->query($sql);

if (!$result) {
    // If the query failed (e.g. table doesn't exist), return JSON error
    http_response_code(500);
    echo json_encode(array("message" => "Database query failed", "records" => [], "error" => $conn->error));
    exit();
}

if ($result->num_rows > 0) {
    // Inquiries array
    $inquiries_arr = array();
    $inquiries_arr["records"] = array();


    while ($row = $result->fetch_assoc()) {
        array_push($inquiries_arr["records"], $row);
    }

    // Set response code - 200 OK
    http_response_code(200);
    echo json_encode($inquiries_arr);
} else {
    // Set response code - 404 Not found
    http_response_code(404);
    echo json_encode(array("message" => "No inquiries found.", "records" => array()));
}

$conn->close();
?>
