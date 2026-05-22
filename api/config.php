<?php
// api/config.php

// Environment Detection
$server_name = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : 'localhost';
$is_localhost = ($server_name == 'localhost' || $server_name == '127.0.0.1');

if ($is_localhost) {
    // Local XAMPP Configuration
    $db_host = '127.0.0.1'; // or 'localhost'
    $db_user = 'root';
    $db_pass = '';
    $db_name = 'kps_travels_db';
} else {
    // LIVE Hostinger Configuration
    $db_host = 'localhost'; 
    $db_user = 'u901549358_kpstravels_use'; 
    $db_pass = 'Kps!Travel@Secure2026#';   
    $db_name = 'u901549358_kpstravels_db'; 
}

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
// MTT Tours & Travels Spreadsheet: https://docs.google.com/spreadsheets/d/1tma0N3_MT4-LzhOMdHZdod_MaEdWT1QH9pvFzwrBTZc/edit?usp=sharing
// After setting up Google Apps Script, paste your Web App URL here:
define('GOOGLE_SHEET_WEBHOOK', 'https://script.google.com/macros/s/AKfycbzBUcORXcOLUh_u4JswSGjsKPIpH7lDWujhuibeeCpktJ47Hg0Ivym3sUseMvUSVn2-/exec');
?>