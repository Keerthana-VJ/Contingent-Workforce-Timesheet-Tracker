package com.contingentworkforce.service.impl;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.milestone.MilestoneRequest;
import com.contingentworkforce.dto.milestone.MilestoneResponse;
import com.contingentworkforce.entity.Milestone;
import com.contingentworkforce.entity.Project;
import com.contingentworkforce.entity.User;
import com.contingentworkforce.enums.ApprovalStatus;
import com.contingentworkforce.enums.EntityType;
import com.contingentworkforce.enums.MilestoneStatus;
import com.contingentworkforce.enums.NotificationType;
import com.contingentworkforce.exception.InvalidStateTransitionException;
import com.contingentworkforce.exception.ResourceNotFoundException;

import com.contingentworkforce.repository.MilestoneRepository;
import com.contingentworkforce.repository.ProjectRepository;
import com.contingentworkforce.repository.UserRepository;
import com.contingentworkforce.security.SecurityUtils;
import com.contingentworkforce.service.ApprovalService;
import com.contingentworkforce.service.MilestoneService;
import com.contingentworkforce.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MilestoneServiceImpl implements MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ApprovalService approvalService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public MilestoneResponse createMilestone(MilestoneRequest request) {
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + request.getProjectId()));

        Integer pct = request.getCompletionPercentage() != null ? request.getCompletionPercentage() : 0;
        MilestoneStatus status = request.getStatus();
        if (pct >= 100) {
            status = MilestoneStatus.COMPLETED;
        } else if (status == null) {
            status = (pct > 0) ? MilestoneStatus.IN_PROGRESS : MilestoneStatus.NOT_STARTED;
        }

        Milestone milestone = Milestone.builder()
                .project(project)
                .milestoneName(request.getMilestoneName().trim())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .billingAmount(request.getBillingAmount() != null ? request.getBillingAmount() : BigDecimal.ZERO)
                .completionPercentage(pct)
                .status(status)
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        return mapToMilestoneResponse(saved);
    }

    @Override
    @Transactional
    public MilestoneResponse updateMilestone(UUID id, MilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));

        milestone.setMilestoneName(request.getMilestoneName().trim());
        milestone.setDescription(request.getDescription());
        if (request.getDueDate() != null) milestone.setDueDate(request.getDueDate());
        if (request.getBillingAmount() != null) milestone.setBillingAmount(request.getBillingAmount());

        if (request.getCompletionPercentage() != null) {
            milestone.setCompletionPercentage(request.getCompletionPercentage());
            if (request.getCompletionPercentage() >= 100) {
                milestone.setStatus(MilestoneStatus.COMPLETED);
                // If newly completed, notify Project Manager
                if (milestone.getProject().getManager() != null) {
                    notificationService.createNotification(
                            milestone.getProject().getManager(),
                            "Milestone Completed",
                            String.format("Milestone '%s' for project '%s' reached 100%% completion and is ready for approval.",
                                    milestone.getMilestoneName(), milestone.getProject().getProjectName()),
                            NotificationType.MILESTONE
                    );
                }
            }
        }

        if (request.getStatus() != null && milestone.getCompletionPercentage() < 100) {
            milestone.setStatus(request.getStatus());
        }

        Milestone updated = milestoneRepository.save(milestone);
        return mapToMilestoneResponse(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public MilestoneResponse getMilestoneById(UUID id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));
        return mapToMilestoneResponse(milestone);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MilestoneResponse> getMilestonesByProject(UUID projectId) {
        return milestoneRepository.findByProjectId(projectId).stream()
                .map(this::mapToMilestoneResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MilestoneResponse> getMilestones(UUID projectId, MilestoneStatus status, String search, Pageable pageable) {
        Page<Milestone> page = milestoneRepository.findWithFilters(projectId, status, search, pageable);
        return PageResponse.from(page.map(this::mapToMilestoneResponse));
    }

    @Override
    @Transactional
    public MilestoneResponse approveMilestone(UUID id) {
        Milestone milestone = milestoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));

        if (milestone.getStatus() != MilestoneStatus.COMPLETED && milestone.getCompletionPercentage() < 100) {
            throw new InvalidStateTransitionException("Only completed milestones (100% completion) can be approved");
        }

        User approver = userRepository.findById(SecurityUtils.getCurrentUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Approver user not found"));

        milestone.setStatus(MilestoneStatus.COMPLETED);
        milestone.setApprovedBy(approver);
        milestone.setApprovedAt(LocalDateTime.now());
        Milestone updated = milestoneRepository.save(milestone);

        // Record Approval History
        approvalService.recordApproval(
                EntityType.MILESTONE,
                milestone.getId(),
                null,
                approver,
                ApprovalStatus.APPROVED,
                "Milestone approved by " + approver.getName() + " with billing amount " + milestone.getBillingAmount()
        );

        // Notify Vendor if project is linked to a vendor
        if (milestone.getProject().getVendor() != null && milestone.getProject().getVendor().getEmail() != null) {
            userRepository.findByEmail(milestone.getProject().getVendor().getEmail()).ifPresent(vendorUser ->
                    notificationService.createNotification(
                            vendorUser,
                            "Milestone Approved",
                            String.format("Milestone '%s' for project '%s' has been approved. Billing amount: %s.",
                                    milestone.getMilestoneName(), milestone.getProject().getProjectName(), milestone.getBillingAmount()),
                            NotificationType.MILESTONE
                    )
            );
        }

        return mapToMilestoneResponse(updated);
    }

    @Override
    @Transactional
    public void deleteMilestone(UUID id) {
        if (!milestoneRepository.existsById(id)) {
            throw new ResourceNotFoundException("Milestone not found with id: " + id);
        }
        milestoneRepository.deleteById(id);
    }

    public MilestoneResponse mapToMilestoneResponse(Milestone milestone) {
        if (milestone == null) return null;
        return MilestoneResponse.builder()
                .id(milestone.getId())
                .projectId(milestone.getProject().getId())
                .projectName(milestone.getProject().getProjectName())
                .milestoneName(milestone.getMilestoneName())
                .description(milestone.getDescription())
                .dueDate(milestone.getDueDate())
                .billingAmount(milestone.getBillingAmount())
                .completionPercentage(milestone.getCompletionPercentage())
                .status(milestone.getStatus())
                .approvedBy(milestone.getApprovedBy() != null ? AuthServiceImpl.mapToUserResponse(milestone.getApprovedBy()) : null)
                .approvedAt(milestone.getApprovedAt())
                .createdAt(milestone.getCreatedAt())
                .updatedAt(milestone.getUpdatedAt())
                .build();
    }
}
