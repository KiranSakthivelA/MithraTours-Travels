# KPS Travels: Deployment & Technical Handover Report

**Date:** April 7, 2026  
**Project:** KPS Travels Web Platform  
**Purpose:** Documentation of pre-deployment configuration, security hardening, and infrastructural setup to facilitate seamless onboarding for future developers.

---

## Executive Summary

This report outlines the final technical operations executed to transition the KPS Travels web application from a local development environment to a production-ready state on Hostinger. The primary objectives achieved include securing the application's API endpoints, resetting database architectures for clean production data, enforcing strict access controls on internal integrations, and migrating the domain resolution structure.

---

## 1. Database Configuration & State Reset

To ensure a seamless transition to legitimate traffic, all test data was purged from the systems. 

* **Environment Segregation:** The `api/config.php` utilizes environment detection (`$_SERVER['SERVER_NAME']`) to automatically toggle between the local XAMPP database (`root`) and the live Hostinger MySQL database (`u901549358_kpstravels_use`).
* **Data Sanitization:** A systematic reset was performed on both local and production environments. The `inquiries` and `feedbacks` tables were explicitly truncated (temporarily bypassing foreign key constraints) to guarantee that all auto-incrementing ID counters regress to exactly `1` for the first live user.
* **Resiliency:** The core database connection script was optimized to reduce timeout hangs, defaulting back to structured JSON error responses rather than fatal PHP crashes if a database disconnects.

## 2. API Security & CORS Hardening

Given the decoupled nature of the site's frontend and the PHP backend, protecting the endpoints from cross-site request forgery or unauthorized external usage was paramount.

* **Removal of Wildcard Access:** Previous configurations utilized open-access CORS policies (`Access-Control-Allow-Origin: *`). These were entirely removed across all functional API endpoints (`submit_inquiry.php`, `submit_feedback.php`, `get_inquiries.php`, `get_feedbacks.php`, `get_history.php`, `update_status.php`).
* **Origin Whitelisting:** A strict whitelist approach was implemented. The APIs now strictly validate the `HTTP_ORIGIN`. Valid requests are solely permitted from:
  1. Production: `https://www.kpstravelscbe.com`
  2. Production (Non-WWW): `https://kpstravelscbe.com`
  3. Safe Local Development: `http://localhost`, `http://127.0.0.1`
* **Response Handling:** Unauthorized automated requests or scraping tools hitting these endpoints directly will now immediately intercept a `403 Forbidden` response.

## 3. Automation Security (Google Sheets Integration)

The platform features an automated webhook capturing leads directly into a Google Spreadsheet via Google Apps Script. This required structural security patching.

* **Secret Token Handshake:** To prevent unauthorized entities from directly interacting with the Google Apps Script Web App URL and injecting fabricated leads into the client's spreadsheet, a secret token handshake was engineered. 
* **Implementation:** The `api/submit_inquiry.php` and `api/update_status.php` files now bundle a secure internal token (`KPS_SECURE_AUTH_8842`) within the JSON payload sent via cURL. The Google Apps Script explicitly validates this token, declining all external data that lacks the correct authorization key.

## 4. Domain & Infrastructure Migration

The final step involved mapping the independently hosted domain to the new application server.

* **Registrar & Hosting Discrepancy:** The domain (`kpstravelscbe.com`) is leased via RoutingRaja, while the hosting environment resides on Hostinger.
* **Nameserver Relegation:** Custom nameservers were established at the HostingRaja registrar level, routing traffic to Hostinger's DNS management cluster (`helios.dns-parking.com` & `aster.dns-parking.com`). 
* **Note on State:** A standard DNS propagation window of 2-24 hours is currently underway. Hostinger's standard "Domain isn't connected" alerts during this window have been accounted for and are anticipated behavior.

---

## 💡 Notes for Future Developers

If you are onboarding onto this project, please adhere to the following established paradigms:

1. **Deployments:** When pushing updates to the `api/` directory via FTP/File Manager, ensure that the CORS whitelist in the PHP files remains intact. Do not revert to wildcard (`*`) origins.
2. **Google Scripts:** If you need to modify the Google Sheet logic, the source code and instructions are archived locally in `google_script_instructions.txt`. Any modifications require you to redeploy the Web App in Google Workspace as a *"New Version"* to take effect.
3. **Database Schema:** If new functionality is required, rely on the `database.sql` and `reset_for_deploy.sql` files as the ground truth for schema dependencies. Ensure new endpoints inherit the central connection object and error handling wrappers from `config.php`.
