package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.report.BillingReportResponse;
import com.contingentworkforce.dto.report.ContractorHoursDTO;
import com.contingentworkforce.dto.report.DashboardResponse;
import com.contingentworkforce.dto.report.VendorPerformanceDTO;
import com.contingentworkforce.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports & Analytics", description = "Dashboard KPIs, billing reports, vendor scoring, and contractor analytics")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated dashboard metrics for frontend charts and KPIs")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardMetrics() {
        DashboardResponse response = reportService.getDashboardMetrics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/billing")
    @Operation(summary = "Get consolidated billing report by vendor, project, and period")
    public ResponseEntity<ApiResponse<BillingReportResponse>> getBillingReport(
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        BillingReportResponse response = reportService.getBillingReport(vendorId, projectId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/vendor-performance")
    @Operation(summary = "Get rule-based vendor performance ranking and scoring (0-100)")
    public ResponseEntity<ApiResponse<List<VendorPerformanceDTO>>> getVendorPerformanceReport() {
        List<VendorPerformanceDTO> response = reportService.getVendorPerformanceReport();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/contractor-hours")
    @Operation(summary = "Get contractor hours breakdown (approved vs pending) and total billings")
    public ResponseEntity<ApiResponse<List<ContractorHoursDTO>>> getContractorHoursReport(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        List<ContractorHoursDTO> response = reportService.getContractorHoursReport(projectId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
