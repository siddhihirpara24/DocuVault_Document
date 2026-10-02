# DocuVault — Personal Document Organizer Web Application

> **A Secure, Full-Stack Personal Document Management System built with React.js, Java Spring Boot 3, Spring Security, JWT, and MySQL.**
> Designed as a high-distinction MCA College Project, Viva Demo, and Professional Resume Project.

---

## 1. Project Overview

* **Project Title:** DocuVault — Personal Document Organizer
* **Architecture:** Decoupled Client-Server REST Architecture (React.js Frontend + Spring Boot Backend + MySQL Database + Local File Storage)
* **Target Audience:** Individuals seeking a centralized, privacy-first vault to store, categorize, search, preview, download, and manage sensitive personal and academic records (Degrees, Marksheets, Passports, Resumes, Tax Invoices, Utility Bills, Certificates, Medical Records).

---

## 2. Problem Statement

Individuals frequently misplace or struggle to organize essential physical and electronic documents such as diplomas, identity cards, career resumes, insurance policies, and tax receipts across scattered email threads, messaging apps, and local device folders. When urgent administrative, employment, or academic verification is required, retrieving the correct file version is often slow and cumbersome.

Furthermore, popular cloud storage drives lack automated taxonomy categorization, unified audit intelligence, strict role-based administration, and granular student-oriented file classification.

**DocuVault** addresses this problem by offering a dedicated, secure, and intuitive web application where users can upload, classify, search, preview, update, and download their personal documents while enforcing strict server-side ownership protection and role-based permissions.

---

## 3. Key Objectives

1. **Secure Storage & Metadata Decoupling:** Store document binary contents on a protected server filesystem (`uploads/`) with unique UUID-based identifiers, while persisting structured metadata (ownership, tags, sizes, categories, timestamps) in a relational MySQL database.
2. **Strict Document Ownership Protection:** Prevent Insecure Direct Object References (IDOR). A normal user cannot view, download, edit, or delete another user's documents even if they alter IDs in the request URL.
3. **Role-Based Access Control (RBAC):** Provide distinct operational panels for normal users (`ROLE_USER`) and administrators (`ROLE_ADMIN`).
4. **Rich User Experience:** Deliver modern React UI with real-time statistics, document preview (PDF and images), responsive layouts, and interactive analytical charts.
5. **Interview & Viva Readiness:** Maintain clean, modular, and standard layered architecture (Controller, Service, Repository, Entity, DTO, Security Filter) that is straightforward to explain during university evaluations.

---

## 4. Main Features

### 4.1 Authentication & Security Panel
* **User Registration:** Validates full name, email format, phone, password length, and password confirmation with instant client & server validation.
* **BCrypt Password Hashing:** Passwords are never stored as plain text. Every credential is encrypted using Spring Security's `BCryptPasswordEncoder`.
* **JWT Authentication:** Stateless JSON Web Token authentication using HMAC-SHA256 (`io.jsonwebtoken` jjwt 0.12.x).
* **Token-based Forgot & Reset Password:** Generates secure 32-character tokens with automatic expiration checks.

### 4.2 User Panel
* **Personal Dashboard:** Live counts for total documents and specific categories (Education, Identity, Career, Financial, Bills, Certificates, Medical, Other) + recent uploads table.
* **Document Upload:** Validates file formats (`.pdf`, `.jpg`, `.jpeg`, `.png`, `.doc`, `.docx`) and size limit (Max: 10 MB). Generates UUID-based unique physical filenames.
* **My Documents Repository:** Filterable, searchable table displaying document titles, categories, file formats, formatted sizes, and upload timestamps.
* **In-Browser Document Preview:** Embedded browser rendering for PDFs and image formats (`.png`, `.jpg`, `.jpeg`), with seamless fallback for Word documents.
* **Secure File Download:** Streams physical files from the protected server storage directly with the user's original filename.
* **Edit & File Replacement:** Edit title, category, and remarks, or safely upload a replacement file (the outdated file is automatically purged from disk).
* **Safe Deletion:** Deletes both the database metadata record and the physical file from the storage directory after modal confirmation.
* **Faceted Search & Filter:** Search by keyword, title, category taxonomy, and file extension.
* **Category Hub:** Category cards displaying live document counters with instant drill-down.
* **Profile & Password Management:** Update personal details and securely change login passwords with existing password verification.

