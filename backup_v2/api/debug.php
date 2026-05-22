<?php
// api/debug.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h2>KPS Travels - Live Debugger</h2>";
echo "Testing environment...<br>";

if (!file_exists('config.php')) {
    die("❌ Error: config.php not found in the current directory!");
}

echo "✅ config.php found.<br>";
echo "Attempting connection...<br>";

try {
    require_once 'config.php';
    echo "✅ Connection established to: " . htmlspecialchars($db_host) . "<br>";
    
    $result = $conn->query("SHOW TABLES");
    if ($result) {
        echo "✅ Database reachable. Tables found:<br>";
        while ($row = $result->fetch_array()) {
            echo "- " . $row[0] . "<br>";
        }
    } else {
        echo "❌ Query failed: " . $conn->error . "<br>";
    }
} catch (Exception $e) {
    echo "❌ CRASH DETECTED: " . $e->getMessage() . "<br>";
    echo "Stack trace: <pre>" . $e->getTraceAsString() . "</pre>";
} catch (Error $e) {
    echo "❌ FATAL PHP ERROR: " . $e->getMessage() . "<br>";
}
?>
