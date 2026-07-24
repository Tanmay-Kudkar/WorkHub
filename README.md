<h1 align="center">🏢 WorkHub Employee Management System</h1>

<p align="center">
  A production-ready, full-stack enterprise workforce management platform. Built with a modern React 18 frontend and a robust Spring Boot 3 Java backend, WorkHub features multi-tier role-based access control, Google OAuth 2.0 integration, real-time department and job title lookups, dynamic database scheme conversion, and an enterprise cloud cold-start resilience layer.
</p>

## Tech Stack Used

<table align="center">
  <tr>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" alt="React" width="90" height="90" /><br />
      <strong>React 18.2.0</strong>
    </td>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" alt="Vite" width="90" height="90" /><br />
      <strong>Vite 5.4.21</strong>
    </td>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg" alt="Java 17" width="90" height="90" /><br />
      <strong>Java OpenJDK 17</strong>
    </td>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/spring/spring-original.svg" alt="Spring Boot" width="90" height="90" /><br />
      <strong>Spring Boot 3.3.3</strong>
    </td>
  </tr>
  <tr>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" alt="PostgreSQL" width="90" height="90" /><br />
      <strong>PostgreSQL 15+</strong>
    </td>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google OAuth 2.0" width="90" height="90" /><br />
      <strong>Google OAuth 2.0</strong>
    </td>
    <td align="center" width="130">
      <img src="https://skillicons.dev/icons?i=css" alt="Vanilla CSS Design System" width="90" height="90" /><br />
      <strong>Glassmorphism CSS3</strong>
    </td>
    <td align="center" width="130">
      <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" alt="Docker & Compose" width="90" height="90" /><br />
      <strong>Docker Compose v2</strong>
    </td>
  </tr>
</table>

## Documentation Index