### 4.3 Administrative Panel (`ROLE_ADMIN`)
* **Administrative Control Center:** Displays total registered accounts, active vs. inactive accounts, total vault records, today's uploads, and interactive Chart.js visualizations (bar chart by category and doughnut chart by file type).
* **User Supervision:** Inspect accounts, view all documents belonging to a particular user, toggle account status (Activate / Deactivate), and safely purge user accounts. Includes safety safeguards against self-deletion.
* **Global Document Audit:** Audit, filter, preview, download, or moderate documents uploaded across all users.
* **Category Taxonomy Management:** Create, edit, and delete categories. Automatically prohibits deleting categories that currently hold documents.
* **Analytics & Audit Reports:** Ingestion breakdown tables, browser print view, and instant CSV data export.

---

## 5. Technology Stack

### Frontend
| Technology | Description |
| :--- | :--- |
| **React.js (v19)** | Modern component-driven user interface |
| **Vite** | Next-generation frontend bundler and dev server |
| **JavaScript (ES6+)** | Frontend application logic |
| **Bootstrap 5 (5.3.3)** | Responsive grid, cards, modals, and layout system |
| **Bootstrap Icons** | Visual icon iconography |
| **Axios** | Centralized REST client with Bearer token interceptor |
| **React Router DOM (v7)** | Client-side routing and guarded route navigation |
| **Chart.js & react-chartjs-2** | Interactive metrics and analytics charts |

### Backend
| Technology | Description |
| :--- | :--- |
| **Java 21 / 17** | Modern Java LTS runtime |
| **Spring Boot 3.3.4** | Enterprise REST API and application framework |
| **Spring Web / MVC** | RESTful endpoint controllers and multipart request handling |
| **Spring Data JPA & Hibernate** | Object-Relational Mapping (ORM) and data repositories |
| **Spring Security 6** | RBAC, authentication filters, and method security |
| **JJWT (0.12.6)** | JWT token generation, parsing, and cryptographic verification |
| **Jakarta Bean Validation** | Declarative DTO validation (`@NotBlank`, `@Email`, `@Size`) |
| **Maven** | Build management and dependency resolution |

### Database & Storage
| Component | Description |
| :--- | :--- |
| **MySQL 8.0** | Relational database (`personal_document_organizer`) |
| **MySQL Connector/J** | JDBC database driver |
| **Server Filesystem (`uploads/`)** | Secure disk storage for actual uploaded document binaries |

---

## 6. System Architecture

```text
                           +-------------------------------------+
                           |       React.js Frontend (Vite)      |
                           |   (Port 5173 / Port 3000)           |
                           +-------------------------------------+
                                              |
                                              |  HTTP REST / Multipart
                                              |  Authorization: Bearer <JWT>
                                              v
                           +-------------------------------------+
                           |      Spring Boot 3.3.4 Backend      |
                           |      (Port 8085)                    |
                           +-------------------------------------+
                                              |
                  +---------------------------+---------------------------+
                  |                                                       |
                  v                                                       v
     +--------------------------+                           +--------------------------+
     |   Spring Security + JWT  |                           |  File Storage Service    |
     |   - JwtAuthFilter        |                           |  - UUID Filename Gen     |
     |   - Ownership Check      |                           |  - MIME & Ext Check      |
     |   - BCrypt Hashing       |                           |  - Directory Traversal   |
     +--------------------------+                           +--------------------------+
                  |                                                       |
                  v                                                       v
     +--------------------------+                           +--------------------------+
     |  Spring Data JPA / ORM   |                           |    Server Disk Storage   |
     +--------------------------+                           |       (uploads/)         |
                  |                                         +--------------------------+
                  v
     +--------------------------+
     |      MySQL Database      |
     | personal_document_       |
     |       organizer          |
     +--------------------------+
```

