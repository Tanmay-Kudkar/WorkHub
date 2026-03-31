-- WorkHub normalized schema bootstrap (3NF-oriented)
-- Safe for repeated execution.

-- Table 1: departments
CREATE TABLE IF NOT EXISTS departments (
	id BIGSERIAL PRIMARY KEY,
	name VARCHAR(100) UNIQUE NOT NULL
);

-- Compatibility for older schema versions.
ALTER TABLE departments ADD COLUMN IF NOT EXISTS name VARCHAR(100);
ALTER TABLE departments ADD COLUMN IF NOT EXISTS department_name VARCHAR(100);
UPDATE departments
SET name = department_name
WHERE name IS NULL AND department_name IS NOT NULL;

-- Table 2: job_titles
CREATE TABLE IF NOT EXISTS job_titles (
	id BIGSERIAL PRIMARY KEY,
	title VARCHAR(100) UNIQUE NOT NULL
);

ALTER TABLE job_titles ADD COLUMN IF NOT EXISTS title VARCHAR(100);
ALTER TABLE job_titles ADD COLUMN IF NOT EXISTS title_name VARCHAR(100);
UPDATE job_titles
SET title = title_name
WHERE title IS NULL AND title_name IS NOT NULL;

-- Table 3: employees
-- Legacy columns department/position/address are retained for compatibility and migration.
CREATE TABLE IF NOT EXISTS employees (
	id BIGSERIAL PRIMARY KEY,
	first_name VARCHAR(255) NOT NULL,
	last_name VARCHAR(255) NOT NULL,
	email VARCHAR(255) NOT NULL UNIQUE,
	phone VARCHAR(255),
	phone_country_code VARCHAR(5),
	department VARCHAR(255),
	position VARCHAR(255),
	address VARCHAR(255),
	profile_image TEXT,
	salary NUMERIC(19,2),
	currency VARCHAR(3),
	date_of_birth DATE,
	hire_date DATE,
	department_id BIGINT,
	job_title_id BIGINT,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	"role" VARCHAR(255) NOT NULL DEFAULT 'USER',
	password_hash VARCHAR(255),
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	last_login_at TIMESTAMP
);

ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id BIGINT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS job_title_id BIGINT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_image TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_department;
ALTER TABLE employees DROP CONSTRAINT IF EXISTS fk_employees_job_title;
ALTER TABLE employees
	ADD CONSTRAINT fk_employees_department
	FOREIGN KEY (department_id) REFERENCES departments(id);
ALTER TABLE employees
	ADD CONSTRAINT fk_employees_job_title
	FOREIGN KEY (job_title_id) REFERENCES job_titles(id);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees (department_id);
CREATE INDEX IF NOT EXISTS idx_employees_job_title_id ON employees (job_title_id);

-- Table 4: employee_addresses
CREATE TABLE IF NOT EXISTS employee_addresses (
	id BIGSERIAL PRIMARY KEY,
	employee_id BIGINT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
	address_line TEXT,
	city VARCHAR(50),
	state VARCHAR(50),
	pincode VARCHAR(10)
);

-- Table 5: payroll
CREATE TABLE IF NOT EXISTS payroll (
	id BIGSERIAL PRIMARY KEY,
	employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
	salary DECIMAL(10,2),
	bonus DECIMAL(10,2),
	deductions DECIMAL(10,2),
	pay_date DATE
);

-- Table 6: attendance_records
CREATE TABLE IF NOT EXISTS attendance_records (
	id BIGSERIAL PRIMARY KEY,
	employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
	attendance_date DATE NOT NULL,
	check_in_time TIMESTAMP,
	check_out_time TIMESTAMP,
	attendance_status VARCHAR(20) NOT NULL DEFAULT 'NOT_MARKED',
	UNIQUE (employee_id, attendance_date)
);

-- Table 7: leave_types
CREATE TABLE IF NOT EXISTS leave_types (
	id BIGSERIAL PRIMARY KEY,
	leave_code VARCHAR(20) NOT NULL UNIQUE,
	leave_name VARCHAR(80) NOT NULL,
	annual_quota_days INTEGER NOT NULL
);

-- Table 8: leave_requests
CREATE TABLE IF NOT EXISTS leave_requests (
	id BIGSERIAL PRIMARY KEY,
	employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
	leave_type_id BIGINT NOT NULL REFERENCES leave_types(id),
	start_date DATE NOT NULL,
	end_date DATE NOT NULL,
	reason TEXT,
	approval_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
	applied_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	approved_on TIMESTAMP,
	approved_by BIGINT REFERENCES employees(id)
);

ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_on TIMESTAMP;
ALTER TABLE leave_requests ADD COLUMN IF NOT EXISTS approved_by BIGINT;
ALTER TABLE leave_requests DROP CONSTRAINT IF EXISTS fk_leave_requests_approved_by;
ALTER TABLE leave_requests
	ADD CONSTRAINT fk_leave_requests_approved_by
	FOREIGN KEY (approved_by) REFERENCES employees(id);

-- Seed master data (idempotent)
INSERT INTO departments(name) VALUES
	('Engineering'),
	('Human Resources'),
	('Finance'),
	('Operations')
ON CONFLICT (name) DO NOTHING;

INSERT INTO job_titles(title) VALUES
	('Software Engineer'),
	('HR Specialist'),
	('Financial Analyst'),
	('Operations Executive')
ON CONFLICT (title) DO NOTHING;

INSERT INTO leave_types(leave_code, leave_name, annual_quota_days) VALUES
	('CL', 'Casual Leave', 12),
	('SL', 'Sick Leave', 10),
	('EL', 'Earned Leave', 15)
ON CONFLICT (leave_code) DO NOTHING;

-- Migration: map legacy text columns to normalized FK columns.
INSERT INTO departments(name)
SELECT DISTINCT TRIM(department)
FROM employees
WHERE department IS NOT NULL AND TRIM(department) <> ''
ON CONFLICT (name) DO NOTHING;

INSERT INTO job_titles(title)
SELECT DISTINCT TRIM(position)
FROM employees
WHERE position IS NOT NULL AND TRIM(position) <> ''
ON CONFLICT (title) DO NOTHING;

UPDATE employees e
SET department_id = d.id
FROM departments d
WHERE e.department_id IS NULL
	AND e.department IS NOT NULL
	AND TRIM(e.department) <> ''
	AND d.name = TRIM(e.department);

UPDATE employees e
SET job_title_id = j.id
FROM job_titles j
WHERE e.job_title_id IS NULL
	AND e.position IS NOT NULL
	AND TRIM(e.position) <> ''
	AND j.title = TRIM(e.position);
