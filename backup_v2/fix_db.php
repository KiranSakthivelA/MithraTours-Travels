<?php
// fix_db.php
require_once 'api/config.php';

echo "<h2>Database Schema Fix</h2>";

$sql = "ALTER TABLE inquiries 
        ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL, 
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;";

if ($conn->query($sql)) {
    echo "<p style='color: green;'>Success: inquiries table updated (added price and updated_at columns).</p>";
} else {
    echo "<p style='color: red;'>Error updating table: " . $conn->error . "</p>";
}

$sql_feedback = "CREATE TABLE IF NOT EXISTS feedbacks (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_name varchar(100) NOT NULL,
  rating int(1) NOT NULL DEFAULT 5,
  message text NOT NULL,
  created_at timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;";

if ($conn->query($sql_feedback)) {
    echo "<p style='color: green;'>Success: feedbacks table verified/created.</p>";
} else {
    echo "<p style='color: red;'>Error creating feedbacks table: " . $conn->error . "</p>";
}

// Verify columns
$res = $conn->query("DESCRIBE inquiries");
echo "<h3>Current Table Structure:</h3><pre>";
while($row = $res->fetch_assoc()) {
    print_r($row);
}
echo "</pre>";

$conn->close();
?>
