# Contingent Workforce & Timesheet Tracker - Backend API

Production-quality Spring Boot REST API backend for managing contract workers supplied by external vendors, automated timesheet calculation, milestone tracking, billing computation, invoice validation, immutable approval workflows, rule-based vendor performance scoring, and real-time dashboard analytics.

---

## 🚀 Key Features

1. **Vendor & Contractor Management**: Complete lifecycle tracking of external vendor organizations, contractor rate cards, and user profile associations.
2. **Project & Team Assignments**: Dynamic allocation of contractors to client projects with budget tracking and role assignments.
3. **Automated Working-Hour Calculation**:
   - Backend calculates `totalHours = endTime - startTime - breakHours`.
   - Strict validation preventing negative hours, inverted start/end times, excessive break intervals, and duplicate daily entries per contractor/project.
4. **Milestone Management & Automated Completion**:
   - Milestones automatically transition to `COMPLETED` when `completionPercentage == 100`.
   - Requires explicit manager sign-off before being eligible for invoice billing.
5. **Billing Calculation Engine**:
   - Contractor timesheet billing: `sum(approvedHours × hourlyRate)`.
   - Milestone billing: `sum(billingAmount)` for approved completed milestones.
   - Total billing: Timesheet billing + Milestone billing using exact `BigDecimal` arithmetic.
6. **Backend Invoice Validation & Discrepancy Detection**:
   - Backend validates claimed vendor invoice totals against calculated billable hours and milestones.
   - Computes `differenceAmount = |claimedAmount - backendCalculatedAmount|`.
   - Automatically flags discrepancies and notifies project managers with discrepancy alerts.
7. **Immutable Approval Workflows & Audit Trail**:
   - Comprehensive audit logging for Timesheets, Milestones, and Invoices.
   - Status transitions strictly enforced on the backend (e.g., `DRAFT` → `SUBMITTED` → `UNDER_REVIEW` → `APPROVED`/`REJECTED` → `PAID`).
8. **Automated In-App Notifications**:
   - Triggered upon timesheet submission, approval, rejection, milestone completion, invoice mismatch alerts, and invoice payment settlements.
9. **Rule-Based Vendor Performance Scoring (0 - 100)**:
   - Evaluates timesheet accuracy (30 pts), invoice accuracy (30 pts), milestone completion rate (20 pts), and SLA/operational reliability (20 pts).
   - Generates letter grades (`A+`, `A`, `B`, `C`, `D`).
10. **Rich Dashboard & Reports APIs**:
    - Real-time aggregated KPIs for React frontend (monthly billing charts, contractor hours breakdown, invoice status pie charts, vendor leaderboard, and recent activity feeds).
11. **Security & RBAC (Role-Based Access Control)**:
    - Stateless JWT authentication filter with roles: `ADMIN`, `MANAGER`, `VENDOR`, and `CONTRACTOR`.
    - Passwords securely hashed with `BCryptPasswordEncoder`.

---

## 🛠️ Tech Stack

* **Language**: Java 21 LTS
* **Framework**: Spring Boot 3.3.4 (Spring Web, Spring Data JPA, Spring Security, Jakarta Validation)
* **Authentication**: JWT (JSON Web Tokens via JJWT `0.12.6`)
* **Database**: PostgreSQL (Hosted on Supabase)
* **ORM**: Hibernate (PostgreSQL Dialect)
* **API Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI
* **Build Tool**: Maven 3.9+
* **Boilerplate**: Lombok

---

## 📁 Project Structure