---

## 7. Database Design & Schema

The application uses 4 core relational tables:

### 1. `users`
* `id` (BIGINT, Primary Key, Auto Increment)
* `full_name` (VARCHAR(100), NOT NULL)
* `email` (VARCHAR(120), UNIQUE, NOT NULL)
* `phone` (VARCHAR(20), NULL)
* `password` (VARCHAR(255), NOT NULL) — *BCrypt Hashed*
* `role` (VARCHAR(20), NOT NULL) — `ROLE_USER`, `ROLE_ADMIN`
* `status` (VARCHAR(20), NOT NULL) — `ACTIVE`, `INACTIVE`
* `created_at` (DATETIME, NOT NULL)
* `updated_at` (DATETIME, NULL)

### 2. `categories`
* `id` (BIGINT, Primary Key, Auto Increment)
* `name` (VARCHAR(100), UNIQUE, NOT NULL)
* `description` (TEXT, NULL)
* `created_at` (DATETIME, NOT NULL)

### 3. `documents`
* `id` (BIGINT, Primary Key, Auto Increment)
* `user_id` (BIGINT, Foreign Key -> `users.id`, ON DELETE CASCADE)
* `category_id` (BIGINT, Foreign Key -> `categories.id`, ON DELETE SET NULL)
* `document_name` (VARCHAR(200), NOT NULL)
* `description` (TEXT, NULL)
* `original_filename` (VARCHAR(255), NOT NULL)
* `stored_filename` (VARCHAR(255), UNIQUE, NOT NULL)
* `file_path` (VARCHAR(500), NOT NULL)
* `file_type` (VARCHAR(50), NOT NULL)
* `file_size` (BIGINT, NOT NULL)
* `upload_date` (DATETIME, NOT NULL)
* `updated_at` (DATETIME, NULL)

### 4. `password_reset_tokens`
* `id` (BIGINT, Primary Key, Auto Increment)
* `user_id` (BIGINT, Foreign Key -> `users.id`, ON DELETE CASCADE)
* `token` (VARCHAR(100), UNIQUE, NOT NULL)
* `expires_at` (DATETIME, NOT NULL)
* `created_at` (DATETIME, NOT NULL)

---

## 8. Default Credentials for Evaluation & Testing

The application seeds default accounts and categories automatically on initial startup:

