<?php
require_once 'config.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['name']) || !isset($data['message']) || !isset($data['rating'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$name = $conn->real_escape_string($data['name']);
$message = $conn->real_escape_string($data['message']);
$rating = (int) $data['rating'];

$sql = "INSERT INTO feedbacks (user_name, rating, message) VALUES ('$name', $rating, '$message')";

if ($conn->query($sql) === TRUE) {
    http_response_code(201);
    echo json_encode(['success' => true, 'id' => $conn->insert_id]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $conn->error]);
}

$conn->close();
?>
