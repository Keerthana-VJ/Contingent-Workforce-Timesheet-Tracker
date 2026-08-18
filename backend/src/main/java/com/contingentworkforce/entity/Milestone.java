package com.contingentworkforce.entity;

import com.contingentworkforce.enums.MilestoneStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "milestone_name", nullable = false)
    private String milestoneName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "assigned_days")
    @Builder.Default
    private Integer assignedDays = 10;

    @Column(name = "billing_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal billingAmount = BigDecimal.ZERO;

    @Column(name = "completion_percentage", nullable = false)
    @Builder.Default
    private Integer completionPercentage = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private MilestoneStatus status = MilestoneStatus.NOT_STARTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = MilestoneStatus.NOT_STARTED;
        }
        if (completionPercentage == null) {
            completionPercentage = 0;
        }
        if (completionPercentage >= 100) {
            status = MilestoneStatus.COMPLETED;
        }
        if (billingAmount == null) {
            billingAmount = BigDecimal.ZERO;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if (completionPercentage != null && completionPercentage >= 100 && status != MilestoneStatus.COMPLETED) {
            status = MilestoneStatus.COMPLETED;
        }
    }
}