```
c:\Users\Keert\CWT\
├── pom.xml
├── .env.example
├── README.md
└── src/
    ├── main/
    │   ├── java/
    │   │   └── com/
    │   │       └── contingentworkforce/
    │   │           ├── ContingentWorkforceApplication.java
    │   │           ├── config/
    │   │           │   ├── JacksonConfig.java
    │   │           │   └── OpenApiConfig.java
    │   │           ├── controller/
    │   │           │   ├── AuthController.java
    │   │           │   ├── VendorController.java
    │   │           │   ├── ContractorController.java
    │   │           │   ├── ProjectController.java
    │   │           │   ├── TimesheetController.java
    │   │           │   ├── MilestoneController.java
    │   │           │   ├── InvoiceController.java
    │   │           │   ├── ApprovalController.java
    │   │           │   ├── NotificationController.java
    │   │           │   └── ReportController.java
    │   │           ├── dto/
    │   │           │   ├── common/ (ApiResponse, PageResponse)
    │   │           │   ├── auth/ (LoginRequest, RegisterRequest, AuthResponse, UserResponse)
    │   │           │   ├── vendor/ (VendorRequest, VendorResponse)
    │   │           │   ├── contractor/ (ContractorRequest, ContractorResponse)
    │   │           │   ├── project/ (ProjectRequest, ProjectResponse, ProjectMemberRequest, ProjectMemberResponse)
    │   │           │   ├── timesheet/ (TimesheetRequest, TimesheetResponse, TimesheetRejectRequest)
    │   │           │   ├── milestone/ (MilestoneRequest, MilestoneResponse)
    │   │           │   ├── invoice/ (InvoiceRequest, InvoiceResponse, InvoiceItemResponse, InvoiceRejectRequest)
    │   │           │   ├── approval/ (ApprovalResponse)
    │   │           │   ├── notification/ (NotificationResponse)
    │   │           │   └── report/ (DashboardResponse, MonthlyBillingDTO, ContractorHoursDTO, InvoiceStatusDTO, VendorPerformanceDTO, RecentActivityDTO, BillingReportResponse)
    │   │           ├── entity/
    │   │           │   ├── User.java, Vendor.java, Contractor.java, Project.java, ProjectMember.java
    │   │           │   ├── Timesheet.java, Milestone.java, Invoice.java, InvoiceItem.java
    │   │           │   └── Approval.java, Notification.java
    │   │           ├── enums/ (Role, UserStatus, VendorStatus, ContractorStatus, ProjectStatus, MemberStatus, TimesheetStatus, MilestoneStatus, InvoiceStatus, InvoiceItemType, EntityType, ApprovalStatus, NotificationType)
    │   │           ├── exception/ (GlobalExceptionHandler, ResourceNotFoundException, BadRequestException, UnauthorizedException, AccessDeniedException, DuplicateResourceException, InvalidStateTransitionException)
    │   │           ├── repository/ (UserRepository, VendorRepository, ContractorRepository, ProjectRepository, TimesheetRepository, MilestoneRepository, InvoiceRepository, etc.)
    │   │           ├── security/ (JwtService, JwtAuthenticationFilter, JwtAuthenticationEntryPoint, SecurityConfig, SecurityUtils, CustomUserDetails, CustomUserDetailsService)
    │   │           └── service/ & service/impl/ (AuthService, VendorService, ContractorService, ProjectService, TimesheetService, MilestoneService, BillingCalculationService, InvoiceService, ApprovalService, NotificationService, VendorPerformanceService, ReportService)
    │   └── resources/
    │       ├── application.yml
    │       └── db/
    │           ├── schema.sql
    │           └── data.sql
    └── test/
        ├── java/com/contingentworkforce/
        │   ├── AuthServiceTests.java
        │   ├── BillingCalculationTests.java
        │   ├── ContingentWorkforceApplicationTests.java
        │   ├── InvoiceValidationTests.java
        │   ├── TimesheetCalculationTests.java
        │   └── VendorPerformanceServiceTests.java
        └── resources/
            └── application-test.yml
```

---

## ⚙️ Environment Configuration

Create a `.env` file or export the environment variables as shown in `.env.example`:

| Environment Variable | Description | Default Value |
|---|---|---|
| `SUPABASE_DB_URL` | Supabase PostgreSQL JDBC Connection URL | `jdbc:postgresql://localhost:5432/postgres` |
| `SUPABASE_DB_USERNAME` | Supabase Database Username | `postgres` |
| `SUPABASE_DB_PASSWORD` | Supabase Database Password | `postgres` |
| `PORT` | Application Port | `8080` |
| `JWT_SECRET` | Secret key for signing JWT tokens | `404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970` |
| `JWT_EXPIRATION_MS` | JWT Expiration in milliseconds | `86400000` (24 Hours) |
| `FRONTEND_URL` | Allowed Origins for CORS | `http://localhost:5173,http://localhost:3000` |
| `SQL_INIT_MODE` | SQL Initialization (`always` or `never`) | `never` |

---

## 👥 Demo Accounts

The database seed (`data.sql`) pre-configures 4 demo users for testing:

