package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.invoice.InvoiceRejectRequest;
import com.contingentworkforce.dto.invoice.InvoiceRequest;
import com.contingentworkforce.dto.invoice.InvoiceResponse;
import com.contingentworkforce.enums.InvoiceStatus;
import com.contingentworkforce.service.InvoiceService;
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
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice creation, automated backend validation, and approval workflows")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @GetMapping
    @Operation(summary = "Get paginated list of invoices with vendor, project, status, and period filters")
    public ResponseEntity<ApiResponse<PageResponse<InvoiceResponse>>> getInvoices(
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<InvoiceResponse> response = invoiceService.getInvoices(vendorId, projectId, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice details and line items by ID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable UUID id) {
        InvoiceResponse response = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Create invoice draft")
    public ResponseEntity<ApiResponse<InvoiceResponse>> createInvoice(@Valid @RequestBody InvoiceRequest request) {
        InvoiceResponse response = invoiceService.createInvoice(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Invoice created successfully in DRAFT status", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Update invoice (allowed for DRAFT or REJECTED invoices)")
    public ResponseEntity<ApiResponse<InvoiceResponse>> updateInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody InvoiceRequest request) {
        
        InvoiceResponse response = invoiceService.updateInvoice(id, request);
        return ResponseEntity.ok(ApiResponse.success("Invoice updated successfully", response));
    }

    @PostMapping("/{id}/submit")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Submit invoice for Backend Validation & Manager Review")
    public ResponseEntity<ApiResponse<InvoiceResponse>> submitInvoice(@PathVariable UUID id) {
        InvoiceResponse response = invoiceService.submitInvoice(id);
        String message = response.getDifferenceAmount().signum() == 0
                ? "Invoice submitted and validated successfully with 0 discrepancy"
                : "Invoice submitted with difference of " + response.getDifferenceAmount() + " (flagged for review)";
        return ResponseEntity.ok(ApiResponse.success(message, response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Manager approve verified invoice")
    public ResponseEntity<ApiResponse<InvoiceResponse>> approveInvoice(@PathVariable UUID id) {
        InvoiceResponse response = invoiceService.approveInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice approved successfully", response));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Manager reject invoice with comments")
    public ResponseEntity<ApiResponse<InvoiceResponse>> rejectInvoice(
            @PathVariable UUID id,
            @Valid @RequestBody InvoiceRejectRequest rejectRequest) {
        
        InvoiceResponse response = invoiceService.rejectInvoice(id, rejectRequest);
        return ResponseEntity.ok(ApiResponse.success("Invoice rejected", response));
    }

    @PostMapping("/{id}/mark-paid")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Mark approved invoice as PAID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> markPaid(@PathVariable UUID id) {
        InvoiceResponse response = invoiceService.markPaid(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice marked as PAID", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('VENDOR', 'ADMIN')")
    @Operation(summary = "Delete draft invoice")
    public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable UUID id) {
        invoiceService.deleteInvoice(id);
        return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully", null));
    }
}
