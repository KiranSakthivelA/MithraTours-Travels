<?php
// db_manager.php - Emergency Database Viewer
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'api/config.php';

// Check connection
if (mysqli_connect_errno()) {
    echo "<h2 style='color:red'>❌ Database Connection Failed</h2>";
    echo "<p>Error: " . mysqli_connect_error() . "</p>";
    exit();
}

echo "<style>
    body { font-family: sans-serif; background: #f1f5f9; padding: 40px; color: #334155; }
    .card { background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
    h1 { color: #1e3a8a; }
    table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
    th { background: #f8fafc; color: #64748b; font-size: 0.8rem; text-transform: uppercase; }
    .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: bold; background: #dcfce7; color: #166534; }
</style>";

echo "<h1>KPS Travels - Emergency DB Manager</h1>";

// --- INQUIRIES ---
echo "<div class='card'>";
echo "<h2>Booking Inquiries</h2>";
$res = $conn->query("SELECT * FROM inquiries ORDER BY created_at DESC");
if (!$res) {
    echo "<p style='color:red'>Error fetching inquiries: " . $conn->error . "</p>";
    echo "<p>Try running <a href='fix_db.php'>fix_db.php</a> to fix the table.</p>";
} else {
    echo "<table>
        <thead><tr><th>Date</th><th>Name</th><th>Phone</th><th>Journey</th><th>Car</th><th>Status</th></tr></thead>
        <tbody>";
    while($row = $res->fetch_assoc()) {
        echo "<tr>
            <td>{$row['created_at']}</td>
            <td><b>{$row['name']}</b></td>
            <td>{$row['phone']}</td>
            <td>{$row['pickup']} -> {$row['drop_city']}</td>
            <td>{$row['car_type']}</td>
            <td><span class='badge'>{$row['status']}</span></td>
        </tr>";
    }
    if ($res->num_rows == 0) echo "<tr><td colspan='6'>No bookings found yet.</td></tr>";
    echo "</tbody></table>";
}
echo "</div>";

// --- FEEDBACKS ---
echo "<div class='card'>";
echo "<h2>Customer Feedbacks</h2>";
$res_f = $conn->query("SELECT * FROM feedbacks ORDER BY created_at DESC");
if (!$res_f) {
    echo "<p style='color:red'>Error fetching feedbacks: " . $conn->error . "</p>";
} else {
    echo "<table>
        <thead><tr><th>Date</th><th>Customer</th><th>Rating</th><th>Message</th></tr></thead>
        <tbody>";
    while($row = $res_f->fetch_assoc()) {
        echo "<tr>
            <td>{$row['created_at']}</td>
            <td><b>{$row['user_name']}</b></td>
            <td>{$row['rating']}/5</td>
            <td>{$row['message']}</td>
        </tr>";
    }
    if ($res_f->num_rows == 0) echo "<tr><td colspan='4'>No feedbacks yet.</td></tr>";
    echo "</tbody></table>";
}
echo "</div>";
?>
