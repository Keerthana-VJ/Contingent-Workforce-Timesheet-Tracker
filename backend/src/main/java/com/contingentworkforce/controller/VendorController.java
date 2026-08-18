package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.vendor.VendorRequest;
import com.contingentworkforce.dto.vendor.VendorResponse;
import com.contingentworkforce.enums.VendorStatus;
import com.contingentworkforce.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
@Tag(name = "Vendors", description = "Vendor company management endpoints")
public class VendorController {

    private final VendorService vendorService;

    @GetMapping
    @Operation(summary = "Get paginated list of vendors with optional filtering")
    public ResponseEntity<ApiResponse<PageResponse<VendorResponse>>> getVendors(
            @RequestParam(required = false) UUID managerId,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) VendorStatus status,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<VendorResponse> response = vendorService.getVendors(managerId, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get vendor by ID")
    public ResponseEntity<ApiResponse<VendorResponse>> getVendorById(@PathVariable UUID id) {
        VendorResponse response = vendorService.getVendorById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new vendor company")
    public ResponseEntity<ApiResponse<VendorResponse>> createVendor(@Valid @RequestBody VendorRequest request) {
        VendorResponse response = vendorService.createVendor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Vendor created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Update an existing vendor company")
    public ResponseEntity<ApiResponse<VendorResponse>> updateVendor(
            @PathVariable UUID id,
            @Valid @RequestBody VendorRequest request) {
        
        VendorResponse response = vendorService.updateVendor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vendor updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete vendor company (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteVendor(@PathVariable UUID id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully", null));
    }
}
