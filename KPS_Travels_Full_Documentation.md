# KPS Travels: Comprehensive Project & Handover Documentation

**Date:** April 7, 2026  
**Project:** KPS Travels Web Platform  
**Domain:** kpstravelscbe.com  
**Purpose:** A complete architectural overview, feature summary, and technical handover guide detailing the development cycle from initial concept to production deployment.

---

## 1. Executive Summary

This document serves as the official technical blueprint for the KPS Travels web platform. Built to modernize a local travel and cab service agency in Coimbatore, the project evolved from a basic static landing page into a fully-fledged, responsive web application featuring custom dynamic booking calculators, a secure PHP/MySQL backend, an administrative control panel, and real-time Google Sheets automation.

---

## 2. Frontend Architecture & UI/UX

The frontend was engineered with a strict adherence to modern, premium aesthetics without relying on heavy frameworks, ensuring maximum performance and SEO score.

* **Tech Stack:** Vanilla HTML5, CSS3, ES6 JavaScript.
* **Design Philosophy:** Implemented a modern, responsive "glassmorphism" aesthetic with vibrant gradients, custom typography, and fluid micro-animations to create a high-trust, premium user experience.
* **Core Pages:** 
  * `index.html` (Landing & Booking flow)
  * `services.html` (Offerings)
  * `routes.html` (Popular destinations)
  * `our-fleet.html` (Vehicle showcase)
  * `feedback.html` (User reviews)
* **Dynamic Booking Engine (`js/booking.js` & `js/main.js`):** Engineered a highly complex frontend booking calculator handling four distinct user flows:
  * *Local Trip:* Distance & hourly calculations.
  * *Outstation:* Multi-day logic.
  * *Drop / One-way:* Point A to Point B mapping.
  * *Round Trip:* Intricate day-calculation logic resolving edge-cases parsing "No. of Days".
* **Dual-Channel Lead Capture:** Forms simultaneously trigger a formatted WhatsApp deep-link generation for instant communication while pushing the payload to the backend database.

---

## 3. Backend API & Database (PHP/MySQL)

The backend handles central persistence and state management for the agency.

* **Database Engine (`database.sql`):** MySQL. Comprises two primary normalized tables:
  * `inquiries`: Stores comprehensive lead data (Pickups, Drops, Vehicle Types, Dates, Status, Price).
  * `feedbacks`: Stores user submitted 5-star rating metrics and review messages.
* **RESTful API Structure:** Hand-written PHP endpoints bypassing heavy ORMs for speed.
  * Submission: `submit_inquiry.php`, `submit_feedback.php`
  * Retrieval: `get_inquiries.php`, `get_feedbacks.php`, `get_history.php`
  * Updates: `update_status.php`
* **Security Implementations:**
  * **SQL Injection Prevention:** 100% utilization of parameterized queries (`mysqli_real_escape_string` and prepared statements).
  * **CORS Restriction:** Strict Origin enforcing. Endpoints reject all payloads outside of `kpstravelscbe.com` and `localhost`.

---

## 4. Administrative Dashboard

To allow KPS Travels staff to manage operations without direct database access, a bespoke admin portal was constructed.

* **Location:** `/admin/index.php`
* **Features:**
  * **Lead Pipeline:** Visual categorization of "New" vs. "Completed" inquiries.
  * **Status Toggling:** Staff can mark jobs as complete and attach final billed amounts (`price`), which instantly syncs to both the SQL database and the Google Webhook.
  * **Analytics:** Dashboard counters pulling realtime aggregate statistics from `get_inquiries.php`.

---

## 5. Third-Party Automations (Google Workspace)

To accommodate the client's operational preference for spreadsheet tracking, bridge middleware was built.

* **The Webhook:** A Google Apps Script (`google_script_instructions.txt`) operates as a secure Web App.
* **Data Flow:** When `submit_inquiry.php` or `update_status.php` fires locally on the server, a secondary asynchronous cURL request posts a JSON payload to Google.
* **Security Handshake:** To prevent span injections into the client's spreadsheet, the Google Script mandates a hardcoded `secret_token` (`KPS_SECURE_AUTH_8842`). Unauthorized POST requests are explicitly rejected.

---

## 6. Deployment & Infrastructure

The project utilizes a split-infrastructure model.

* **Domain Registrar:** HostingRaja (`kpstravelscbe.com`).
* **Hosting Environment:** Hostinger Shared/Cloud environment.
* **DNS Resolution:** Custom Nameservers (`helios.dns-parking.com` & `aster.dns-parking.com`) were implemented at the HostingRaja registrar level to point to the Hostinger instance.
* **Data Sanitization Checklist:** Prior to deployment, a comprehensive SQL truncation was performed on Hostinger's phpMyAdmin to reset all auto-increment IDs (`reset_for_deploy.sql`) guaranteeing true Day 1 analytics.

---

## 💡 Notes for Future Developers

If you are onboarding onto this project, please adhere to the following established paradigms:

1. **Local vs Live:** The `api/config.php` utilizes auto-environment detection. DO NOT hardcode database credentials. It will natively switch from `root` local environments to Hostinger user credentials automatically.
2. **API Modifications:** When pushing updates to the `api/` directory, ensure the CORS whitelist arrays remain intact.
3. **Google Script Edits:** If spreadsheet formats change, you must update the Apps Script via Google Workspace and redeploy as a *"New Version"*. Merely saving the script does not push the update live to the webhook URL.
4. **JavaScript Formatting:** The WhatsApp string generation inside `booking.js` is highly sensitive to whitespace and line-breaks (`%0A`). Alter with caution.
