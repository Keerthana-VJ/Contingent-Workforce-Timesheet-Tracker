package com.contingentworkforce.controller;

import com.contingentworkforce.dto.common.ApiResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.project.ProjectMemberRequest;
import com.contingentworkforce.dto.project.ProjectMemberResponse;
import com.contingentworkforce.dto.project.ProjectRequest;
import com.contingentworkforce.dto.project.ProjectResponse;
import com.contingentworkforce.enums.ProjectStatus;
import com.contingentworkforce.service.ProjectService;
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

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management and team assignment endpoints")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get paginated list of projects with filtering")
    public ResponseEntity<ApiResponse<PageResponse<ProjectResponse>>> getProjects(
            @RequestParam(required = false) UUID vendorId,
            @RequestParam(required = false) UUID managerId,
            @RequestParam(required = false) ProjectStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        PageResponse<ProjectResponse> response = projectService.getProjects(vendorId, managerId, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/my-projects")
    @Operation(summary = "Get list of projects relevant to the current authenticated user's role")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getMyProjects() {
        List<ProjectResponse> response = projectService.getProjectsForCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProjectById(@PathVariable UUID id) {
        ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(@Valid @RequestBody ProjectRequest request) {
        ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Project created successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update project details, budget, and status")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectRequest request) {
        
        ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.success("Project updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete project (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable UUID id) {
        projectService.deleteProject(id);
        return ResponseEntity.ok(ApiResponse.success("Project deleted successfully", null));
    }

    // ================= Member Assignments =================

    @PostMapping("/{id}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Assign a contractor to the project")
    public ResponseEntity<ApiResponse<ProjectMemberResponse>> assignContractor(
            @PathVariable UUID id,
            @Valid @RequestBody ProjectMemberRequest request) {
        
        ProjectMemberResponse response = projectService.assignContractor(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Contractor assigned to project successfully", response));
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Get all contractors assigned to the project")
    public ResponseEntity<ApiResponse<List<ProjectMemberResponse>>> getProjectMembers(@PathVariable UUID id) {
        List<ProjectMemberResponse> response = projectService.getProjectMembers(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}/members/{contractorId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'VENDOR')")
    @Operation(summary = "Remove contractor assignment from the project")
    public ResponseEntity<ApiResponse<Void>> removeContractor(
            @PathVariable UUID id,
            @PathVariable UUID contractorId) {
        
        projectService.removeContractor(id, contractorId);
        return ResponseEntity.ok(ApiResponse.success("Contractor removed from project", null));
    }

}
