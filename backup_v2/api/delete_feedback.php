<?php
session_start();
require_once 'config.php';
header('Content-Type: application/json');

// Ensure only admin can delete
if (!isset($_SESSION['admin_logged_in']) || $_SESSION['admin_logged_in'] !== true) {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!isset($data['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Feedback ID missing']);
    exit;
}

$id = (int) $data['id'];

$sql = "DELETE FROM feedbacks WHERE id = $id";

if ($conn->query($sql) === TRUE) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to delete feedback']);
}

$conn->close();
?>
