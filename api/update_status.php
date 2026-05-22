<?php
// api/update_status.php

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
    echo json_encode(["message" => "Forbidden: Origin not allowed."]);
    exit;
}
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

require_once 'config.php';

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Ensure data is not empty
if (!empty($data->id) && !empty($data->status)) {
    // Sanitize input
    $id = htmlspecialchars(strip_tags($conn->real_escape_string($data->id)));
    $status = htmlspecialchars(strip_tags($conn->real_escape_string($data->status)));
    $price = null;

    // Check if status is 'Completed' and price is provided
    if ($status === 'Completed' && isset($data->price)) {
        $price = htmlspecialchars(strip_tags($conn->real_escape_string($data->price)));
    }

    // Prepare SQL query
    $sql = "UPDATE inquiries SET status = '$status'";
    if ($price !== null) {
        $sql .= ", price = '$price'";
    }
    $sql .= " WHERE id = '$id'";

    if ($conn->query($sql) === TRUE) {
        // --- GOOGLE SHEETS AUTOMATION ---
        if (defined('GOOGLE_SHEET_WEBHOOK') && GOOGLE_SHEET_WEBHOOK !== "") {
            $sheet_data = json_encode([
                "secret_token" => "KPS_SECURE_AUTH_8842",
                "action" => "update_status",
                "id" => $id,
                "status" => $status,
                "price" => $price ? $price : ""
            ]);

            $ch = curl_init(GOOGLE_SHEET_WEBHOOK);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $sheet_data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_exec($ch);
            curl_close($ch);
        }

        // Set response code - 200 ok
        http_response_code(200);
        echo json_encode(array("message" => "Status was updated."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        echo json_encode(array("message" => "Unable to update status. Error: " . $conn->error));
    }
} else {
    // Tell the user data is incomplete
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to update status. Data is incomplete."));
}

$conn->close();
?>
