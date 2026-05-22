<?php
// api/submit_inquiry.php

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

// Make sure data is not empty
if (
    !empty($data->name) &&
    !empty($data->phone) &&
    !empty($data->pickup) &&
    !empty($data->drop) &&
    !empty($data->car)
) {
    // Sanitize input to prevent SQL injection
    $name = htmlspecialchars(strip_tags($conn->real_escape_string($data->name)));
    $phone = htmlspecialchars(strip_tags($conn->real_escape_string($data->phone)));
    $pickup = htmlspecialchars(strip_tags($conn->real_escape_string($data->pickup)));
    $drop_city = htmlspecialchars(strip_tags($conn->real_escape_string($data->drop)));
    $car_type = htmlspecialchars(strip_tags($conn->real_escape_string($data->car)));
    
    // Optional fields
    $travel_date = isset($data->date) && !empty($data->date) ? $conn->real_escape_string($data->date) : null;
    $message = isset($data->message) && !empty($data->message) ? htmlspecialchars(strip_tags($conn->real_escape_string($data->message))) : null;

    // Prepare SQL query
    if ($travel_date !== null && $message !== null) {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type, travel_date, message) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type', '$travel_date', '$message')";
    } else if ($travel_date !== null) {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type, travel_date) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type', '$travel_date')";
    } else {
        $sql = "INSERT INTO inquiries (name, phone, pickup, drop_city, car_type) VALUES ('$name', '$phone', '$pickup', '$drop_city', '$car_type')";
    }

    if ($conn->query($sql) === TRUE) {
        // --- GOOGLE SHEETS AUTOMATION ---
        $inquiry_id = $conn->insert_id;
        if (defined('GOOGLE_SHEET_WEBHOOK') && GOOGLE_SHEET_WEBHOOK !== "") {
            $sheet_data = json_encode([
                "secret_token" => "KPS_SECURE_AUTH_8842",
                "action" => "new_inquiry",
                "id" => $inquiry_id,
                "name" => $name,
                "phone" => $phone,
                "pickup" => $pickup,
                "drop" => $drop_city,
                "car" => $car_type,
                "date" => $travel_date ? $travel_date : "Not Specified",
                "message" => $message ? $message : "",
                "status" => "New"
            ]);
            
            $ch = curl_init(GOOGLE_SHEET_WEBHOOK);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Important for Google Script redirects
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $sheet_data);
            curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json'));
            curl_setopt($ch, CURLOPT_TIMEOUT, 5); // Don't hang the user if Google is slow
            curl_exec($ch);
            curl_close($ch);
        }

        // Set response code - 201 created
        http_response_code(201);
        echo json_encode(array("message" => "Inquiry was created.", "id" => $inquiry_id));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        echo json_encode(array("message" => "Unable to create inquiry. Error: " . $conn->error));
    }
} else {
    // Tell the user data is incomplete
    // Set response code - 400 bad request
    http_response_code(400);
    echo json_encode(array("message" => "Unable to create inquiry. Data is incomplete."));
}

$conn->close();
?>
