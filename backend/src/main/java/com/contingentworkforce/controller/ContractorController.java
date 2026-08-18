package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.contractor.ContractorRequest;
import com.contingentworkforce.dto.contractor.ContractorResponse;
import com.contingentworkforce.enums.ContractorStatus;
import com.contingentworkforce.service.ContractorService;
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
@RequestMapping("/api/contractors")
@RequiredArgsConstructor
@Tag(name = "Contractors", description = "Contractor profile and rate management endpoints")
public class ContractorController {

    private final ContractorService contractorService;

    @GetMapping
    @Operation(summary = "Get paginated list of contractors with filtering")
    public ResponseEntity<ApiResponse<PageResponse<ContractorResponse>>> getContractors(
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) ContractorStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<ContractorResponse> response = contractorService.getContractors(vendorId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get contractor profile by ID")
    public ResponseEntity<ApiResponse<ContractorResponse>> getContractorById(@PathVariable UUID id) {
        ContractorResponse response = contractorService.getContractorById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Create a contractor profile linked to a user account and vendor")
    public ResponseEntity<ApiResponse<ContractorResponse>> createContractor(@Valid @RequestBody ContractorRequest request) {
        ContractorResponse response = contractorService.createContractor(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contractor profile created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Update contractor profile (rates, role, dates)")
    public ResponseEntity<ApiResponse<ContractorResponse>> updateContractor(
            @PathVariable UUID id,
            @Valid @RequestBody ContractorRequest request) {
        
        ContractorResponse response = contractorService.updateContractor(id, request);
        return ResponseEntity.ok(ApiResponse.success("Contractor profile updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete contractor profile")
    public ResponseEntity<ApiResponse<Void>> deleteContractor(@PathVariable UUID id) {
        contractorService.deleteContractor(id);
        return ResponseEntity.ok(ApiResponse.success("Contractor profile deleted successfully", null));
    }
}
