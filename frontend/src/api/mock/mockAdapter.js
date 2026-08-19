import MockAdapter from 'axios-mock-adapter';
import { v4 as uuidv4 } from 'uuid';

export const setupMockAdapter = (axiosInstance) => {
  const mock = new MockAdapter(axiosInstance, { delayResponse: 800 });

  // Users
  const users = [
    { id: 'u1', email: 'admin@example.com', name: 'Alexander Admin', role: 'ADMIN' },
    { id: 'u2', email: 'manager@example.com', name: 'Michael Manager', role: 'MANAGER' },
    { id: 'u3', email: 'vendor@example.com', name: 'Victor Vendor', role: 'VENDOR' },
    { id: 'u4', email: 'contractor@example.com', name: 'John Contractor', role: 'CONTRACTOR' },
    { id: 'u5', email: 'admin@tracker.com', name: 'Admin User', role: 'ADMIN' },
    { id: 'u6', email: 'vendor@tracker.com', name: 'Acme Corp', role: 'VENDOR' },
    { id: 'u7', email: 'contractor@tracker.com', name: 'John Doe', role: 'CONTRACTOR' },
    { id: 'u8', email: 'manager@tracker.com', name: 'Jane Smith', role: 'MANAGER' },
  ];

  const vendors = [
    { id: 'v1', vendorName: 'Acme Corp', name: 'Acme Corp', contactPerson: 'Victor Vendor', email: 'vendor@example.com', phone: '555-0100', address: '123 Tech Park', activeContractors: 1, contractorCount: 1, managerId: 'u2', managerName: 'Michael Manager', managerEmail: 'manager@example.com', status: 'ACTIVE', contractStartDate: '2025-01-01', contractEndDate: '2026-12-31' },
    { id: 'v2', vendorName: 'Global Tech Resourcing', name: 'Global Tech Resourcing', contactPerson: 'Rachel Green', email: 'nexus@example.com', phone: '555-0200', address: '456 Business Blvd', activeContractors: 1, contractorCount: 1, managerId: 'u8', managerName: 'Jane Smith', managerEmail: 'manager@tracker.com', status: 'ACTIVE', contractStartDate: '2025-03-01', contractEndDate: '2027-03-01' },
  ];


  const contractors = [
    { id: 'c1', name: 'John Doe', email: 'contractor@tracker.com', phone: '555-0300', vendorId: 'v1', vendorName: 'Acme Corp', projectId: 'p1', projectName: 'Frontend Revamp', jobRole: 'Senior React Developer', hourlyRate: 65, status: 'Active', startDate: '2025-02-01', endDate: '2025-12-31' },
    { id: 'c2', name: 'Alice Johnson', email: 'alice.j@example.com', phone: '555-0301', vendorId: 'v2', vendorName: 'Global Tech Resourcing', projectId: 'p2', projectName: 'Backend Migration', jobRole: 'Java Developer', hourlyRate: 75, status: 'Active', startDate: '2025-01-15', endDate: '2025-11-30' },
  ];

  const projects = [
    { id: 'p1', name: 'Frontend Revamp', projectName: 'Frontend Revamp', client: 'Internal', clientName: 'Internal', description: 'Redesign of the main portal', vendorId: 'v1', vendorName: 'Acme Corp', managerId: 'u4', managerName: 'Jane Smith', startDate: '2025-01-01', endDate: '2025-12-31', budget: 150000, status: 'Active' },
    { id: 'p2', name: 'Backend Migration', projectName: 'Backend Migration', client: 'External Client XYZ', clientName: 'External Client XYZ', description: 'Migrate monolith to microservices', vendorId: 'v2', vendorName: 'Global Tech Resourcing', managerId: 'u4', managerName: 'Jane Smith', startDate: '2025-02-01', endDate: '2026-02-01', budget: 300000, status: 'Active' },
  ];


  const timesheets = [
    { id: 'ts1', contractorId: 'c1', contractorName: 'John Doe', projectId: 'p1', projectName: 'Frontend Revamp', date: '2025-08-10', startTime: '09:00', endTime: '17:00', breakHours: 1, totalHours: 7, description: 'Worked on dashboard UI', status: 'Submitted', submittedDate: '2025-08-11' },
    { id: 'ts2', contractorId: 'c1', contractorName: 'John Doe', projectId: 'p1', projectName: 'Frontend Revamp', date: '2025-08-11', startTime: '09:00', endTime: '18:00', breakHours: 1, totalHours: 8, description: 'API integration', status: 'Approved', submittedDate: '2025-08-12' },
  ];

  const milestones = [
    { id: 'm1', name: 'Phase 1 Delivery', projectId: 'p1', projectName: 'Frontend Revamp', description: 'Initial UI components completed', dueDate: '2025-03-30', billingAmount: 25000, completionPercentage: 100, status: 'Completed' },
    { id: 'm2', name: 'API Integration', projectId: 'p1', projectName: 'Frontend Revamp', description: 'Connect frontend to REST APIs', dueDate: '2025-06-30', billingAmount: 50000, completionPercentage: 50, status: 'In Progress' },
  ];

  const invoices = [
    { id: 'inv1', invoiceNumber: 'INV-2025-001', vendorId: 'v1', vendorName: 'Acme Corp', projectId: 'p1', projectName: 'Frontend Revamp', billingPeriod: 'July 2025', totalHours: 160, milestoneAmount: 0, totalAmount: 10400, calculatedAmount: 10400, differenceAmount: 0, status: 'Paid', submittedDate: '2025-08-01' },
    { id: 'inv2', invoiceNumber: 'INV-2025-002', vendorId: 'v1', vendorName: 'Acme Corp', projectId: 'p1', projectName: 'Frontend Revamp', billingPeriod: 'August 2025', totalHours: 150, milestoneAmount: 25000, totalAmount: 35000, calculatedAmount: 34750, differenceAmount: 250, status: 'Under Review', submittedDate: '2025-09-01' },
  ];

  // ===================== AUTH ROUTES =====================
  mock.onPost('/auth/login').reply((config) => {
    const { email, password } = JSON.parse(config.data);
    const user = users.find((u) => u.email.toLowerCase() === (email || '').toLowerCase());
    if (user && (password === 'password' || password === 'Password123!')) {
      // Embed user ID in the mock token to identify them later
      return [200, { token: `mock-jwt-token-${user.id}`, user }];
    }
    return [401, { message: 'Invalid credentials. Use any listed email and "Password123!" or "password".' }];
  });

  mock.onGet('/auth/me').reply((config) => {
    const authHeader = config.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Extract user ID from our mock token format
      const userIdMatch = token.match(/mock-jwt-token-(.+)/);
      if (userIdMatch && userIdMatch[1]) {
        const userId = userIdMatch[1];
        const user = users.find(u => u.id === userId);
        if (user) {
          return [200, user];
        }
      }
    }
    return [401, { message: 'Unauthorized' }];
  });

  // ===================== VENDORS =====================
  mock.onGet('/vendors').reply(200, vendors);
  mock.onGet(/\/vendors\/\w+/).reply((config) => {
    const id = config.url.split('/').pop();
    const vendor = vendors.find(v => v.id === id);
    return vendor ? [200, vendor] : [404];
  });

  // ===================== CONTRACTORS =====================
  mock.onGet('/contractors').reply(200, contractors);

  // ===================== PROJECTS =====================
  mock.onGet('/projects').reply(200, projects);

  // ===================== TIMESHEETS =====================
  mock.onGet('/timesheets').reply(200, timesheets);
  mock.onPost('/timesheets').reply((config) => {
    const data = JSON.parse(config.data);

    let totalScore = 0;
    let isBlocked = false;
    let isReviewRequired = false;
    let isWarning = false;
    const allTriggeredRules = [];
    let grandTotalHours = 0;

    data.details.forEach(day => {
      const hours = Number(day.hours || 0) + Number(day.extraHours || 0);
      if (hours === 0 && !day.milestones) return;

      grandTotalHours += hours;

      if (hours < 0) {
        isBlocked = true;
        allTriggeredRules.push({ rule: 'NEGATIVE_HOURS', severity: 'BLOCKED', message: `Hours cannot be negative on ${day.date}.` });
      } else if (hours > 24) {
        isBlocked = true;
        allTriggeredRules.push({ rule: 'EXCEEDS_MAX_HOURS', severity: 'BLOCKED', message: `More than 24 hours recorded on ${day.date}.` });
      } else if (hours > 16) {
        isReviewRequired = true; totalScore += 30;
        allTriggeredRules.push({ rule: 'CRITICAL_DAILY_HOURS', severity: 'HIGH', message: `${hours}h daily working hours on ${day.date}.` });
      } else if (hours > 12) {
        isReviewRequired = true; totalScore += 20;
        allTriggeredRules.push({ rule: 'HIGH_DAILY_HOURS', severity: 'REVIEW', message: `${hours}h daily working hours on ${day.date}.` });
      } else if (hours > 8) {
        isWarning = true; totalScore += 5;
        allTriggeredRules.push({ rule: 'ELEVATED_DAILY_HOURS', severity: 'WARNING', message: `${hours}h daily working hours on ${day.date}.` });
      }

      const d = new Date(day.date);
      const dow = d.getDay();
      if (dow === 0 || dow === 6) {
        totalScore += 10;
        if (hours > 12) {
          isReviewRequired = true;
          allTriggeredRules.push({ rule: 'WEEKEND_EXTREME', severity: 'HIGH', message: `Weekend hours exceed 12h on ${day.date}.` });
        } else if (hours > 8) {
          isReviewRequired = true;
          allTriggeredRules.push({ rule: 'WEEKEND_OVERTIME', severity: 'REVIEW', message: `Weekend hours exceed 8h on ${day.date}.` });
        } else {
          isWarning = true;
          allTriggeredRules.push({ rule: 'WEEKEND_WORK', severity: 'WARNING', message: `Weekend work detected on ${day.date}.` });
        }
      }

      const nowPlus30 = new Date(Date.now() + 30 * 24 * 3600 * 1000);
      if (d > nowPlus30) {
        isBlocked = true;
        allTriggeredRules.push({ rule: 'FAR_FUTURE_DATED', severity: 'BLOCKED', message: `Timesheet date is too far in future (${day.date}).` });
      } else if (d > new Date()) {
        isWarning = true; totalScore += 5;
        allTriggeredRules.push({ rule: 'PLANNED_SCHEDULE', severity: 'WARNING', message: `Timesheet planned for upcoming schedule day (${day.date}).` });
      }
    });


    if (grandTotalHours > 60) {
      isReviewRequired = true; totalScore += 30;
      allTriggeredRules.push({ rule: 'CRITICAL_WEEKLY_HOURS', severity: 'HIGH', message: `Weekly total ${grandTotalHours}h exceeds critical threshold.` });
    } else if (grandTotalHours > 48) {
      isReviewRequired = true; totalScore += 20;
      allTriggeredRules.push({ rule: 'HIGH_WEEKLY_HOURS', severity: 'REVIEW', message: `Weekly total ${grandTotalHours}h is extremely high.` });
    }

    if (isBlocked) {
      return [400, { message: 'Validation Engine blocked submission due to violations.', violations: allTriggeredRules }];
    }

    let maxRiskLevel = 'LOW';
    if (totalScore >= 70) maxRiskLevel = 'CRITICAL';
    else if (totalScore >= 40) maxRiskLevel = 'HIGH';
    else if (totalScore >= 20) maxRiskLevel = 'MEDIUM';

    let status = isReviewRequired ? 'Review Required' : 'Submitted';

    const newId = `ts${Math.random().toString(36).substring(2, 9)}`;
    const aggregatedTimesheet = {
      id: newId,
      contractorId: 'c1',
      contractorName: 'John Doe',
      projectId: 'p1',
      projectName: 'Frontend Revamp',
      date: data.startDate, // Representative date
      startTime: '09:00',
      endTime: '17:00',
      breakHours: 0,
      totalHours: grandTotalHours,
      description: `Submitted ${data.frequency} timesheet (${data.startDate} - ${data.endDate})`,
      status: status,
      riskScore: totalScore,
      riskLevel: maxRiskLevel,
      riskReasons: JSON.stringify(allTriggeredRules),
      submittedDate: new Date().toISOString().split('T')[0]
    };

    timesheets.unshift(aggregatedTimesheet); // Put at the top of the list
    return [201, { message: 'Timesheet processed successfully', data: aggregatedTimesheet }];
  });
  mock.onPost(/\/timesheets\/\w+\/approve/).reply(200, { message: 'Approved successfully' });
  mock.onPost(/\/timesheets\/\w+\/reject/).reply(200, { message: 'Rejected successfully' });

  // ===================== MILESTONES =====================
  mock.onGet('/milestones').reply(200, milestones);

  // ===================== INVOICES =====================
  mock.onGet('/invoices').reply(200, invoices);
  mock.onPost('/invoices').reply(config => {
    const data = JSON.parse(config.data || '{}');
    const newInvoice = {
      id: `inv-${Math.random().toString(36).substring(2, 9)}`,
      invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
      vendorId: data.vendorId || 'v1',
      vendorName: 'Apex Talent Group',
      projectId: data.projectId || 'p1',
      projectName: 'Frontend Revamp',
      billingPeriodStart: data.billingPeriodStart || '2026-08-01',
      billingPeriodEnd: data.billingPeriodEnd || '2026-08-15',
      subtotal: Number(data.subtotal || 0),
      tax: Number(data.tax || 0),
      totalAmount: Number(data.totalAmount || data.subtotal || 0),
      differenceAmount: 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString()
    };
    invoices.unshift(newInvoice);
    return [201, { data: newInvoice }];
  });
  mock.onPost(/\/invoices\/[^\/]+\/submit/).reply(config => {
    const urlParts = config.url.split('/');
    const invId = urlParts[2];
    const inv = invoices.find(i => i.id === invId || `inv-${i.id}` === invId);
    if (inv) {
      inv.status = 'UNDER_REVIEW';
      inv.submittedAt = new Date().toISOString();
    }
    return [200, { data: inv || {} }];
  });
  mock.onPost(/\/invoices\/[^\/]+\/approve/).reply(config => {
    const urlParts = config.url.split('/');
    const invId = urlParts[2];
    const inv = invoices.find(i => i.id === invId || `inv-${i.id}` === invId);
    if (inv) {
      inv.status = 'APPROVED';
      inv.approvedAt = new Date().toISOString();
    }
    return [200, { data: inv || {} }];
  });
  mock.onPost(/\/invoices\/[^\/]+\/reject/).reply(config => {
    const urlParts = config.url.split('/');
    const invId = urlParts[2];
    const inv = invoices.find(i => i.id === invId || `inv-${i.id}` === invId);
    if (inv) {
      inv.status = 'REJECTED';
    }
    return [200, { data: inv || {} }];
  });
  mock.onPost(/\/invoices\/[^\/]+\/mark-paid/).reply(config => {
    const urlParts = config.url.split('/');
    const invId = urlParts[2];
    const inv = invoices.find(i => i.id === invId || `inv-${i.id}` === invId);
    if (inv) {
      inv.status = 'PAID';
    }
    return [200, { data: inv || {} }];
  });


  // ===================== REPORTS =====================
  mock.onGet('/reports/dashboard').reply(200, {
    totalVendors: vendors.length,
    totalContractors: contractors.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    pendingTimesheets: timesheets.filter(t => t.status === 'Submitted').length,
    pendingInvoices: invoices.filter(i => i.status === 'Under Review').length,
    totalBilling: 450000
  });

  mock.onGet('/reports/billing').reply(200, [
    { month: 'Jan', amount: 40000 },
    { month: 'Feb', amount: 30000 },
    { month: 'Mar', amount: 45000 },
    { month: 'Apr', amount: 50000 },
    { month: 'May', amount: 48000 },
    { month: 'Jun', amount: 60000 },
  ]);

  // Fallback for unmocked routes
  mock.onAny().reply((config) => {
    console.warn(`Unmocked route called: ${config.method.toUpperCase()} ${config.url}`);
    return [404, { message: 'Mock route not defined' }];
  });
};