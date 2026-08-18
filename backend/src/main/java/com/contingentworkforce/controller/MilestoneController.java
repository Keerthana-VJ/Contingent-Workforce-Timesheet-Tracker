package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.milestone.MilestoneRequest;
import com.contingentworkforce.dto.milestone.MilestoneResponse;
import com.contingentworkforce.enums.MilestoneStatus;
import com.contingentworkforce.service.MilestoneService;
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
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
@Tag(name = "Milestones", description = "Milestone progress tracking and approval workflows")
public class MilestoneController {

    private final MilestoneService milestoneService;

    @GetMapping
    @Operation(summary = "Get paginated list of milestones with project and status filters")
    public ResponseEntity<ApiResponse<PageResponse<MilestoneResponse>>> getMilestones(
            @RequestParam(required = false) UUID projectId,
            @RequestParam(required = false) MilestoneStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<MilestoneResponse> response = milestoneService.getMilestones(projectId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get milestone details by ID")
    public ResponseEntity<ApiResponse<MilestoneResponse>> getMilestoneById(@PathVariable UUID id) {
        MilestoneResponse response = milestoneService.getMilestoneById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Create a project milestone (Auto-completes if completion is 100%)")
    public ResponseEntity<ApiResponse<MilestoneResponse>> createMilestone(@Valid @RequestBody MilestoneRequest request) {
        MilestoneResponse response = milestoneService.createMilestone(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Milestone created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Update milestone progress and billing amount")
    public ResponseEntity<ApiResponse<MilestoneResponse>> updateMilestone(
            @PathVariable UUID id,
            @Valid @RequestBody MilestoneRequest request) {
        
        MilestoneResponse response = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(ApiResponse.success("Milestone updated successfully", response));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    @Operation(summary = "Manager approve a completed (100%) milestone for billing")
    public ResponseEntity<ApiResponse<MilestoneResponse>> approveMilestone(@PathVariable UUID id) {
        MilestoneResponse response = milestoneService.approveMilestone(id);
        return ResponseEntity.ok(ApiResponse.success("Milestone approved for invoice billing", response));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('CONTRACTOR', 'MANAGER', 'ADMIN')")
    @Operation(summary = "Contractor or Manager marks a milestone as accomplished/completed")
    public ResponseEntity<ApiResponse<MilestoneResponse>> completeMilestone(@PathVariable UUID id) {
        MilestoneResponse response = milestoneService.completeMilestone(id);
        return ResponseEntity.ok(ApiResponse.success("Milestone marked as accomplished successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete milestone")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable UUID id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.ok(ApiResponse.success("Milestone deleted successfully", null));
    }
}
