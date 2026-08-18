-- ==========================================================
-- Demo Data for Contingent Workforce & Timesheet Tracker
-- Passwords are all BCrypt hash for: Password123!
-- BCrypt Hash: $2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi
-- ==========================================================

-- 1. USERS
INSERT INTO users (id, name, email, password_hash, role, phone, status, created_at, updated_at)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Alexander Admin', 'admin@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'ADMIN', '+1-555-0101', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222222', 'Michael Manager', 'manager@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'MANAGER', '+1-555-0102', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333333', 'Victor Vendor', 'vendor@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'VENDOR', '+1-555-0103', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444444', 'John Contractor', 'contractor@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'CONTRACTOR', '+1-555-0104', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555555', 'Sarah DevOps', 'contractor2@example.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'CONTRACTOR', '+1-555-0105', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 2. VENDORS
INSERT INTO vendors (id, vendor_name, contact_person, email, phone, address, contract_start_date, contract_end_date, status, created_at, updated_at)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Apex Global Technologies', 'Victor Vendor', 'vendor@example.com', '+1-555-0103', '100 Silicon Way, San Jose, CA', '2025-01-01', '2027-12-31', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Nexus Talent Solutions', 'Rachel Green', 'nexus@example.com', '+1-555-0199', '450 Innovation Blvd, Austin, TX', '2025-03-01', '2027-03-01', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 3. CONTRACTORS
INSERT INTO contractors (id, user_id, vendor_id, job_role, hourly_rate, start_date, end_date, status, created_at, updated_at)
VALUES
('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Senior Full Stack Engineer', 650.00, '2025-01-15', '2026-12-31', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Cloud DevOps Architect', 850.00, '2025-02-01', '2026-12-31', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 4. PROJECTS
INSERT INTO projects (id, project_name, client_name, description, vendor_id, manager_id, start_date, end_date, budget, status, created_at, updated_at)
VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Enterprise Cloud Migration', 'FinTech Global Corp', 'Migration of legacy monolithic core to AWS microservices architecture.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '2025-01-01', '2026-12-31', 650000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'AI Timesheet & Fraud Analytics', 'Acro Logistics', 'Real-time anomaly detection and timesheet auditing platform.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', '2025-04-01', '2026-10-31', 400000.00, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 5. PROJECT MEMBERS
INSERT INTO project_members (id, project_id, contractor_id, assigned_date, end_date, status)
VALUES
('10101010-1010-1010-1010-101010101010', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-01-15', '2026-12-31', 'ACTIVE'),
('20202020-2020-2020-2020-202020202020', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2025-02-01', '2026-12-31', 'ACTIVE'),
('30303030-3030-3030-3030-303030303030', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2025-04-01', '2026-10-31', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 6. TIMESHEETS
INSERT INTO timesheets (id, contractor_id, project_id, work_date, start_time, end_time, break_hours, total_hours, description, status, submitted_at, approved_at, approved_by, created_at, updated_at)
VALUES
('a1111111-1111-1111-1111-111111111111', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-02', '09:00:00', '18:00:00', 1.00, 8.00, 'Implemented JWT authentication filters and security context', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a2222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-03', '09:00:00', '17:30:00', 0.50, 8.00, 'Developed Timesheet and Milestone JPA entities and repositories', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a3333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-04', '09:30:00', '18:30:00', 1.00, 8.00, 'Created automated invoice validation service and tests', 'SUBMITTED', CURRENT_TIMESTAMP, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a4444444-4444-4444-4444-444444444444', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-02', '08:30:00', '17:30:00', 1.00, 8.00, 'Configured Kubernetes cluster and Supabase PG connections', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('a5555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-03', '09:00:00', '17:00:00', 1.00, 7.00, 'Terraform pipeline for automated microservices provisioning', 'APPROVED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 7. MILESTONES
INSERT INTO milestones (id, project_id, milestone_name, description, due_date, billing_amount, completion_percentage, status, approved_by, approved_at, created_at, updated_at)
VALUES
('b1111111-1111-1111-1111-111111111111', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Cloud Architecture Blueprint', 'Comprehensive architecture sign-off for AWS landing zone', '2026-01-31', 45000.00, 100, 'COMPLETED', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b2222222-2222-2222-2222-222222222222', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Core Data Services Migration', 'Database migration of 10M records with zero downtime', '2026-02-28', 75000.00, 100, 'COMPLETED', '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('b3333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Microservices API Gateway', 'Unified Kong / Spring Cloud gateway with rate limiting', '2026-03-31', 50000.00, 60, 'IN_PROGRESS', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 8. INVOICES
INSERT INTO invoices (id, invoice_number, vendor_id, project_id, billing_period_start, billing_period_end, subtotal, tax, total_amount, calculated_amount, difference_amount, status, rejection_reason, submitted_at, approved_at, approved_by, paid_at, created_at, updated_at)
VALUES
('c1111111-1111-1111-1111-111111111111', 'INV-2026-001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-01-01', '2026-01-31', 145000.00, 26100.00, 171100.00, 171100.00, 0.00, 'PAID', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('c2222222-2222-2222-2222-222222222222', 'INV-2026-002', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2026-02-01', '2026-02-28', 95000.00, 17100.00, 112100.00, 97450.00, 14650.00, 'UNDER_REVIEW', NULL, CURRENT_TIMESTAMP, NULL, NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 9. INVOICE ITEMS
INSERT INTO invoice_items (id, invoice_id, item_type, reference_id, description, quantity, rate, amount)
VALUES
('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'MILESTONE', 'b1111111-1111-1111-1111-111111111111', 'Cloud Architecture Blueprint', 1.00, 45000.00, 45000.00),
('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'TIMESHEET', 'a1111111-1111-1111-1111-111111111111', 'Senior Full Stack Engineer (Jan approved hours)', 150.00, 650.00, 97500.00),
('d3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'MILESTONE', 'b2222222-2222-2222-2222-222222222222', 'Core Data Services Migration', 1.00, 75000.00, 75000.00)
ON CONFLICT (id) DO NOTHING;

-- 10. APPROVALS
INSERT INTO approvals (id, entity_type, entity_id, submitted_by, approved_by, status, comments, created_at, updated_at)
VALUES
('e1111111-1111-1111-1111-111111111111', 'TIMESHEET', 'a1111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'APPROVED', 'Verified sprint delivery against Jira tickets.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e2222222-2222-2222-2222-222222222222', 'MILESTONE', 'b1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'APPROVED', 'Blueprint sign-off completed by VP of Engineering.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('e3333333-3333-3333-3333-333333333333', 'INVOICE', 'c1111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'APPROVED', 'Amounts fully verified against approved timesheets & milestones.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- 11. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, created_at)
VALUES
('f1111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'Invoice Discrepancy Alert', 'Invoice INV-2026-002 submitted by Apex Global Technologies has a difference of 14,650.00.', 'INVOICE', FALSE, CURRENT_TIMESTAMP),
('f2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'New Timesheet Submitted', 'John Contractor submitted a timesheet for Enterprise Cloud Migration (8.0 hrs).', 'TIMESHEET', FALSE, CURRENT_TIMESTAMP),
('f3333333-3333-3333-3333-333333333333', '44444444-4444-4444-4444-444444444444', 'Timesheet Approved', 'Your timesheet for 2026-02-02 has been approved by Michael Manager.', 'TIMESHEET', TRUE, CURRENT_TIMESTAMP),
('f4444444-4444-4444-4444-444444444444', '33333333-3333-3333-3333-333333333333', 'Invoice Payment Received', 'Invoice INV-2026-001 has been marked as PAID in full.', 'INVOICE', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
