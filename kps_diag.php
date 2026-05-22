<?php
// kps_diag.php - Full diagnostic tool
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>
<!DOCTYPE html>
<html>
<head>
<title>KPS Diagnostic</title>
<style>
body { font-family: monospace; background: #0f172a; color: #e2e8f0; padding: 20px; }
.ok  { color: #4ade80; }
.err { color: #f87171; }
.warn{ color: #fbbf24; }
.box { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 15px; margin: 10px 0; }
h2   { color: #38bdf8; }
pre  { color: #94a3b8; margin: 5px 0; }
</style>
</head>
<body>
<h2>KPS Server Diagnostic</h2>

<div class="box">
<h3>1. PHP & Server Info</h3>
<?php
echo "<pre>PHP Version: " . phpversion() . "</pre>";
echo "<pre>Server: " . ($_SERVER['SERVER_SOFTWARE'] ?? 'Unknown') . "</pre>";
echo "<pre>Document Root: " . ($_SERVER['DOCUMENT_ROOT'] ?? 'Unknown') . "</pre>";
echo "<pre>Server Name: " . ($_SERVER['SERVER_NAME'] ?? 'Unknown') . "</pre>";
echo "<pre>Script Path: " . __FILE__ . "</pre>";
?>
</div>

<div class="box">
<h3>2. Config File Test</h3>
<?php
$config_path = __DIR__ . '/api/config.php';
if (file_exists($config_path)) {
    echo "<p class='ok'>✅ api/config.php found</p>";
    // Try to include it
    try {
        require_once $config_path;
        echo "<p class='ok'>✅ config.php loaded OK</p>";
        echo "<pre>DB Host: " . ($db_host ?? 'not set') . "</pre>";
        echo "<pre>DB User: " . ($db_user ?? 'not set') . "</pre>";
        echo "<pre>DB Name: " . ($db_name ?? 'not set') . "</pre>";
        echo "<pre>Is Localhost: " . ($is_localhost ? 'YES (using local config)' : 'NO (using LIVE config)') . "</pre>";
    } catch (Throwable $e) {
        echo "<p class='err'>❌ Error loading config: " . $e->getMessage() . "</p>";
    }
} else {
    echo "<p class='err'>❌ api/config.php NOT FOUND at: $config_path</p>";
}
?>
</div>

<div class="box">
<h3>3. Database Connection Test</h3>
<?php
if (isset($conn)) {
    if (mysqli_connect_errno()) {
        echo "<p class='err'>❌ Connection FAILED: " . mysqli_connect_error() . "</p>";
        echo "<pre>Error Code: " . mysqli_connect_errno() . "</pre>";
    } else {
        echo "<p class='ok'>✅ Database Connected!</p>";
        $ver = $conn->query("SELECT VERSION() as v");
        if ($ver) {
            $row = $ver->fetch_assoc();
            echo "<pre>MySQL Version: " . $row['v'] . "</pre>";
        }
    }
} else {
    echo "<p class='err'>❌ \$conn not set - config.php may have failed</p>";
}
?>
</div>

<div class="box">
<h3>4. Table Check & Auto-Create</h3>
<?php
if (isset($conn) && !mysqli_connect_errno()) {
    // Check inquiries table
    $r = $conn->query("SHOW TABLES LIKE 'inquiries'");
    if ($r && $r->num_rows > 0) {
        echo "<p class='ok'>✅ Table 'inquiries' exists</p>";
        // Check columns
        $cols = $conn->query("SHOW COLUMNS FROM inquiries");
        $col_names = [];
        while($c = $cols->fetch_assoc()) $col_names[] = $c['Field'];
        echo "<pre>Columns: " . implode(', ', $col_names) . "</pre>";
        
        // Add missing price column
        if (!in_array('price', $col_names)) {
            if ($conn->query("ALTER TABLE inquiries ADD COLUMN price DECIMAL(10,2) DEFAULT NULL")) {
                echo "<p class='ok'>✅ Added missing 'price' column</p>";
            } else {
                echo "<p class='err'>❌ Error adding price: " . $conn->error . "</p>";
            }
        }
        if (!in_array('updated_at', $col_names)) {
            if ($conn->query("ALTER TABLE inquiries ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")) {
                echo "<p class='ok'>✅ Added missing 'updated_at' column</p>";
            } else {
                echo "<p class='err'>❌ Error adding updated_at: " . $conn->error . "</p>";
            }
        }
    } else {
        echo "<p class='warn'>⚠️ Table 'inquiries' does NOT exist - creating now...</p>";
        $sql = "CREATE TABLE inquiries (
            id int(11) NOT NULL AUTO_INCREMENT,
            name varchar(100) NOT NULL,
            phone varchar(20) NOT NULL,
            pickup varchar(150) NOT NULL,
            drop_city varchar(150) NOT NULL,
            car_type varchar(50) NOT NULL,
            travel_date date DEFAULT NULL,
            message text DEFAULT NULL,
            status varchar(20) NOT NULL DEFAULT 'New',
            price DECIMAL(10,2) DEFAULT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        if ($conn->query($sql)) {
            echo "<p class='ok'>✅ Table 'inquiries' created!</p>";
        } else {
            echo "<p class='err'>❌ Create failed: " . $conn->error . "</p>";
        }
    }

    // Check feedbacks table
    $r2 = $conn->query("SHOW TABLES LIKE 'feedbacks'");
    if ($r2 && $r2->num_rows > 0) {
        echo "<p class='ok'>✅ Table 'feedbacks' exists</p>";
    } else {
        echo "<p class='warn'>⚠️ Table 'feedbacks' does NOT exist - creating now...</p>";
        $sql_fb = "CREATE TABLE feedbacks (
            id int(11) NOT NULL AUTO_INCREMENT,
            user_name varchar(100) NOT NULL,
            rating int(1) NOT NULL DEFAULT 5,
            message text NOT NULL,
            created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";
        if ($conn->query($sql_fb)) {
            echo "<p class='ok'>✅ Table 'feedbacks' created!</p>";
        } else {
            echo "<p class='err'>❌ Create failed: " . $conn->error . "</p>";
        }
    }

    // Count records
    $cnt = $conn->query("SELECT COUNT(*) as c FROM inquiries");
    if ($cnt) {
        $row = $cnt->fetch_assoc();
        echo "<p class='ok'>📊 Total inquiries in DB: " . $row['c'] . "</p>";
    }
} else {
    echo "<p class='err'>❌ Cannot check tables - no database connection</p>";
}
?>
</div>

<div class="box">
<h3>5. API File Check</h3>
<?php
$apis = ['api/get_inquiries.php', 'api/submit_inquiry.php', 'api/update_status.php', 'api/get_feedbacks.php', 'api/get_history.php', 'api/get_stats.php'];
foreach ($apis as $f) {
    $full = __DIR__ . '/' . $f;
    if (file_exists($full)) {
        echo "<p class='ok'>✅ " . $f . "</p>";
    } else {
        echo "<p class='err'>❌ MISSING: " . $f . "</p>";
    }
}
?>
</div>

<div class="box">
<h3>6. Quick API Live Test</h3>
<?php
// Try calling get_inquiries.php directly
if (isset($conn) && !mysqli_connect_errno()) {
    $result = $conn->query("SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 5");
    if ($result) {
        $rows = [];
        while($r = $result->fetch_assoc()) $rows[] = $r;
        echo "<p class='ok'>✅ Direct query works. Rows returned: " . count($rows) . "</p>";
        if (count($rows) === 0) {
            echo "<p class='warn'>⚠️ Database is empty - submit a test booking from the website.</p>";
        }
    } else {
        echo "<p class='err'>❌ Query error: " . $conn->error . "</p>";
    }
}
?>
</div>

<p style="color:#38bdf8; margin-top: 20px;">
    <a href="admin/index.php" style="color:#38bdf8;">→ Go to Admin Panel</a>
</p>
</body>
</html>