| Email | Password | Role | Description |
|---|---|---|---|
| `admin@example.com` | `Password123!` | `ADMIN` | Global Administrator with complete access |
| `manager@example.com` | `Password123!` | `MANAGER` | Project Manager who approves timesheets, milestones, and invoices |
| `vendor@example.com` | `Password123!` | `VENDOR` | Vendor organization administrator (Apex Global Technologies) |
| `contractor@example.com` | `Password123!` | `CONTRACTOR` | Senior Full Stack Engineer (Hourly Rate: ₹650/hr) |
| `contractor2@example.com` | `Password123!` | `CONTRACTOR` | Cloud DevOps Architect (Hourly Rate: ₹850/hr) |

---

## 🏃 Running the Application

### Option 1: Running with Maven
```bash
# 1. Compile and execute test suite
mvn clean test

# 2. Start the Spring Boot application
mvn spring-boot:run
```

### Option 2: Running with IntelliJ IDEA
1. Open the project root directory in IntelliJ IDEA.
2. Ensure Project SDK is set to **Java 21**.
3. Locate `src/main/java/com/contingentworkforce/ContingentWorkforceApplication.java`.
4. Right-click and choose **Run 'ContingentWorkforceApplication'**.

### Option 3: Packaging as Executable JAR
```bash
mvn clean package -DskipTests=false
java -jar target/contingent-workforce-tracker-1.0.0.jar
```

---

## 📖 Swagger API Documentation

When the application is running, navigate to:
* **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
* **OpenAPI 3.0 JSON Spec**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

Click the **Authorize** button in Swagger UI and enter your JWT token (`Bearer <token>`) obtained from `/api/auth/login`.

---

## 🔌 REST API Endpoints Catalogue

### 1. Authentication (`/api/auth`)
* `POST /api/auth/login` - Authenticate user & receive JWT token
* `POST /api/auth/register` - Register a new user
* `GET /api/auth/me` - Get profile of currently authenticated user

### 2. Vendors (`/api/vendors`)
* `GET /api/vendors` - Paginated vendor list with `search` & `status` filters
* `GET /api/vendors/{id}` - Get vendor details
* `POST /api/vendors` - Create vendor company (`ADMIN`, `MANAGER`)
* `PUT /api/vendors/{id}` - Update vendor profile
* `DELETE /api/vendors/{id}` - Delete vendor (`ADMIN` only)

### 3. Contractors (`/api/contractors`)
* `GET /api/contractors` - List contractors with `vendorId`, `status`, `search` filters
* `GET /api/contractors/{id}` - Get contractor details
* `POST /api/contractors` - Link user to vendor with job role and hourly rate
* `PUT /api/contractors/{id}` - Update contractor profile / rates
* `DELETE /api/contractors/{id}` - Delete contractor profile

### 4. Projects (`/api/projects`)
* `GET /api/projects` - List projects with `vendorId`, `managerId`, `status`, `search`
* `GET /api/projects/my-projects` - Get projects accessible to current user's role
* `GET /api/projects/{id}` - Get project details
* `POST /api/projects` - Create project with budget & manager assignment
* `PUT /api/projects/{id}` - Update project
* `DELETE /api/projects/{id}` - Delete project
* `POST /api/projects/{id}/members` - Assign contractor to project
* `GET /api/projects/{id}/members` - List contractors assigned to project
* `DELETE /api/projects/{id}/members/{contractorId}` - Remove contractor from project

### 5. Timesheets (`/api/timesheets`)
* `GET /api/timesheets` - Paginated timesheets with contractor, project, date, and status filters
* `GET /api/timesheets/{id}` - Get timesheet details
* `POST /api/timesheets` - Create timesheet (Backend calculates `totalHours`)
* `PUT /api/timesheets/{id}` - Edit timesheet (Allowed if `DRAFT` or `REJECTED`)
* `POST /api/timesheets/{id}/submit` - Contractor submits timesheet for review
* `POST /api/timesheets/{id}/approve` - Manager approves timesheet
* `POST /api/timesheets/{id}/reject` - Manager rejects timesheet with reason
* `DELETE /api/timesheets/{id}` - Delete draft timesheet

