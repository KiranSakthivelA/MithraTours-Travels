<?php
// kps_reset.php - Clean database reset (removes test data, resets IDs to 1)
error_reporting(E_ALL);
ini_set('display_errors', 1);
require_once 'api/config.php';

echo "<style>body{font-family:sans-serif;background:#0f172a;color:#e2e8f0;padding:30px;} .ok{color:#4ade80;} .err{color:#f87171;} h2{color:#38bdf8;} .box{background:#1e293b;border-radius:8px;padding:15px;margin:10px 0;}</style>";
echo "<h2>KPS Database Reset</h2>";

if (mysqli_connect_errno()) {
    echo "<p class='err'>❌ Connection failed: " . mysqli_connect_error() . "</p>";
    exit();
}

echo "<p class='ok'>✅ Connected to database.</p>";

// Truncate inquiries (removes all rows + resets AUTO_INCREMENT to 1)
if ($conn->query("TRUNCATE TABLE inquiries")) {
    echo "<div class='box'><p class='ok'>✅ inquiries table cleared — ID will now start from 1.</p></div>";
} else {
    echo "<div class='box'><p class='err'>❌ Error clearing inquiries: " . $conn->error . "</p></div>";
}

// Truncate feedbacks too
if ($conn->query("TRUNCATE TABLE feedbacks")) {
    echo "<div class='box'><p class='ok'>✅ feedbacks table cleared.</p></div>";
} else {
    echo "<div class='box'><p class='err'>❌ Error clearing feedbacks: " . $conn->error . "</p></div>";
}

echo "<div class='box'><p><strong>✅ Reset Complete! All test data removed. New bookings will start from ID 1.</strong></p>";
echo "<p><a href='admin/index.php' style='color:#38bdf8;'>→ Go to Admin Panel</a></p></div>";

$conn->close();
?>
