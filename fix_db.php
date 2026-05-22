<?php
// fix_db.php - Database Initialization (MySQL Compatible)
require_once 'api/config.php';

echo "<style>body{font-family:sans-serif;padding:30px;background:#f0fdf4;} .ok{color:green;} .err{color:red;} h2{color:#1e3a8a;}</style>";
echo "<h2>KPS Database Setup</h2>";

if (mysqli_connect_errno()) {
    echo "<p class='err'>❌ Database connection failed: " . mysqli_connect_error() . "</p>";
    exit();
}

echo "<p class='ok'>✅ Connected to database successfully.</p>";

// --- 1. Create Inquiries Table ---
$sql = "CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `pickup` varchar(150) NOT NULL,
  `drop_city` varchar(150) NOT NULL,
  `car_type` varchar(50) NOT NULL,
  `travel_date` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'New',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql)) {
    echo "<p class='ok'>✅ inquiries table: OK</p>";
} else {
    echo "<p class='err'>❌ Error creating inquiries table: " . $conn->error . "</p>";
}

// --- 2. Add 'price' column if it doesn't exist ---
$check_price = $conn->query("SHOW COLUMNS FROM inquiries LIKE 'price'");
if ($check_price && $check_price->num_rows === 0) {
    if ($conn->query("ALTER TABLE inquiries ADD COLUMN `price` DECIMAL(10,2) DEFAULT NULL")) {
        echo "<p class='ok'>✅ Added 'price' column to inquiries.</p>";
    } else {
        echo "<p class='err'>❌ Error adding price column: " . $conn->error . "</p>";
    }
} else {
    echo "<p class='ok'>✅ 'price' column already exists.</p>";
}

// --- 3. Add 'updated_at' column if it doesn't exist ---
$check_updated = $conn->query("SHOW COLUMNS FROM inquiries LIKE 'updated_at'");
if ($check_updated && $check_updated->num_rows === 0) {
    if ($conn->query("ALTER TABLE inquiries ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")) {
        echo "<p class='ok'>✅ Added 'updated_at' column to inquiries.</p>";
    } else {
        echo "<p class='err'>❌ Error adding updated_at column: " . $conn->error . "</p>";
    }
} else {
    echo "<p class='ok'>✅ 'updated_at' column already exists.</p>";
}

// --- 4. Create Feedbacks Table ---
$sql_fb = "CREATE TABLE IF NOT EXISTS `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `rating` int(1) NOT NULL DEFAULT 5,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

if ($conn->query($sql_fb)) {
    echo "<p class='ok'>✅ feedbacks table: OK</p>";
} else {
    echo "<p class='err'>❌ Error creating feedbacks table: " . $conn->error . "</p>";
}

echo "<hr><p><strong>✅ Setup Complete! You can now submit a booking and it will appear in the admin panel.</strong></p>";
echo "<p><a href='admin/index.php'>→ Go to Admin Panel</a></p>";

$conn->close();
?>
