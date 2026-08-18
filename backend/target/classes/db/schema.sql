-- ==========================================================
-- Schema for Contingent Workforce & Timesheet Tracker
-- Compatible with PostgreSQL 14+ / Supabase
-- ==========================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS approvals CASCADE;
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS timesheets CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS contractors CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- ADMIN, VENDOR, CONTRACTOR, MANAGER
    phone VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. VENDORS
CREATE TABLE vendors (
    id UUID PRIMARY KEY,
    vendor_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vendors_status ON vendors(status);

-- 3. CONTRACTORS
CREATE TABLE contractors (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    job_role VARCHAR(255) NOT NULL,
    hourly_rate NUMERIC(10, 2) NOT NULL,
    start_date DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_contractor_user UNIQUE(user_id)
);

CREATE INDEX idx_contractors_vendor ON contractors(vendor_id);
CREATE INDEX idx_contractors_user ON contractors(user_id);

-- 4. PROJECTS
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    client_name VARCHAR(255),
    description TEXT,
    vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    budget NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'PLANNING', -- PLANNING, ACTIVE, COMPLETED, ON_HOLD
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_manager ON projects(manager_id);
CREATE INDEX idx_projects_vendor ON projects(vendor_id);
CREATE INDEX idx_projects_status ON projects(status);

-- 5. PROJECT MEMBERS
CREATE TABLE project_members (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, INACTIVE
    CONSTRAINT uk_project_contractor UNIQUE (project_id, contractor_id)
);

CREATE INDEX idx_project_members_proj ON project_members(project_id);
CREATE INDEX idx_project_members_cont ON project_members(contractor_id);

-- 6. TIMESHEETS
CREATE TABLE timesheets (
    id UUID PRIMARY KEY,
    contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    work_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_hours NUMERIC(5, 2) NOT NULL DEFAULT 0.00,
    total_hours NUMERIC(5, 2) NOT NULL,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, APPROVED, REJECTED
    rejection_reason TEXT,
    risk_score INT DEFAULT 0,
    risk_level VARCHAR(50) DEFAULT 'LOW',
    risk_reasons TEXT,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_timesheet_entry UNIQUE (contractor_id, project_id, work_date)
);

CREATE INDEX idx_timesheets_contractor ON timesheets(contractor_id);
CREATE INDEX idx_timesheets_project ON timesheets(project_id);
CREATE INDEX idx_timesheets_status ON timesheets(status);
CREATE INDEX idx_timesheets_date ON timesheets(work_date);

-- 7. MILESTONES
CREATE TABLE milestones (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    milestone_name VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    billing_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    completion_percentage INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'NOT_STARTED', -- NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_milestones_project ON milestones(project_id);
CREATE INDEX idx_milestones_status ON milestones(status);

-- 8. INVOICES
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(100) NOT NULL UNIQUE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    billing_period_start DATE NOT NULL,
    billing_period_end DATE NOT NULL,
    subtotal NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    total_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    calculated_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    difference_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT', -- DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, PAID
    rejection_reason TEXT,
    submitted_at TIMESTAMP,
    approved_at TIMESTAMP,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoices_vendor ON invoices(vendor_id);
CREATE INDEX idx_invoices_project ON invoices(project_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_num ON invoices(invoice_number);

-- 9. INVOICE ITEMS
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- TIMESHEET, MILESTONE
    reference_id UUID,
    description TEXT,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1.00,
    rate NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- 10. APPROVALS
CREATE TABLE approvals (
    id UUID PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- TIMESHEET, MILESTONE, INVOICE
    entity_id UUID NOT NULL,
    submitted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, APPROVED, REJECTED
    comments TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);
CREATE INDEX idx_approvals_status ON approvals(status);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- TIMESHEET, INVOICE, MILESTONE, SYSTEM
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);