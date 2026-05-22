<?php
// api/config.php

// Database configuration
$db_host = '127.0.0.1'; // 127.0.0.1 is faster than localhost on Windows
$db_user = 'root'; 
$db_pass = '';     
$db_name = 'kps_travels_db'; 

// Create connection
mysqli_report(MYSQLI_REPORT_OFF);
$conn = mysqli_init();
mysqli_options($conn, MYSQLI_OPT_CONNECT_TIMEOUT, 2); // 2 second timeout - no more long hangs!
@mysqli_real_connect($conn, $db_host, $db_user, $db_pass, $db_name);

// Check connection
if (mysqli_connect_errno()) {
    // Let the calling script handle the error (e.g. return JSON), log the error internally
    error_log("Database connection failed: " . mysqli_connect_error());
}



// Set charset to utf8mb4 for proper character encoding (handles emojis, special chars)
$conn->set_charset("utf8mb4");

// --- Google Sheets Automation URL ---
// After following the GOOGLE_SHEETS_SETUP.md instructions, paste your URL here:
define('GOOGLE_SHEET_WEBHOOK', 'https://script.google.com/macros/s/AKfycbzBUcORXcOLUh_u4JswSGjsKPIpH7lDWujhuibeeCpktJ47Hg0Ivym3sUseMvUSVn2-/exec');
?>
