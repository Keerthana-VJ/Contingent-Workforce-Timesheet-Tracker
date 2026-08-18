package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.timesheet.TimesheetRejectRequest;
import com.contingentworkforce.dto.timesheet.TimesheetRequest;
import com.contingentworkforce.dto.timesheet.TimesheetResponse;
import com.contingentworkforce.enums.TimesheetStatus;
import com.contingentworkforce.service.TimesheetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
@Tag(name = "Timesheets", description = "Timesheet entry, hour calculations, and manager approval workflows")
public class TimesheetController {

    private final TimesheetService timesheetService;

    @GetMapping
    @Operation(summary = "Get paginated list of timesheets with date, project, and status filters")
    public ResponseEntity<ApiResponse<PageResponse<TimesheetResponse>>> getTimesheets(
            @RequestParam(required = false) UUID contractorId,
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) TimesheetStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(sort = "workDate", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<TimesheetResponse> response = timesheetService.getTimesheets(
                contractorId, vendorId, projectId, status, startDate, endDate, pageable
        );
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get timesheet by ID")
    public ResponseEntity<ApiResponse<TimesheetResponse>> getTimesheetById(@PathVariable UUID id) {
        TimesheetResponse response = timesheetService.getTimesheetById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CONTRACTOR', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Create a timesheet entry (Calculates total hours automatically)")
    public ResponseEntity<ApiResponse<TimesheetResponse>> createTimesheet(@Valid @RequestBody TimesheetRequest request) {
        TimesheetResponse response = timesheetService.createTimesheet(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Timesheet entry created successfully in DRAFT status", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CONTRACTOR', 'ADMIN', 'MANAGER')")
    @Operation(summary = "Update timesheet entry (only allowed for DRAFT or REJECTED timesheets)")
    public ResponseEntity<ApiResponse<TimesheetResponse>> updateTimesheet(
            @PathVariable UUID id,
            @Valid @RequestBody TimesheetRequest request) {
        
        TimesheetResponse response = timesheetService.updateTimesheet(id, request);
        return ResponseEntity.ok(ApiResponse.success("Timesheet updated successfully", response));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('CONTRACTOR', 'ADMIN')")
    @Operation(summary = "Submit timesheet for Manager approval")
    public ResponseEntity<ApiResponse<TimesheetResponse>> submitTimesheet(@PathVariable UUID id) {
        TimesheetResponse response = timesheetService.submitTimesheet(id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet submitted for approval", response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Approve submitted timesheet (Vendor/Admin)")
    public ResponseEntity<ApiResponse<TimesheetResponse>> approveTimesheet(@PathVariable UUID id) {
        TimesheetResponse response = timesheetService.approveTimesheet(id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Reject submitted timesheet with reason (Vendor/Admin)")
    public ResponseEntity<ApiResponse<TimesheetResponse>> rejectTimesheet(
            @PathVariable UUID id,
            @Valid @RequestBody TimesheetRejectRequest rejectRequest) {
        
        TimesheetResponse response = timesheetService.rejectTimesheet(id, rejectRequest);
        return ResponseEntity.ok(ApiResponse.success("Timesheet rejected", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CONTRACTOR', 'ADMIN')")
    @Operation(summary = "Delete timesheet (only allowed if DRAFT)")
    public ResponseEntity<ApiResponse<Void>> deleteTimesheet(@PathVariable UUID id) {
        timesheetService.deleteTimesheet(id);
        return ResponseEntity.ok(ApiResponse.success("Timesheet deleted successfully", null));
    }
}
