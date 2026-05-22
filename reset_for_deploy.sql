-- ============================================================
-- KPS Travels - PRE-DEPLOYMENT DATABASE RESET SCRIPT
-- Run this in phpMyAdmin (both local & Hostinger) before going live
-- This clears all test data and resets IDs to start from 1
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Clear INQUIRIES table
TRUNCATE TABLE `inquiries`;

-- Clear FEEDBACKS table
TRUNCATE TABLE `feedbacks`;

-- Clear BOOKING HISTORY table (if exists)
-- TRUNCATE TABLE `booking_history`;

SET FOREIGN_KEY_CHECKS = 1;

-- Confirm reset
SELECT 'inquiries' AS `Table`, COUNT(*) AS `Rows Remaining` FROM inquiries
UNION ALL
SELECT 'feedbacks', COUNT(*) FROM feedbacks;
