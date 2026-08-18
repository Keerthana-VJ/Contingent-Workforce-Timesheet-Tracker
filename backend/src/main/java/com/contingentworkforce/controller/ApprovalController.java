package com.contingentworkforce.controller;

import com.contingentworkforce.dto.approval.ApprovalResponse;
import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.enums.EntityType;
import com.contingentworkforce.service.ApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/approvals")
@RequiredArgsConstructor
@Tag(name = "Approvals", description = "Audit trail and approval tracking endpoints")
public class ApprovalController {

    private final ApprovalService approvalService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get complete audit history of all approvals and rejections")
    public ResponseEntity<ApiResponse<PageResponse<ApprovalResponse>>> getAllApprovals(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<ApprovalResponse> response = approvalService.getAllApprovals(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get list of pending approvals across all entities")
    public ResponseEntity<ApiResponse<PageResponse<ApprovalResponse>>> getPendingApprovals(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<ApprovalResponse> response = approvalService.getPendingApprovals(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/entity/{entityType}/{entityId}")
    @Operation(summary = "Get approval history for a specific entity (Timesheet, Milestone, or Invoice)")
    public ResponseEntity<ApiResponse<List<ApprovalResponse>>> getApprovalsForEntity(
            @PathVariable EntityType entityType,
            @PathVariable UUID entityId) {
        
        List<ApprovalResponse> response = approvalService.getApprovalsForEntity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
