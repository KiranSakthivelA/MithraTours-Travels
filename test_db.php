<?php
$conn1 = mysqli_init();
mysqli_options($conn1, MYSQLI_OPT_CONNECT_TIMEOUT, 2);
if (@mysqli_real_connect($conn1, 'localhost', 'root', '', 'kps_travels_db')) {
    echo "Connected successfully to localhost!\n";
} else {
    echo "Failed localhost: " . mysqli_connect_error() . "\n";
}

$conn2 = mysqli_init();
mysqli_options($conn2, MYSQLI_OPT_CONNECT_TIMEOUT, 2);
if (@mysqli_real_connect($conn2, '127.0.0.1', 'root', '', 'kps_travels_db')) {
    echo "Connected successfully to 127.0.0.1!\n";
} else {
    echo "Failed 127.0.0.1: " . mysqli_connect_error() . "\n";
}
?>
