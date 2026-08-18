package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.project.*;
import com.contingentworkforce.enums.ProjectStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ProjectService {
    ProjectResponse createProject(ProjectRequest request);
    ProjectResponse updateProject(UUID id, ProjectRequest request);
    ProjectResponse getProjectById(UUID id);
    PageResponse<ProjectResponse> getProjects(UUID vendorId, UUID managerId, ProjectStatus status, String search, Pageable pageable);
    List<ProjectResponse> getProjectsForCurrentUser();
    void deleteProject(UUID id);

    // Project Members
    ProjectMemberResponse assignContractor(UUID projectId, ProjectMemberRequest request);
    void removeContractor(UUID projectId, UUID contractorId);
    List<ProjectMemberResponse> getProjectMembers(UUID projectId);
}
