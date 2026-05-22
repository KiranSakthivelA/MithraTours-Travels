-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: kps_travels_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `feedbacks`
--

DROP TABLE IF EXISTS `feedbacks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `feedbacks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_name` varchar(100) NOT NULL,
  `rating` int(1) NOT NULL DEFAULT 5,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `feedbacks`
--

LOCK TABLES `feedbacks` WRITE;
/*!40000 ALTER TABLE `feedbacks` DISABLE KEYS */;
INSERT INTO `feedbacks` VALUES (1,'Verified User',4,'Final design test','2026-03-23 19:23:44'),(8,'Test user 1',5,'nice','2026-04-01 18:14:18'),(10,'Final Test User 0',4,'Nice, Good Experience!','2026-04-04 08:11:08'),(11,'Final Test User 1',5,'Good','2026-04-04 08:23:42');
/*!40000 ALTER TABLE `feedbacks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inquiries`
--

DROP TABLE IF EXISTS `inquiries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inquiries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `pickup` varchar(150) NOT NULL,
  `drop_city` varchar(150) NOT NULL,
  `car_type` varchar(50) NOT NULL,
  `travel_date` date DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'New',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `price` decimal(10,2) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inquiries`
--

LOCK TABLES `inquiries` WRITE;
/*!40000 ALTER TABLE `inquiries` DISABLE KEYS */;
INSERT INTO `inquiries` VALUES (1,'Kiran','1234567890','Coimbatore','Madurai','SUV','2026-03-20','Nil','Completed','2026-03-17 14:21:24',5600.00,'2026-03-17 15:32:35'),(2,'Kiran','1234567890','Coimbatore','Coimbatore','Sedan','2026-03-25',NULL,'Cancelled','2026-03-17 14:40:41',NULL,'2026-03-17 15:32:28'),(3,'Kiran','1234567890','Coimbatore','Coimbatore','Sedan',NULL,NULL,'Completed','2026-03-17 15:16:27',5000.00,'2026-03-17 15:40:47'),(4,'Test User','9876543210','Coimbatore','Chennai','Sedan',NULL,NULL,'Completed','2026-03-17 15:35:56',7500.00,'2026-03-17 15:40:27'),(5,'test user 2','9876543210','Coimbatore','Bengaluru','SUV','2026-03-25',NULL,'Completed','2026-03-17 15:42:18',4500.00,'2026-03-17 15:44:01'),(6,'test user 3','1234567890','Coimbatore','pune','Sedan',NULL,NULL,'Completed','2026-03-17 17:31:28',6500.00,'2026-03-17 17:32:19'),(7,'test user 4','1234567890','Coimbatore','Madurai','SUV',NULL,NULL,'Cancelled','2026-03-18 05:43:55',7500.00,'2026-03-18 05:45:48'),(8,'Kiran','1234567890','Coimbatore, Tamil Nadu','Thanjavur, Tamil Nadu','Sedan',NULL,NULL,'Completed','2026-03-18 09:46:22',4150.00,'2026-03-18 09:46:52'),(9,'test user 2','9442173548','Coimbatore, Tamil Nadu','Dindigul, Tamil Nadu','SUV','2026-03-27','Estimated distance: 147 km (approx), Fare: ₹2,499 *. Note: ','Cancelled','2026-03-18 09:57:09',NULL,'2026-03-23 13:02:54'),(10,'test user 5','1234567890','Chengannūr, Kerala','Cherpulassery, Kerala','Sedan','2026-03-27','Trip: Round Trip, Estimated distance: 456 km (Round Trip), Fare: ₹6,328 *','Completed','2026-03-23 17:32:48',0.00,'2026-03-26 14:45:27'),(11,'test user 2','1234567890','Ambur, Tamil Nadu','Perambalur, Tamil Nadu','Sedan (One Way)','2026-03-26','Trip: One Way, Estimated distance: 271 km (One Way), Fare: ₹4,189 *. Note: ','Completed','2026-03-26 14:35:07',2000.00,'2026-03-26 14:36:54'),(12,'test user 2','1234567890','Coimbatore','madu','Sedan (One Way)','2026-04-02','Trip: One Way, Estimated distance: 0 km, Fare: ₹0. Note: ','New','2026-04-02 11:50:52',NULL,'2026-04-02 11:50:52'),(13,'test user 2','1234567890','Coimbatore, Tamil Nadu, India','Madurai, Tamil Nadu, India','Sedan (One Way)','2026-04-02','Trip: One Way, Estimated distance: 218 km (One Way), Fare: ₹3,451 *. Note: ','Completed','2026-04-02 12:00:07',2500.00,'2026-04-04 07:20:04'),(14,'test user 2','1234567890','Coimbatore, Tamil Nadu, India','Madurai, Tamil Nadu, India','Sedan','2026-04-04',NULL,'Cancelled','2026-04-04 07:44:55',NULL,'2026-04-04 08:13:46'),(15,'test user 0','1234567890','Coimbatore','Madurai, Tamil Nadu, India','Innova Crysta','2026-04-04','Pax: 1A, 0C | Luggage: 1 | Trip: One Way | ','Completed','2026-04-04 07:57:29',4500.00,'2026-04-04 07:58:03'),(16,'Final Test User 0','1234567890','Coimbatore','Madurai, Tamil Nadu, India','SUV','2026-04-04','Pax: 5A, 2C | Luggage: 4+ | Trip: Round Trip | Need Luggage Carrier','Completed','2026-04-04 08:09:32',15000.00,'2026-04-04 08:10:27'),(17,'Final Test User 1','1234567890','Coimbatore, Tamil Nadu, India','Bangalore, Karnataka, India','Innova Crysta','2026-04-04','Pax: 1A, 0C | Luggage: 1 | Trip: One Way | Non AC','Completed','2026-04-04 08:12:12',7500.00,'2026-04-04 08:13:22'),(18,'Final Test User 2','1234567890','Coimbatore, Tamil Nadu, India','Chennai, Tamil Nadu, India','SUV','2026-04-22','Pax: 1A, 0C | Luggage: 1 | Trip: Round Trip | ','New','2026-04-04 08:15:02',NULL,'2026-04-04 08:15:02'),(19,'Final Test User 4','1234567890','Coimbatore, Tamil Nadu, India','Chennai, Tamil Nadu, India','SUV','2026-04-04','Pax: 1A, 0C | Luggage: 1 | Trip: One Way | ','Completed','2026-04-04 08:19:36',15000.00,'2026-04-04 08:20:49'),(20,'Final Test User 5','1234567890','Coimbatore','Madurai, Tamil Nadu, India','Innova Crysta','2026-04-21','Pax: 1A, 0C | Luggage: 1 | Trip: One Way | Early Morning Pickup','New','2026-04-04 08:25:55',NULL,'2026-04-04 08:25:55');
/*!40000 ALTER TABLE `inquiries` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-05 10:45:52
