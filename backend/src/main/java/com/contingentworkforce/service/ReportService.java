package com.contingentworkforce.service;

import com.contingentworkforce.dto.report.BillingReportResponse;
import com.contingentworkforce.dto.report.ContractorHoursDTO;
import com.contingentworkforce.dto.report.DashboardResponse;
import com.contingentworkforce.dto.report.VendorPerformanceDTO;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ReportService {
    DashboardResponse getDashboardMetrics();
    BillingReportResponse getBillingReport(UUID vendorId, UUID projectId, LocalDate startDate, LocalDate endDate);
    List<VendorPerformanceDTO> getVendorPerformanceReport();
    List<ContractorHoursDTO> getContractorHoursReport(UUID projectId, LocalDate startDate, LocalDate endDate);
}
