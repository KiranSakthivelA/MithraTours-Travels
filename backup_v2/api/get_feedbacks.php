<?php
require_once 'config.php';
header('Content-Type: application/json');

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