| Account Type | Email | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@gmail.com` | `Admin@123` | Full Admin Console (`/admin/**`) |

> *Note: Users can register their personal vault accounts directly via the Registration page (`/register`).*

---

## 9. Prerequisites & Installation

### System Requirements
* **Java:** JDK 17 or JDK 21 (Tested on Java 21)
* **Maven:** 3.8+ (or 3.9+)
* **Node.js:** v18+ (Tested on v24)
* **NPM:** v9+
* **MySQL:** 8.0+

---

## 10. How to Setup & Run

### Step 1: MySQL Database Setup
Open MySQL Workbench, MySQL Shell, or command line, and create the database:

```sql
CREATE DATABASE IF NOT EXISTS personal_document_organizer;
```

If you wish to configure or verify your MySQL credentials, configure them in `backend/src/main/resources/application.properties` or set environment variables:
```bash
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password
```

### Step 2: Run the Spring Boot Backend
Open a terminal in the project directory:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on:
```text
http://localhost:8085
```
On startup:
* Hibernate will automatically create the tables in MySQL.
* `DataInitializer` will automatically seed the 8 default categories and the default administrator user (`admin@gmail.com` / `Admin@123`).

### Step 3: Run the React Frontend
Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

The frontend application will start on:
```text
http://localhost:5173
```
Open `http://localhost:5173` in your web browser.

---

## 11. REST API Specification

### 11.1 Authentication Endpoints (`/api/auth`)
* `POST /api/auth/register` — Register a new user account.
* `POST /api/auth/login` — Authenticate credentials and receive JWT token.
* `POST /api/auth/forgot-password` — Generate a password reset token.
* `POST /api/auth/reset-password` — Reset account password using token.

### 11.2 User Endpoints (`/api/users` & `/api/user`)
* `GET /api/users/profile` — Fetch logged-in user details.
* `PUT /api/users/profile` — Update name and phone number.
* `PUT /api/users/change-password` — Change password with current password verification.
* `GET /api/user/dashboard` — Fetch dashboard counts and recent documents.

### 11.3 Document Endpoints (`/api/documents`)
* `GET /api/documents` — List all documents belonging to the authenticated user.
* `POST /api/documents` — Upload new document (`multipart/form-data`).
* `GET /api/documents/{id}` — Fetch document metadata (Ownership verified).
* `GET /api/documents/{id}/download` — Securely stream binary file for download.
* `GET /api/documents/{id}/preview` — Stream binary with inline content-type for preview.
* `PUT /api/documents/{id}` — Update metadata or replace physical file.
* `DELETE /api/documents/{id}` — Purge document metadata and disk file.
* `GET /api/documents/search` — Search documents by keyword, category, and file format.

### 11.4 Category Endpoints (`/api/categories`)
* `GET /api/categories` — List all categories with document counters.
* `GET /api/categories/{id}` — Fetch category by ID.
* `GET /api/categories/{id}/documents` — List user's documents in specified category.

### 11.5 Admin Endpoints (`/api/admin`) *(Requires `ROLE_ADMIN`)*
* `GET /api/admin/dashboard` — Global KPI metrics and recent activity.
* `GET /api/admin/users` — List all system users with file counts.
* `GET /api/admin/users/{id}` — Inspect specific user details.
* `PUT /api/admin/users/{id}/activate` — Activate user account.
* `PUT /api/admin/users/{id}/deactivate` — Deactivate user account.
* `DELETE /api/admin/users/{id}` — Delete user account and purge their files.
* `GET /api/admin/documents` — Audit all documents with filters.
* `GET /api/admin/documents/{id}` — Inspect any document.
* `GET /api/admin/documents/{id}/download` — Download any document as admin.
* `DELETE /api/admin/documents/{id}` — Moderate and delete any document.
* `GET /api/admin/categories` — Manage taxonomies.
* `POST /api/admin/categories` — Create category.
* `PUT /api/admin/categories/{id}` — Update category.
* `DELETE /api/admin/categories/{id}` — Delete category (rejects if contains files).
* `GET /api/admin/reports` — Generate comprehensive intelligence report.

---

## 12. Security Features Implemented

1. **Password Encryption:** Passwords are never stored as plain text. The system uses standard BCrypt with salt rounds.
2. **Stateless JWT Tokens:** Authorization headers are validated via `JwtAuthenticationFilter` on every request.
3. **Strict Document Ownership Enforcement:** In `DocumentService`, every read, preview, download, update, and delete request verifies:
   ```java
   if (!isAdmin && !document.getUser().getId().equals(currentUserId)) {
       throw new UnauthorizedException("Access denied: You do not own this document.");
   }
   ```
4. **File Upload Security:**
   * Validates file extensions (`pdf`, `jpg`, `jpeg`, `png`, `doc`, `docx`).
   * Validates file size (strictly enforces 10 MB limit).
   * Generates secure unique UUID filenames (`UUID.randomUUID() + "-" + cleanOriginalFilename`).
   * Prevents path traversal vulnerabilities (`..` check).
   * Files are stored outside public web roots in `uploads/` and streamed only through authenticated controller endpoints.
5. **Role-Based Authorization:** Spring Security blocks normal users from accessing `/api/admin/**` endpoints with HTTP 403 Forbidden.
6. **SQL Injection Protection:** Queries use Spring Data JPA parameter binding.
7. **Cross-Origin Resource Sharing (CORS):** Strict CORS bean permitting only verified frontend origins.

---

## 13. Project Structure

```text
DocuVault_Spring/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/example/documentorganizer/
│   │   │   │   ├── config/             # SecurityConfig, CorsConfig
│   │   │   │   ├── controller/         # Auth, User, Document, Category, Admin, Report
│   │   │   │   ├── dto/                # Request & Response DTOs
│   │   │   │   ├── entity/             # User, Category, Document, PasswordResetToken, Enums
│   │   │   │   ├── exception/          # GlobalExceptionHandler, Custom Exceptions
│   │   │   │   ├── initializer/        # DataInitializer (Seed Data)
│   │   │   │   ├── repository/         # Spring Data JPA Repositories
│   │   │   │   ├── security/           # JwtService, JwtAuthFilter, UserPrincipal
│   │   │   │   ├── service/            # Core business logic services
│   │   │   │   └── DocumentOrganizerApplication.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/                       # Comprehensive JUnit 5 Test Suite
│   ├── uploads/                        # Physical file repository
│   └── pom.xml                         # Maven dependencies & plugins
│
├── frontend/
│   ├── src/
│   │   ├── components/                 # Navbar, Sidebar, Layout, Modal, ProtectedRoute
│   │   ├── context/                    # AuthContext
│   │   ├── pages/
│   │   │   ├── auth/                   # Login, Register, ForgotPassword, ResetPassword
│   │   │   ├── user/                   # Dashboard, Documents, Upload, Edit, View, Search, Profile
│   │   │   ├── admin/                  # Dashboard, Users, Documents, Categories, Reports
│   │   │   └── error/                  # 404 NotFound, 403 Forbidden
│   │   ├── routes/                     # AppRoutes
│   │   ├── services/                   # api.js, authService, documentService, etc.
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                   # Custom modern styling
│   ├── package.json
│   └── vite.config.js
│
├── .env.example                        # Template environment configurations
└── README.md                           # Master Project Documentation
```

---

## 14. Testing Instructions

To run the automated backend test suite:

```bash
cd backend
mvn test
```

Expected result:
```text
[INFO] Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Tests cover:
1. **User Registration & Duplicate Validation:** Verifies user creation and duplicate email rejection.
2. **JWT Authentication & Bad Credentials:** Verifies token generation on valid credentials and 401 on bad passwords.
3. **Document Ownership Protection:** Confirms that User B cannot view, download, or delete User A's documents.
4. **Role-Based Access Control:** Confirms normal users are rejected with 403 Forbidden when calling admin endpoints.
5. **File Upload Security Validation:** Confirms unpermitted file formats (`.exe`) are rejected with validation errors.

---

## 15. Viva & Interview Questions & Answers

### Q1: Why decouple the storage of the physical file and its metadata?
**A:** Storing large files directly in relational database tables as `BLOB` causes heavy memory bloat, degrades database backup/restore performance, and exhausts database connection pools. Decoupling allows MySQL to quickly index and search lightweight metadata, while the operating system filesystem handles high-speed file streaming via buffered I/O.

### Q2: How does DocuVault prevent Insecure Direct Object References (IDOR)?
**A:** Even though documents have public IDs (e.g., `/api/documents/42`), the Spring Boot `DocumentService` extracts the authenticated user's ID directly from the validated JWT token in `SecurityContextHolder`. It checks `document.getUser().getId().equals(currentUser.getId())`. If the user does not own the document and is not an administrator, an `UnauthorizedException` is thrown before any file or metadata is exposed.

### Q3: Why use JWT instead of standard HTTP session cookies?
**A:** JWT is stateless. The backend server does not need to allocate in-memory session objects for each connected user. The signed token carries user claims and can be validated cryptographically on any request, making the application cloud-ready and decoupled from the React single-page frontend.

---

## 16. Future Enhancements

* Integration with Cloud Storage (AWS S3 / Google Cloud Storage / Azure Blob Storage).
* Automatic Document Expiry Reminders (e.g., Driver's License or Passport renewal notifications).
* OCR (Optical Character Recognition) using Tesseract for extracting text from scanned receipts.
* AI-based Document Classification using Gemini / OpenAI API.
* Two-Factor Authentication (2FA / OTP via SMS or Authenticator App).

---

## 17. License & Credits

Developed as an Academic MCA Project.  
Built with clean engineering standards by **Siddhi Hirpara**.