### 6. Milestones (`/api/milestones`)
* `GET /api/milestones` - List milestones with project and status filters
* `GET /api/milestones/{id}` - Get milestone details
* `POST /api/milestones` - Create milestone (Auto-completes if completion is 100%)
* `PUT /api/milestones/{id}` - Update milestone completion progress
* `POST /api/milestones/{id}/approve` - Manager signs off completed milestone for billing
* `DELETE /api/milestones/{id}` - Delete milestone

### 7. Invoices (`/api/invoices`)
* `GET /api/invoices` - List invoices with vendor, project, status, and date range filters
* `GET /api/invoices/{id}` - Get invoice details and line items
* `POST /api/invoices` - Vendor creates invoice draft
* `PUT /api/invoices/{id}` - Update invoice draft
* `POST /api/invoices/{id}/submit` - Submit invoice (Backend performs automatic validation against approved timesheets & milestones, calculates `differenceAmount`, and moves to `UNDER_REVIEW`)
* `POST /api/invoices/{id}/approve` - Manager approves verified invoice
* `POST /api/invoices/{id}/reject` - Manager rejects invoice with comments
* `POST /api/invoices/{id}/mark-paid` - Mark approved invoice as `PAID`
* `DELETE /api/invoices/{id}` - Delete draft invoice

### 8. Approvals & Audit History (`/api/approvals`)
* `GET /api/approvals` - View immutable audit trail of all approvals & rejections
* `GET /api/approvals/pending` - View pending approvals
* `GET /api/approvals/entity/{entityType}/{entityId}` - View history for a specific entity

### 9. Notifications (`/api/notifications`)
* `GET /api/notifications` - Get paginated in-app notifications
* `PUT /api/notifications/{id}/read` - Mark notification as read
* `PUT /api/notifications/read-all` - Mark all notifications as read
* `GET /api/notifications/unread-count` - Get count of unread notifications

### 10. Reports & Analytics (`/api/reports`)
* `GET /api/reports/dashboard` - Complete dashboard metrics for frontend charts (KPIs, monthly billing, contractor hours, invoice status distribution, vendor performance, recent activities)
* `GET /api/reports/billing` - Consolidated billing summary by vendor, project, and period
* `GET /api/reports/vendor-performance` - Rule-based vendor performance ranking (0-100 scores and letter grades)
* `GET /api/reports/contractor-hours` - Matrix of approved vs pending contractor hours and billings

---

## 🔄 End-to-End Workflow Demonstration

1. **Vendor & Contractor Setup**: Admin/Manager registers Vendor ("Apex Global Technologies") and links Contractor ("John Contractor") with an hourly rate of ₹650/hr.
2. **Project Allocation**: Project Manager creates project ("Enterprise Cloud Migration") and assigns John Contractor to the team.
3. **Timesheet Submission**: John Contractor logs hours from `09:00` to `18:00` with `1.00` hr break. Backend calculates exactly `8.00` total hours. John submits the timesheet.
4. **Manager Approval**: Michael Manager reviews and approves the timesheet. An audit record is created and John receives an approval notification.
5. **Milestone Completion**: The project team achieves 100% completion on "Cloud Architecture Blueprint" (₹45,000). The manager approves the milestone.
6. **Invoice Submission & Backend Validation**:
   - Vendor submits invoice with claimed amount ₹97,500 + ₹45,000 + tax = ₹168,150.
   - Backend queries all `APPROVED` timesheets and `APPROVED` milestones for the period.
   - Backend verifies calculations. If matching, `differenceAmount = 0.00`. If vendor entered an inflated figure, backend flags the exact discrepancy and sends an alert notification to the manager.
7. **Manager Review & Settlement**: Manager approves the validated invoice and marks it as `PAID`.

---

## 🧪 Testing

Execute automated unit and integration tests covering calculation formulas, edge cases, and state transitions:

```bash
mvn clean test
```

Test coverage includes:
- `TimesheetCalculationTests`: Accurate hour deduction, fractional break handling, negative duration validation.
- `BillingCalculationTests`: Approved hours × rates, milestone aggregation, exclusion of draft/rejected records.
- `InvoiceValidationTests`: Exact matching validation, discrepancy detection, and state transition to `UNDER_REVIEW`.
- `VendorPerformanceServiceTests`: Algorithmic scoring (0-100) and letter grade evaluation.
- `AuthServiceTests`: Password hashing, registration duplicate checks, and JWT token issuance.
