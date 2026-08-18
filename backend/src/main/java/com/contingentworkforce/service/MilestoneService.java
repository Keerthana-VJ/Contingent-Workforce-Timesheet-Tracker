package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.milestone.MilestoneRequest;
import com.contingentworkforce.dto.milestone.MilestoneResponse;
import com.contingentworkforce.enums.MilestoneStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MilestoneService {
    MilestoneResponse createMilestone(MilestoneRequest request);
    MilestoneResponse updateMilestone(UUID id, MilestoneRequest request);
    MilestoneResponse getMilestoneById(UUID id);
    List<MilestoneResponse> getMilestonesByProject(UUID projectId);
    PageResponse<MilestoneResponse> getMilestones(UUID projectId, MilestoneStatus status, String search, Pageable pageable);
    MilestoneResponse approveMilestone(UUID id);
    MilestoneResponse completeMilestone(UUID id);
    void deleteMilestone(UUID id);
}