- [1. Executive Summary](#1-executive-summary)
- [2. Product Scope and Capabilities](#2-product-scope-and-capabilities)
- [3. Architecture and System Design](#3-architecture-and-system-design)
- [4. Technology Stack and Versions](#4-technology-stack-and-versions)
- [5. Domain Model and Data Schema](#5-domain-model-and-data-schema)
- [6. Real-World Use Cases](#6-real-world-use-cases)
- [7. Core Problems Solved](#7-core-problems-solved)
- [8. API Reference & Endpoints](#8-api-reference--endpoints)
- [9. Cloud Deployment & Render Wakeup UI](#9-cloud-deployment--render-wakeup-ui)
- [10. Local Development Setup](#10-local-development-setup)
- [11. Repository Layout](#11-repository-layout)

---

## 1. Executive Summary

**Project Aim**: To construct an enterprise-grade Employee Management System (WorkHub) that bridges modern frontend UX with resilient cloud backend infrastructure. WorkHub simplifies HR workflows, employee profile administration, role-based security (ADMIN/USER), department lookups, and salary tracking while seamlessly handling cloud cold starts (such as Render.com free-tier spin-downs) with zero data loss or user disruption.

### At a Glance

| Item | Value |
|---|---|
| Frontend Client | React 18 + Vite 5 + Glassmorphism CSS (`frontend/`) |
| Backend API | Spring Boot 3.3.3 + Java 17 + Spring Data JPA (`backend/`) |
| Connection Pool | HikariCP (optimized for cloud connection limits) |
| Database | PostgreSQL 15+ |
| Authentication | Native Password Hashing (BCrypt) + Google OAuth 2.0 |
| Architecture | Decoupled REST Architecture (Vercel Frontend + Render Backend) |

---

## 2. Product Scope and Capabilities

WorkHub serves **HR Administrators**, **Engineering Leads**, and **Team Members** needing a fast, secure, and intuitive workforce dashboard.

### 🌟 Key Codebase Features
- **Role-Based Access Control (RBAC)**: Enforces `ADMIN` and `USER` permissions across view, edit, search, and delete endpoints.
- **Cloud Cold-Start Resilience Layer**: Full-screen glassmorphism overlay with a non-looping 0–100% linear fluid progress bar, 500ms `/api/health` polling, request queueing, and vector verification mark animation.
- **Dynamic Database Scheme Converter**: Custom Spring `@Configuration` (`DatabaseConfig.java`) that automatically converts `postgres://` or `postgresql://` environment URLs into valid JDBC strings, strips inline `user:password@` from host strings to prevent JDBC driver port parsing errors, and populates HikariCP credentials.
- **Google OAuth 2.0 Integration**: Native Google Sign-In with ID Token validation, OAuth state management, and strict database duplicate email checks to prevent account collisions.
- **Universal Body Scroll Locking**: Custom React hook (`useLockBodyScroll`) that locks background scrolling on all active modals (`ServerWakeupScreen`, `EmployeeDetailModal`, `AccessDeniedModal`, `ConfirmDialog`, `InfoModal`, `AuthPanel`).
- **Comprehensive Employee Operations**: Full CRUD management with search, department/job title filtering, active status toggles, salary & currency tracking, and profile image support.

#### 🔍 Deep-Dive: Cloud Cold-Start Initialization Overlay
- **Problem Statement**: Cloud container instances on free-tier platforms spin down after periods of inactivity. Initial inbound requests take 15–40 seconds to complete instance initialization, returning preliminary gateway timeouts (HTTP 504) or connection exceptions.
- **Decoupled Interceptor Queue**: The frontend `ServerStateContext` implements a global `fetch` interceptor. When an API call encounters a network exception or HTTP 500, 502, 503, or 504 gateway response, the request promise is **suspended and buffered in an internal queue**.
- **Linear Progress Bar & Verification State**:
  - While awaiting instance initialization, progress advances predictably from **0% → 95%**.
  - Upon receiving HTTP **200 OK** from `/api/health`, progress interpolates linearly to **100%** over **2.0 seconds** (`Server Connected! 100%`).
  - The 100% state **holds for 800ms** to visually confirm load completion.
  - The interface transitions to a stroke-drawn vector verification mark (*"Thanks for waiting, our server is live!"*) displaying for **3.4 seconds**.
  - All buffered requests automatically execute in sequence without requiring page reloads or route resets.
- **Continuous Health Heartbeat**: An 8-second background timer and tab `visibilitychange` listener detect backend sleep status prior to user interaction.

##### 📊 Initialization State Machine
```mermaid
stateDiagram-v2
    [*] --> IdleState: Backend Active (200 OK)
    IdleState --> InterceptedError: Gateway Timeout (504) / Connection Error
    InterceptedError --> WakeupOverlayActive: Buffer Request Queue & Display Overlay
    
    state WakeupOverlayActive {
        [*] --> SteadyProgress: Asynchronous Progress Increment (0% to 95%)
        SteadyProgress --> PollingHealth: Health Check Ping (500ms Interval)
        PollingHealth --> SteadyProgress: Instance Initializing
        PollingHealth --> BackendConnected: /api/health Responds 200 OK
        
        BackendConnected --> SmoothCompletion: Linear Interpolation to 100% (2.0s)
        SmoothCompletion --> HoldState: Completion State Delay (800ms)
        HoldState --> SuccessVerificationState: Render Verification Indicator (3.4s)
    }
    
    WakeupOverlayActive --> QueueExecution: Replay Intercepted Request Queue
    QueueExecution --> IdleState: Resume Active Session (Zero Page Reload)
```

#### 🔍 Deep-Dive: Dynamic Database URL Parsing & Scheme Converter
- **Automatic URL Parsing**: `DatabaseConfig.java` parses `DATABASE_URL`, `SPRING_DATASOURCE_URL`, or `DB_URL` at runtime.
- **Driver Compatibility**: PostgreSQL JDBC driver throws `WARN: JDBC URL invalid port number` if `user:pass@` is present in the `jdbc:postgresql://` host string. Our parser extracts `username` and `password`, strips `user:pass@` from the host, and passes clean parameters directly to HikariCP.
- **Zero Configuration Hardcoding**: Fully dynamic across local PostgreSQL, Docker Compose, AlwaysData, and Render.com.

##### ⚙️ Database URL Parsing Pipeline
```mermaid
flowchart TD
    A["Raw Environment Variable (DATABASE_URL)"] --> B{"Starts with postgres:// or postgresql:// ?"}
    B -- Yes --> C["Convert Scheme to jdbc:postgresql://"]
    B -- No --> D["Inspect URI String"]
    
    C --> E["Extract User Info (user:password@)"]
    D --> E
    
    E --> F["Extract Username & Password"]
    E --> G["Strip user:password@ from Host String"]
    
    F --> H["Set HikariCP Credentials (setUsername / setPassword)"]
    G --> I["Format Clean Host JDBC URL (jdbc:postgresql://host:port/dbname)"]
    
    H --> J["Initialize HikariDataSource Pool"]
    I --> J
```

#### 🔍 Deep-Dive: Google OAuth 2.0 & Account Safeguards
- **ID Token Exchange**: Validates Google ID tokens against backend `WORKHUB_GOOGLE_CLIENT_ID`.
- **Database Collision Prevention**: `EmployeeService.java` checks if an email is already registered. If an account exists without a password hash (created via Google OAuth), registration or password login attempts return:
  > *"This email is registered using Google Sign-In. Please click 'Continue with Google' to sign in."*

##### 🔒 Authentication & Account Safeguard Decision Flow
```mermaid
flowchart TD
    A["User Auth Request"] --> B{"Auth Provider?"}
    
    B -- Google OAuth --> C["Verify Google ID Token"]
    C --> D{"Email Exists in DB?"}
    D -- Yes --> E["Update last_login_at & Issue Session"]
    D -- No --> F["Create New Employee (password_hash = NULL)"] --> E
    
    B -- Password Registration / Login --> G{"Email Exists in DB?"}
    G -- No --> H["Create Employee with BCrypt Hash"]
    G -- Yes --> I{"is password_hash NULL?"}
    I -- Yes --> J["Reject Password Auth & Display OAuth Warning"]
    I -- No --> K["Verify BCrypt Password Match"]
    K -- Match --> E
    K -- Mismatch --> L["Return 401 Invalid Credentials"]
```

---

## 3. Architecture and System Design

### 3.1 System Context

```mermaid
flowchart LR
    A["React 18 Dashboard (frontend/)"] -->|REST / JSON| B["Spring Boot 3 API (backend/)"]
    B -->|HikariCP Pool| C[("PostgreSQL DB")]
    B -->|OAuth 2.0 ID Token| D["Google Auth API"]
    A -->|500ms Polling| E["/api/health Endpoint"]
```

### 3.2 Render Server Wakeup & Queue Replay Sequence

```mermaid
sequenceDiagram
    participant U as User / UI
    participant INT as Fetch Interceptor
    participant WAK as Server Wakeup Overlay
    participant API as Spring Boot API
    participant QUE as Pending Request Queue

    U->>INT: Perform Action (e.g., Create Employee)
    INT->>API: POST /api/employees
    API-->>INT: HTTP 504 / Connection Error (Server Sleeping)
    
    INT->>QUE: Enqueue Request & Pause Promise
    INT->>WAK: Mount Wakeup Screen Overlay (Progress 0% -> 95%)
    
    loop Every 500ms
        WAK->>API: GET /api/health
    end
    
    API-->>WAK: HTTP 200 {"status": "UP"} (Server Awake)
    WAK->>WAK: Smoothly fill bar to 100% (2.0s)
    WAK->>WAK: Hold 100% state for 800ms
    WAK->>WAK: Display Verification Mark (3.4s)
    
    WAK->>QUE: Trigger processPendingQueue()
    QUE->>API: Replay Original Request (POST /api/employees)
    API-->>U: Success Response (No Page Reload / No Redirect)
```

---

## 4. Technology Stack and Versions

### 4.1 Backend Services

| Component | Technology / Library | Version |
|---|---|---|
| Language | Java OpenJDK | 17 |
| Framework | Spring Boot | 3.3.3 |
| Database Access | Spring Data JPA / Hibernate | 6.5 |
| Connection Pool | HikariCP | 5.1.0 |
| Security | BCrypt Password Encoder | 6.3 |
| Database | PostgreSQL | 15+ |
| Build Tool | Apache Maven | 3.9+ |

### 4.2 Frontend Client

| Component | Technology / Library | Version |
|---|---|---|
| UI Library | React | 18.2.0 |
| Build Tool | Vite | 5.4.21 |
| Icons | Lucide React | 0.344.0 |
| Styling | Vanilla Glassmorphism CSS | CSS3 |

---

## 5. Domain Model and Data Schema

### 5.1 Core Entity Specifications

- **`employees`**: Central workforce entity storing personal info, job attributes, BCrypt hashes, and role scopes (`USER`/`ADMIN`).
- **`departments`**: Organizational units (Engineering, HR, Finance, Operations).
- **`job_titles`**: Position classifications (Software Engineer, Financial Analyst, HR Specialist).
- **`employee_addresses`**: Detailed residential address mapping (1-to-1 with `employees`).
- **`payroll`**: Compensation records detailing base salary, bonuses, deductions, and pay dates.
- **`attendance_records`**: Daily check-in/out timestamps and attendance status.
- **`leave_types`**: Leave classification system (Casual, Sick, Earned) with annual quotas.
- **`leave_requests`**: Employee leave applications, approval tracking, and workflow states.

### 5.2 Relational Database Entity Diagram (3NF Schema Mapping)

```mermaid
erDiagram
    DEPARTMENTS ||--o{ EMPLOYEES : "has many"
    JOB_TITLES ||--o{ EMPLOYEES : "designates"
    EMPLOYEES ||--o| EMPLOYEE_ADDRESSES : "has one"
    EMPLOYEES ||--o{ PAYROLL : "receives"
    EMPLOYEES ||--o{ ATTENDANCE_RECORDS : "logs"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "applies for"
    LEAVE_TYPES ||--o{ LEAVE_REQUESTS : "categorizes"
    EMPLOYEES ||--o{ LEAVE_REQUESTS : "approves"

    DEPARTMENTS {
        bigint id PK
        string name UK
    }

    JOB_TITLES {
        bigint id PK
        string title UK
    }

    EMPLOYEES {
        bigint id PK
        string first_name
        string last_name
        string email UK
        string phone
        string phone_country_code
        bigint department_id FK
        bigint job_title_id FK
        decimal salary
        string currency
        date date_of_birth
        date hire_date
        boolean active
        string role
        text profile_image
        string password_hash
        timestamp created_at
        timestamp last_login_at
    }

    EMPLOYEE_ADDRESSES {
        bigint id PK
        bigint employee_id FK
        text address_line
        string city
        string state
        string pincode
    }

    PAYROLL {
        bigint id PK
        bigint employee_id FK
        decimal salary
        decimal bonus
        decimal deductions
        date pay_date
    }

    ATTENDANCE_RECORDS {
        bigint id PK
        bigint employee_id FK
        date attendance_date
        timestamp check_in_time
        timestamp check_out_time
        string attendance_status
    }

    LEAVE_TYPES {
        bigint id PK
        string leave_code UK
        string leave_name
        int annual_quota_days
    }

    LEAVE_REQUESTS {
        bigint id PK
        bigint employee_id FK
        bigint leave_type_id FK
        date start_date
        date end_date
        text reason
        string approval_status
        timestamp applied_on
        timestamp approved_on
        bigint approved_by FK
    }
```

---

## 6. Real-World Use Cases

1. **HR Onboarding & Offboarding**: Quickly adding new employees with automated department assignments, salary tiers, and account credentials.
2. **Enterprise Access Control**: Separating standard employee views (`USER`) from administrative privileges (`ADMIN` - editing salaries, deleting records, changing roles).
3. **Seamless Cloud Hosting**: Hosting backend services on Render free-tier while maintaining an ultra-sleek, non-frustrating user experience when servers wake up.
4. **Unified Authentication**: Allowing users to log in seamlessly using Google Workspace OAuth or standard email/password credentials.

---

## 7. Core Problems Solved

- **Cloud Cold-Start Friction**: Eliminates broken UI states or blank error screens when backend services sleep on free cloud hosting.
- **Credential Conflicts**: Prevents password collisions when users register with emails already associated with Google OAuth.
- **Background Scroll Leaks**: Prevents background body scrolling on all overlay modals across desktop and mobile browsers.

---

## 8. API Reference & Endpoints

<details>
<summary><strong>🔐 Authentication Endpoints</strong></summary>

<br>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| <kbd>POST</kbd> | `/api/auth/login` | Authenticates user with email and password. | ❌ |
| <kbd>POST</kbd> | `/api/auth/google` | Authenticates user using Google ID token. | ❌ |
| <kbd>GET</kbd>  | `/api/auth/google/start` | Initiates Google OAuth 2.0 authorization code flow. | ❌ |
| <kbd>GET</kbd>  | `/api/auth/google/callback` | Google OAuth redirect callback handler. | ❌ |
| <kbd>GET</kbd>  | `/api/auth/google/exchange` | Exchanges login token for employee session object. | ❌ |

</details>

<details>
<summary><strong>👥 Employee Management Endpoints</strong></summary>

<br>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| <kbd>GET</kbd>  | `/api/employees` | Retrieves list of all employees (with enriched department/job title names). | 🔒 |
| <kbd>GET</kbd>  | `/api/employees/:id` | Retrieves detailed employee profile by ID. | 🔒 |
| <kbd>POST</kbd> | `/api/employees` | Creates a new employee record (Registration). | ❌ / 🔒 |
| <kbd>PUT</kbd>  | `/api/employees/:id` | Updates existing employee profile details. | 🔒 (ADMIN) |
| <kbd>DELETE</kbd>| `/api/employees/:id` | Permanently deletes an employee record. | 🔒 (ADMIN) |

</details>

<details>
<summary><strong>🏢 Master Data & Health Endpoints</strong></summary>

<br>

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| <kbd>GET</kbd> | `/api/health` | Health check endpoint returning HTTP 200 `{"status": "UP"}`. | ❌ |
| <kbd>GET</kbd> | `/api/departments` | Retrieves list of active organizational departments. | 🔒 |
| <kbd>GET</kbd> | `/api/job-titles` | Retrieves list of active job titles. | 🔒 |

</details>

---

## 9. Cloud Deployment & Render Wakeup UI

WorkHub is engineered for seamless deployment on **Render.com** (Backend API + Database) and **Vercel** (Frontend Client).

### 9.1 Render Backend Environment Setup
Configure the following environment variables in your Render Web Service:

```env
DATABASE_URL=postgres://workhub_user:YOUR_PASSWORD@dpg-xxxx-a.oregon-postgres.render.com/workhub_db
PORT=8080
WORKHUB_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
WORKHUB_GOOGLE_CLIENT_SECRET=your-google-client-secret
WORKHUB_GOOGLE_REDIRECT_URI=https://your-backend.onrender.com/api/auth/google/callback
WORKHUB_FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 10. Local Development Setup

### 10.1 Prerequisites
- Java 17+
- Node.js v18+ & npm
- PostgreSQL database running locally (or via Docker)
- Git

### 10.2 Run Backend (Spring Boot)
```bash
cd backend
mvn spring-boot:run
```
The Spring Boot server starts on `http://localhost:8080`.

### 10.3 Run Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173`.

---

## 11. Repository Layout

```text
WorkHub/
|- README.md                    # Root documentation (You are here)
|- docker-compose.yml           # Docker orchestration
|- database/
|  |- schema.sql                # Database DDL schema initialization
|- backend/                     # Java Spring Boot Backend
|  |- src/
|  |  |- main/
|  |  |  |- java/com/workhub/backend/
|  |  |  |  |- config/          # DatabaseConfig.java & Security configs
|  |  |  |  |- controller/      # REST API Controllers (Auth, Employee, MasterData)
|  |  |  |  |- dto/             # Data Transfer Objects
|  |  |  |  |- entity/          # JPA Entities (Employee, Department, JobTitle)
|  |  |  |  |- exception/       # GlobalExceptionHandler.java
|  |  |  |  |- repository/     # Spring Data JPA Repositories
|  |  |  |  |- service/        # AuthService, EmployeeService
|  |  |  |- resources/          # application.properties, schema.sql
|  |- pom.xml                   # Maven dependencies
|- frontend/                    # React 18 + Vite Frontend
|  |- public/                   # Static assets & favicon
|  |- src/
|  |  |- components/            # UI components & Modals
|  |  |  |- ui/                 # ServerWakeupScreen.jsx overlay
|  |  |- context/               # ServerStateContext.jsx (Fetch Interceptor & Queue)
|  |  |- hooks/                 # useLockBodyScroll.js
|  |  |- services/              # api.js API client
|  |  |- App.jsx                # Main application component
|  |  |- index.css              # Glassmorphic design system & SVG animations
|  |- package.json
```
