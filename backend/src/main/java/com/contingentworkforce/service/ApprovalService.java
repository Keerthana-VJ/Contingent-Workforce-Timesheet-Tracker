package com.contingentworkforce.service;

import com.contingentworkforce.dto.approval.ApprovalResponse;
import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.entity.User;
import com.contingentworkforce.enums.ApprovalStatus;
import com.contingentworkforce.enums.EntityType;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ApprovalService {
    void recordApproval(EntityType entityType, UUID entityId, User submittedBy, User approvedBy, ApprovalStatus status, String comments);
    List<ApprovalResponse> getApprovalsForEntity(EntityType entityType, UUID entityId);
    PageResponse<ApprovalResponse> getPendingApprovals(Pageable pageable);
    PageResponse<ApprovalResponse> getAllApprovals(Pageable pageable);
}
