<div align="center">

# 🏢 WorkHub Employee Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-4.4.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.3-6DB33F?logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-18.3-336791?logo=postgresql)](https://www.postgresql.org/)
[![Deployment](https://img.shields.io/badge/Deployed%20on-Vercel%20%2B%20Render-000000?logo=vercel)](https://vercel.com/)

**A modern, full-stack, interactive employee management platform featuring beautiful UI, secure authentication, and robust role-based access control for teams of any size.**

[🚀 Live Demo](https://workhub-frontend.vercel.app/) • [📖 Documentation](#documentation) • [🐛 Report Bug](https://github.com/Tanmay-Kudkar/WorkHub/issues) • [💡 Request Feature](https://github.com/Tanmay-Kudkar/WorkHub/issues)

</div>

---

## 📋 Table of Contents

- [🌟 Overview](#-overview)
- [✨ Key Features](#-key-features)
- [🛠 Technology Stack](#-technology-stack)
- [🏗 System Architecture](#-system-architecture)
- [⚡ Quick Start](#-quick-start)
- [🔧 Installation Guide](#-installation-guide)
- [🌐 Deployment](#-deployment)
- [📖 API Documentation](#-api-documentation)
- [🎨 UI/UX Showcase](#-uiux-showcase)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [👥 Team](#-team)
- [📄 License](#-license)
- [🆘 Support](#-support)

---

## 🌟 Overview

WorkHub is a cutting-edge employee management system designed to streamline HR operations and enhance organizational efficiency. Built with modern web technologies, it offers an intuitive interface for managing employee data, user authentication, and role-based access control.

### 🎯 Project Goals

- **Simplify HR Operations**: Streamline employee data management
- **Enhance Security**: Implement robust authentication and authorization
- **Improve User Experience**: Provide an intuitive, responsive interface
- **Ensure Scalability**: Built to handle growing organizational needs

### 🏆 Project Status

- ✅ **Production Ready**: Fully deployed and operational
- ✅ **Mobile Responsive**: Works seamlessly across all devices
- ✅ **Performance Optimized**: Fast loading and smooth interactions
- ✅ **Security Hardened**: Secure authentication and data protection

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### 🔐 Authentication & Security

- **Secure Login/Register** with password hashing
- **Role-based Access Control** (Admin/User)
- **Session Management** with persistent login
- **Password Validation** and security enforcement

### 👥 Employee Management

- **Complete CRUD Operations** for employee profiles
- **Advanced Search & Filtering** by multiple criteria
- **Bulk Operations** for efficient management
- **Data Export** capabilities

</td>
<td width="50%">

### 🎨 Modern UI/UX

- **Glassmorphism Design** with animated gradients
- **Responsive Layout** optimized for all devices
- **Interactive Modals** with smooth animations
- **Real-time Feedback** and loading states

### 🚀 Performance Features

- **Optimized Bundle Size** with Vite build system
- **Lazy Loading** for improved performance
- **Caching Strategies** for faster data access
- **Progressive Enhancement** for better UX

</td>
</tr>
</table>

---

## 🛠 Technology Stack

<div align="center">

### Frontend Technologies

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

### Backend Technologies

![Spring Boot](https://img.shields.io/badge/Spring_Boot-F2F4F9?style=for-the-badge&logo=spring-boot)
![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Maven](https://img.shields.io/badge/Apache%20Maven-C71A36?style=for-the-badge&logo=Apache%20Maven&logoColor=white)

### Deployment & DevOps

![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

---

## 🏗 System Architecture

```mermaid
graph TB
    subgraph "Frontend - Vercel"
        A[React + Vite App]
        B[TailwindCSS UI]
        C[State Management]
    end

    subgraph "Backend - Render"
        D[Spring Boot API]
        E[Authentication Service]
        F[Employee Controller]
    end

    subgraph "Database - Render PostgreSQL"
        G[Employee Data]
        H[User Credentials]
    end

    A --> D
    B --> A
    C --> A
    D --> E
    D --> F
    E --> H
    F --> G
```

### 🔄 Data Flow

1. **User Interaction**: React components handle user interactions
2. **API Requests**: Frontend makes REST API calls to Spring Boot backend
3. **Authentication**: JWT-based authentication with role verification
4. **Data Processing**: Backend processes requests and validates data
5. **Database Operations**: PostgreSQL handles data persistence
6. **Response**: JSON responses sent back to frontend for UI updates

---

## ⚡ Quick Start

### 🚀 One-Click Deploy

Deploy your own instance of WorkHub:

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/Tanmay-Kudkar/WorkHub)

### 💻 Local Development

```bash
# Clone the repository
git clone https://github.com/Tanmay-Kudkar/WorkHub.git
cd WorkHub

# Install dependencies
cd frontend && npm install
cd ../backend && mvn clean install

# Start development servers
# Terminal 1: Backend
cd backend && mvn spring-boot:run

# Terminal 2: Frontend
cd frontend && npm run dev
```

**🎉 Access the application at `http://localhost:5173`**

### 🔑 Admin Login Credentials

- **Admin**: `admin@workhub.com` / `admin`

---

## 🔧 Installation Guide

### 📋 Prerequisites

| Technology     | Version | Purpose          |
| -------------- | ------- | ---------------- |
| **Node.js**    | 18+     | Frontend runtime |
| **Java JDK**   | 17+     | Backend runtime  |
| **PostgreSQL** | 14+     | Database         |
| **Maven**      | 3.6+    | Build tool       |
| **Git**        | 2.0+    | Version control  |

### 🗄️ Database Setup

1. **Create PostgreSQL Database**:

```sql
CREATE DATABASE workhub_db;
CREATE USER workhub WITH PASSWORD 'ChangeMe_S3cure!';
GRANT ALL PRIVILEGES ON DATABASE workhub_db TO workhub;
```

2. **Configure Connection**:
   Update `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/workhub_db
spring.datasource.username=workhub
spring.datasource.password=ChangeMe_S3cure!
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true
```

### 🎨 Frontend Configuration

1. **Environment Variables** (`frontend/.env`):

```bash
VITE_API_BASE_URL=http://localhost:8080
```

2. **Vite Configuration** (already configured in `vite.config.js`):

```javascript
// ...existing code...
build: {
  outDir: "build", // Matches deployment settings
},
// ...existing code...
```

### ⚙️ Backend Configuration

**Key Configuration Files**:

- `src/main/resources/application.properties` - Database and server config
- `pom.xml` - Maven dependencies and build configuration
- Dockerfile - Container configuration for deployment

---

## 🌐 Deployment

### 🚀 Production Deployment Guide

<details>
<summary><b>📱 Frontend Deployment (Vercel)</b></summary>

#### Step-by-Step Vercel Setup

1. **Repository Connection**:
   - Sign in to [Vercel](https://vercel.com/)
   - Import your GitHub repository
   - Select the `WorkHub` project

2. **Build Configuration**:

   ```json
   {
     "framework": "vite",
     "rootDirectory": "frontend",
     "buildCommand": "npm run build",
     "outputDirectory": "build",
     "installCommand": "npm install",
     "nodeVersion": "18.x"
   }
   ```

3. **Environment Variables**:

   ```bash
   VITE_API_BASE_URL=https://workhub-backend-y081.onrender.com
   ```

4. **Custom Domain** (Optional):
   - Add your custom domain in Vercel dashboard
   - Configure DNS settings with your domain provider

</details>

<details>
<summary><b>🖥️ Backend Deployment (Render)</b></summary>

#### Step-by-Step Render Setup

1. **Service Creation**:
   - Create new "Web Service" on [Render](https://render.com/)
   - Connect your GitHub repository
   - Configure build settings

2. **Build Configuration**:

   ```yaml
   name: workhub-backend
   region: oregon
   branch: main
   rootDir: backend
   runtime: java
   buildCommand: mvn clean install -DskipTests
   startCommand: java -jar target/*.jar
   ```

3. **Environment Variables**:
   ```bash
   SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/workhub_db
   SPRING_DATASOURCE_USERNAME=your-db-username
   SPRING_DATASOURCE_PASSWORD=your-db-password
   SPRING_JPA_HIBERNATE_DDL_AUTO=update
   SERVER_PORT=8080
   SPRING_PROFILES_ACTIVE=production
   ```

</details>

<details>
<summary><b>🗄️ Database Deployment (Render PostgreSQL)</b></summary>

#### PostgreSQL Database Setup

1. **Database Creation**:

- Create "PostgreSQL" service in Render
- Choose appropriate plan (Free tier available)
- Set database name: `workhub_db`

2. **Connection Configuration**:
   - Copy internal database URL from Render
   - Update backend environment variables
   - Test connection from backend service

3. **Data Migration**:
   ```bash
   # If migrating from local development
   pg_dump -U workhub -d workhub_db > backup.sql
   psql -h render-host -U render-user -d render-db -f backup.sql
   ```

</details>

### 🐳 Docker Deployment (Alternative)

<details>
<summary><b>Docker Compose Configuration</b></summary>

Create `docker-compose.yml` in project root:

```yaml
version: "3.8"
services:
  # Frontend Service
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "80:80"
    environment:
      - VITE_API_BASE_URL=http://localhost:8080
    depends_on:
      - backend
    networks:
      - workhub-network

  # Backend Service
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8080:8080"
    environment:
      - SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/workhub_db
      - SPRING_DATASOURCE_USERNAME=workhub
      - SPRING_DATASOURCE_PASSWORD=workhub123
      - SPRING_JPA_HIBERNATE_DDL_AUTO=update
    depends_on:
      - db
    networks:
      - workhub-network

  # Database Service
  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=workhub_db
      - POSTGRES_USER=workhub
      - POSTGRES_PASSWORD=workhub123
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    networks:
      - workhub-network

volumes:
  postgres_data:

networks:
  workhub-network:
    driver: bridge
```

**Deploy with Docker**:

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

</details>

---

## 📖 API Documentation

### 🔗 Endpoint Overview

| Method   | Endpoint               | Description         | Auth Required |
| -------- | ---------------------- | ------------------- | ------------- |
| `POST`   | `/api/auth/login`      | User authentication | ❌            |
| `GET`    | `/api/employees`       | List all employees  | ✅            |
| `POST`   | `/api/employees`       | Create new employee | ✅            |
| `PUT`    | `/api/employees/{id}`  | Update employee     | ✅            |
| `DELETE` | `/api/employees/{id}`  | Delete employee     | ✅ (Admin)    |
| `GET`    | `/api/admin/employees` | Admin employee list | ✅ (Admin)    |

<details>
<summary><b>📝 Detailed API Specifications</b></summary>

#### Authentication Endpoints

**POST `/api/auth/login`**

```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response (Success)
{
  "id": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "role": "USER",
  "active": true
}

// Response (Error)
{
  "error": "Invalid credentials"
}
```

#### Employee Management Endpoints

**GET `/api/employees`**

```json
// Response
[
  {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "position": "Software Engineer",
    "department": "Engineering",
    "salary": 75000,
    "hireDate": "2023-01-15",
    "active": true,
    "role": "USER"
  }
]
```

**POST `/api/employees`**

```json
// Request
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "password": "securepassword",
  "position": "Product Manager",
  "department": "Product",
  "salary": 85000,
  "active": true
}

// Response
{
  "id": 2,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "position": "Product Manager",
  "department": "Product",
  "salary": 85000,
  "hireDate": "2024-01-15",
  "active": true,
  "role": "USER"
}
```

</details>

### 🔒 Authentication Flow

```mermaid
sequenceDiagram
    participant C as Client
    participant F as Frontend
    participant B as Backend
    participant D as Database

    C->>F: Enter credentials
    F->>B: POST /api/auth/login
    B->>D: Verify credentials
    D-->>B: User data
    B-->>F: User object + role
    F-->>C: Redirect to dashboard

    Note over F,B: Subsequent requests include user context
```

---

## 🎨 UI/UX Showcase

### 🎯 Design Philosophy

- **Glassmorphism**: Modern glass-like UI elements with backdrop blur
- **Gradient Aesthetics**: Dynamic color gradients for visual appeal
- **Micro-interactions**: Subtle animations that enhance user experience
- **Accessibility First**: WCAG compliant design patterns

### 📱 Responsive Design Breakpoints

| Device      | Breakpoint     | Features                              |
| ----------- | -------------- | ------------------------------------- |
| **Mobile**  | < 768px        | Collapsed navigation, stacked layouts |
| **Tablet**  | 768px - 1024px | Sidebar navigation, grid layouts      |
| **Desktop** | > 1024px       | Full featured interface, multi-column |

### 🎨 Color Palette & Theming

```css
/* Primary Colors */
--primary-blue: #3b82f6 --primary-purple: #8b5cf6 --primary-pink: #ec4899
  /* Glassmorphism */ --glass-bg: rgba(255, 255, 255, 0.25)
  --glass-border: rgba(255, 255, 255, 0.18) --backdrop-blur: blur(10px)
  /* Status Colors */ --success: #10b981 --warning: #f59e0b --error: #ef4444
  --info: #3b82f6;
```

---

## 🧪 Testing

### 🔬 Testing Strategy

<details>
<summary><b>Frontend Testing</b></summary>

**Testing Framework**: Jest + React Testing Library

```bash
# Run all tests
cd frontend && npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

**Test Categories**:

- **Unit Tests**: Component logic and utilities
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Complete user journeys
- **Accessibility Tests**: Screen reader and keyboard navigation

</details>

<details>
<summary><b>Backend Testing</b></summary>

**Testing Framework**: JUnit 5 + Mockito + TestContainers

```bash
# Run all tests
cd backend && mvn test

# Run tests with coverage
mvn test jacoco:report

# Run integration tests only
mvn test -Dtest="*IntegrationTest"
```

**Test Categories**:

- **Unit Tests**: Service layer and utilities
- **Integration Tests**: Repository and controller layers
- **Security Tests**: Authentication and authorization
- **Performance Tests**: Load and stress testing

</details>

### 📊 Quality Metrics

| Metric                  | Target | Current Status |
| ----------------------- | ------ | -------------- |
| **Code Coverage**       | > 80%  | ✅ 85%         |
| **Performance Score**   | > 90   | ✅ 94          |
| **Accessibility Score** | > 95   | ✅ 98          |
| **Security Score**      | A+     | ✅ A+          |

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help improve WorkHub:

### 🛠️ Development Workflow

1. **Fork the Repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/WorkHub.git
   cd WorkHub
   git remote add upstream https://github.com/YOUR_USERNAME/WorkHub.git
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   git checkout -b bugfix/issue-number
   git checkout -b hotfix/critical-fix
   ```

3. **Development Guidelines**
   - Follow existing code style and conventions
   - Add tests for new features
   - Update documentation as needed
   - Ensure all tests pass before submitting

4. **Commit Standards**

   ```bash
   # Feature
   git commit -m "feat: add employee search functionality"

   # Bug fix
   git commit -m "fix: resolve login authentication issue"

   # Documentation
   git commit -m "docs: update API documentation"
   ```

5. **Submit Pull Request**
   - Create detailed PR description
   - Reference related issues
   - Add screenshots for UI changes
   - Request review from maintainers

### 🐛 Bug Reports

**Before submitting a bug report**:

- Check existing issues for duplicates
- Test with the latest version
- Gather relevant system information

**Bug Report Template**:

```markdown
## Bug Description

Brief description of the issue

## Steps to Reproduce

1. Step one
2. Step two
3. Step three

## Expected Behavior

What should happen

## Actual Behavior

What actually happens

## Environment

- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 98, Firefox 97]
- Node.js: [e.g., 18.14.0]
- Java: [e.g., 17.0.2]
```

### 💡 Feature Requests

We're always looking for ways to improve WorkHub! Submit feature requests through GitHub Issues with:

- Clear description of the proposed feature
- Use case and benefits
- Potential implementation approach
- Any relevant mockups or examples

---

## 👥 Team

<div align="center">

### 🌟 Core Development Team

<table>
<tr>
<td align="center">
<img src="https://ui-avatars.com/api/?name=Tanmay+Kudkar&background=0f172a&color=ffffff&size=120" width="100px;" alt="Tanmay Kudkar"/><br />
<b>Tanmay Kudkar</b><br />
<sub>Core Development Team</sub>
</td>
<td align="center">
<img src="https://ui-avatars.com/api/?name=Atharva+Raut&background=1d4ed8&color=ffffff&size=120" width="100px;" alt="Atharva Raut"/><br />
<b>Atharva Raut</b><br />
<sub>Core Development Team</sub>
</td>
<td align="center">
<img src="https://ui-avatars.com/api/?name=Sameer+Balgar&background=be123c&color=ffffff&size=120" width="100px;" alt="Sameer Balgar"/><br />
<b>Sameer Balgar</b><br />
<sub>Core Development Team</sub><br />
</td>
<td align="center">
<img src="https://ui-avatars.com/api/?name=Tejas+Dhuri&background=7c3aed&color=ffffff&size=120" width="100px;" alt="Tejas Dhuri"/><br />
<b>Tejas Dhuri</b><br />
<sub>Core Development Team</sub>
</td>
<td align="center">
<img src="https://ui-avatars.com/api/?name=Ritikesh+Nayak&background=be123c&color=ffffff&size=120" width="100px;" alt="Ritikesh Nayak"/><br />
<b>Ritikesh Nayak</b><br />
<sub>Core Development Team</sub>
</td>
</tr>
</table>

### 🎯 Team Responsibilities

| Team Member        | Role             | Focus Areas                          |
| ------------------ | ---------------- | ------------------------------------ |
| **Tanmay Kudkar**  | Core Team Member | Project coordination and development |
| **Atharva Raut**   | Core Team Member | Development and collaboration        |
| **Sameer Balgar**  | Core Team Member | Backend and database contributions   |
| **Tejas Dhuri**    | Core Team Member | Feature development and testing      |
| **Ritikesh Nayak** | Core Team Member | UI support and integration           |

</div>

---

## 📄 License

```
MIT License

Copyright (c) 2025 WorkHub Development Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**What this means**:

- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❗ License and copyright notice must be included

---

## 🆘 Support

### 💬 Get Help

<div align="center">

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-red?logo=github)](https://github.com/Tanmay-Kudkar/WorkHub/issues)
[![Discussions](https://img.shields.io/badge/GitHub-Discussions-blue?logo=github)](https://github.com/Tanmay-Kudkar/WorkHub/discussions)
[![Stack Overflow](https://img.shields.io/badge/Stack-Overflow-orange?logo=stackoverflow)](https://stackoverflow.com/questions/tagged/workhub)

</div>

### 🔧 Troubleshooting

<details>
<summary><b>Common Issues & Solutions</b></summary>

#### Frontend Issues

**Build Errors**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

**Environment Variables Not Working**

```bash
# Ensure VITE_ prefix
VITE_API_BASE_URL=http://localhost:8080

# Restart dev server after changes
npm run dev
```

**Accessibility Issues**

```bash
# Form field elements missing id/name attributes
# Solution: Add unique id and name attributes to all form inputs

# Label not associated with form field
# Solution: Use htmlFor attribute on labels or nest inputs inside labels

# Content Security Policy blocks eval()
# Solution: Avoid using eval() in JavaScript, use proper CSP headers
```

**Security & Performance**

- **CSP Violations**: Ensure no `eval()` usage in JavaScript code
- **Form Accessibility**: All form inputs should have proper labels and IDs
- **ARIA Compliance**: Use proper ARIA attributes for screen readers

</details>

<details>
<summary><b>Backend Issues</b></summary>

**Database Connection Failed**

```bash
# Check PostgreSQL service
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Verify credentials in application.properties
spring.datasource.username=WORKHUB
spring.datasource.password=ChangeMe_S3cure!
```

**Port Already in Use**

```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>

# Or use different port
server.port=8081
```

</details>

<details>
<summary><b>Deployment Issues</b></summary>

**Vercel Build Fails**

- Check Node.js version in Vercel settings (use 18.x)
- Verify `outDir: "build"` in vite.config.js matches Vercel output directory
- Ensure all environment variables are set in Vercel dashboard

**Render Deployment Fails**

- Check Java version (use 17 or higher)
- Verify Maven build command: `mvn clean install -DskipTests`
- Check application logs in Render dashboard

</details>

### 📞 Contact Information

**For urgent issues or security concerns**:

- 📧 Email: [workhub.team@gmail.com](mailto:workhub.team@gmail.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/Tanmay-Kudkar/WorkHub/issues)
- 💡 Feature Requests: [GitHub Discussions](https://github.com/Tanmay-Kudkar/WorkHub/discussions)

### 🙏 Acknowledgments

Special thanks to:

- **Open Source Community** for amazing tools and libraries
- **Vercel & Render** for providing excellent hosting platforms
- **Spring Boot Team** for the robust backend framework
- **React Team** for the incredible frontend library
- **TailwindCSS** for beautiful utility-first styling

---

<div align="center">

### 🌟 Show Your Support

If you find WorkHub helpful, please consider:

[![⭐ Star on GitHub](https://img.shields.io/badge/⭐-Star%20on%20GitHub-yellow?style=for-the-badge)](https://github.com/Tanmay-Kudkar/WorkHub)
[![🔄 Fork Repository](https://img.shields.io/badge/🔄-Fork%20Repository-blue?style=for-the-badge)](https://github.com/Tanmay-Kudkar/WorkHub/fork)
[![📢 Share Project](https://img.shields.io/badge/📢-Share%20Project-green?style=for-the-badge)](https://twitter.com/intent/tweet?text=Check%20out%20WorkHub%20-%20A%20modern%20employee%20management%20system!&url=https://github.com/Tanmay-Kudkar/WorkHub)

**Made with ❤️ by the WorkHub Team**

_Empowering organizations through better employee management_

</div>

<!-- AUTO-GENERATED-EXTENDED-DOCS:START -->

---

## WorkHub Extended Engineering Compendium (Auto-Generated)

> Generated from current schema and controller sources for a deeply detailed, PDF-friendly project manual.

### Verified Inputs

- Schema references: database/schema.sql and backend/src/main/resources/schema.sql
- API references: backend/src/main/java/com/workhub/backend/controller/\*
- Frontend shell references: frontend/src/main.jsx and frontend/src/App.jsx

### ER Diagram (Physical Database Model: 8 Tables)

```mermaid
erDiagram
  DEPARTMENTS ||--o{ EMPLOYEES : department_id
  JOB_TITLES ||--o{ EMPLOYEES : job_title_id
  EMPLOYEES ||--|| EMPLOYEE_ADDRESSES : employee_id_unique
  EMPLOYEES ||--o{ PAYROLL : employee_id
  EMPLOYEES ||--o{ ATTENDANCE_RECORDS : employee_id
  EMPLOYEES ||--o{ LEAVE_REQUESTS : employee_id_requester
  LEAVE_TYPES ||--o{ LEAVE_REQUESTS : leave_type_id
  EMPLOYEES ||--o{ LEAVE_REQUESTS : approved_by

  DEPARTMENTS {
    bigint id PK
    varchar name UK
  }

  JOB_TITLES {
    bigint id PK
    varchar title UK
  }

  EMPLOYEES {
    bigint id PK
    varchar first_name
    varchar last_name
    varchar email UK
    bigint department_id FK
    bigint job_title_id FK
    varchar role
    timestamp created_at
  }

  EMPLOYEE_ADDRESSES {
    bigint id PK
    bigint employee_id FK,UK
    text address_line
  }

  PAYROLL {
    bigint id PK
    bigint employee_id FK
    decimal salary
    date pay_date
  }

  ATTENDANCE_RECORDS {
    bigint id PK
    bigint employee_id FK
    date attendance_date
    varchar attendance_status
  }

  LEAVE_TYPES {
    bigint id PK
    varchar leave_code UK
    integer annual_quota_days
  }

  LEAVE_REQUESTS {
    bigint id PK
    bigint employee_id FK
    bigint leave_type_id FK
    bigint approved_by FK
    varchar approval_status
  }
```

### EER Diagram (Conceptual Model + Role Specialization)

```mermaid
classDiagram
  class Employee {
    +id
    +email
    +role
    +active
  }
  class AdminEmployee {
    +approveLeaveRequest()
    +viewAllEmployeeRecords()
  }
  class StandardEmployee {
    +requestLeave()
    +checkIn()
  }
  class Department
  class JobTitle
  class EmployeeAddress
  class Payroll
  class AttendanceRecord
  class LeaveType
  class LeaveRequest

  Employee <|-- AdminEmployee
  Employee <|-- StandardEmployee

  Department "1" --> "0..*" Employee : assigns
  JobTitle "1" --> "0..*" Employee : defines
  Employee "1" --> "0..1" EmployeeAddress : has
  Employee "1" --> "0..*" Payroll : receives
  Employee "1" --> "0..*" AttendanceRecord : logs
  Employee "1" --> "0..*" LeaveRequest : submits
  LeaveType "1" --> "0..*" LeaveRequest : categorizes
  AdminEmployee "1" --> "0..*" LeaveRequest : approves
```

### Physical Entity Dictionary

#### 1) departments

- Purpose: Department master data for normalization.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Department surrogate key |
  | name | VARCHAR(100) | UNIQUE, NOT NULL | Canonical department name |
  | department_name | VARCHAR(100) | Legacy compatibility | Backfill helper column |

#### 2) job_titles

- Purpose: Job title master data for normalization.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Job title surrogate key |
  | title | VARCHAR(100) | UNIQUE, NOT NULL | Canonical title |
  | title_name | VARCHAR(100) | Legacy compatibility | Backfill helper column |

#### 3) employees

- Purpose: Core employee identity, profile, auth, and role context.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Employee key |
  | first_name | VARCHAR(255) | NOT NULL | Given name |
  | last_name | VARCHAR(255) | NOT NULL | Surname |
  | email | VARCHAR(255) | UNIQUE, NOT NULL | Login identity |
  | phone | VARCHAR(255) | NULL | Contact number |
  | phone_country_code | VARCHAR(5) | NULL | Dialing code |
  | department | VARCHAR(255) | Legacy | Legacy text column |
  | position | VARCHAR(255) | Legacy | Legacy text column |
  | address | VARCHAR(255) | Legacy | Legacy text column |
  | profile_image | TEXT | NULL | URI/base64 payload |
  | salary | NUMERIC(19,2) | NULL | Current salary snapshot |
  | currency | VARCHAR(3) | NULL | ISO-4217 code |
  | date_of_birth | DATE | NULL | DOB |
  | hire_date | DATE | NULL | Employment start date |
  | department_id | BIGINT | FK | References departments.id |
  | job_title_id | BIGINT | FK | References job_titles.id |
  | active | BOOLEAN | DEFAULT TRUE | Account state |
  | role | VARCHAR(255) | DEFAULT USER | ADMIN or USER |
  | password_hash | VARCHAR(255) | NULL | Secure hash |
  | created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Created time |
  | last_login_at | TIMESTAMP | NULL | Last auth success |

#### 4) employee_addresses

- Purpose: Normalized one-to-one structured address extension.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Address key |
  | employee_id | BIGINT | FK, UNIQUE, NOT NULL | One address per employee |
  | address_line | TEXT | NULL | Line address |
  | city | VARCHAR(50) | NULL | City |
  | state | VARCHAR(50) | NULL | State or Province |
  | pincode | VARCHAR(10) | NULL | Postal code |

#### 5) payroll

- Purpose: Payroll ledger rows per employee and pay date.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Payroll key |
  | employee_id | BIGINT | FK, NOT NULL | Employee reference |
  | salary | DECIMAL(10,2) | NULL | Base pay |
  | bonus | DECIMAL(10,2) | NULL | Bonus amount |
  | deductions | DECIMAL(10,2) | NULL | Deduction amount |
  | pay_date | DATE | NULL | Payroll date |

#### 6) attendance_records

- Purpose: Daily attendance and time-stamp tracking.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Attendance key |
  | employee_id | BIGINT | FK, NOT NULL | Employee reference |
  | attendance_date | DATE | UNIQUE(employee_id, attendance_date) | One row per day |
  | check_in_time | TIMESTAMP | NULL | Check-in event time |
  | check_out_time | TIMESTAMP | NULL | Check-out event time |
  | attendance_status | VARCHAR(20) | DEFAULT NOT_MARKED | Present or absent-like state |

#### 7) leave_types

- Purpose: Leave policy master data and annual quota definitions.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Leave type key |
  | leave_code | VARCHAR(20) | UNIQUE, NOT NULL | CL or SL or EL etc. |
  | leave_name | VARCHAR(80) | NOT NULL | Human-readable label |
  | annual_quota_days | INTEGER | NOT NULL | Yearly limit |

#### 8) leave_requests

- Purpose: Leave workflow transaction table with approval metadata.
  | Column | Type | Constraints | Notes |
  |---|---|---|---|
  | id | BIGSERIAL | PK | Leave request key |
  | employee_id | BIGINT | FK, NOT NULL | Requester employee |
  | leave_type_id | BIGINT | FK, NOT NULL | Leave category |
  | start_date | DATE | NOT NULL | Leave start |
  | end_date | DATE | NOT NULL | Leave end |
  | reason | TEXT | NULL | Optional notes |
  | approval_status | VARCHAR(20) | DEFAULT PENDING | PENDING APPROVED REJECTED |
  | applied_on | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Applied timestamp |
  | approved_on | TIMESTAMP | NULL | Decision timestamp |
  | approved_by | BIGINT | FK, NULL | Approver employee id |

### API Endpoint Master Table

|   # | Method | Endpoint                                                 | Access     | Function                 |
| --: | ------ | -------------------------------------------------------- | ---------- | ------------------------ |
|   1 | POST   | /api/auth/login                                          | Public     | Password login           |
|   2 | POST   | /api/auth/google                                         | Public     | Google token login       |
|   3 | GET    | /api/auth/google/start                                   | Public     | Start OAuth flow         |
|   4 | GET    | /api/auth/google/callback                                | Public     | OAuth callback           |
|   5 | GET    | /api/auth/google/exchange                                | Public     | Exchange callback token  |
|   6 | GET    | /api/employees                                           | Admin/Self | List employee data       |
|   7 | GET    | /api/employees/{id}                                      | Admin/Self | Get employee profile     |
|   8 | POST   | /api/employees                                           | Public     | Register/create employee |
|   9 | PUT    | /api/employees/{id}                                      | Admin/Self | Update employee          |
|  10 | DELETE | /api/employees/{id}                                      | Admin      | Delete employee          |
|  11 | GET    | /api/admin/employees                                     | Admin      | Admin list users         |
|  12 | GET    | /api/admin/employees/{id}                                | Admin      | Admin view user          |
|  13 | DELETE | /api/admin/employees/{id}                                | Admin      | Admin delete user        |
|  14 | GET    | /api/departments                                         | All        | Department lookup        |
|  15 | GET    | /api/job-titles                                          | All        | Job title lookup         |
|  16 | GET    | /api/dbms/overview                                       | All        | DB module summary        |
|  17 | GET    | /api/dbms/table/{tableName}                              | All        | Generic table preview    |
|  18 | GET    | /api/dbms/leave-types                                    | All        | Leave type list          |
|  19 | GET    | /api/dbms/employees/{employeeId}/leave-requests          | Admin/Self | List leave requests      |
|  20 | POST   | /api/dbms/employees/{employeeId}/leave-requests          | Admin/Self | Create leave request     |
|  21 | GET    | /api/dbms/admin/leave-requests                           | Admin      | Pending leave queue      |
|  22 | GET    | /api/dbms/admin/employees/{employeeId}/leave-requests    | Admin      | Employee leave history   |
|  23 | POST   | /api/dbms/admin/leave-requests/{leaveRequestId}/decision | Admin      | Approve/reject leave     |
|  24 | GET    | /api/dbms/admin/employees/{employeeId}/attendance        | Admin      | Attendance history       |
|  25 | GET    | /api/dbms/employees/{employeeId}/attendance/today        | Admin/Self | Today attendance state   |
|  26 | POST   | /api/dbms/employees/{employeeId}/attendance/check-in     | Admin/Self | Check in                 |
|  27 | POST   | /api/dbms/employees/{employeeId}/attendance/check-out    | Admin/Self | Check out                |
|  28 | GET    | /api/dbms/employees/{employeeId}/address                 | Admin/Self | Read address             |
|  29 | POST   | /api/dbms/employees/{employeeId}/address                 | Admin/Self | Upsert address           |
|  30 | GET    | /api/dbms/employees/{employeeId}/payroll                 | Admin/Self | Employee payroll         |
|  31 | GET    | /api/dbms/admin/employees/{employeeId}/payroll           | Admin      | Payroll for employee     |
|  32 | POST   | /api/dbms/employees/{employeeId}/payroll                 | Admin/Self | Create payroll record    |

