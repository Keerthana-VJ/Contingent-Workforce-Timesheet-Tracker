package com.contingentworkforce;

import com.contingentworkforce.entity.*;
import com.contingentworkforce.enums.MilestoneStatus;
import com.contingentworkforce.enums.Role;
import com.contingentworkforce.enums.TimesheetStatus;
import com.contingentworkforce.repository.MilestoneRepository;
import com.contingentworkforce.repository.TimesheetRepository;
import com.contingentworkforce.service.impl.BillingCalculationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillingCalculationTests {

    @Mock
    private TimesheetRepository timesheetRepository;
    @Mock
    private MilestoneRepository milestoneRepository;

    @InjectMocks
    private BillingCalculationServiceImpl billingCalculationService;

    private Project testProject;
    private Contractor contractor1;
    private Contractor contractor2;
    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        UUID projId = UUID.randomUUID();
        testProject = Project.builder().id(projId).projectName("Enterprise AI").build();

        User user1 = User.builder().id(UUID.randomUUID()).name("John").role(Role.CONTRACTOR).build();
        User user2 = User.builder().id(UUID.randomUUID()).name("Sarah").role(Role.CONTRACTOR).build();

        contractor1 = Contractor.builder().id(UUID.randomUUID()).user(user1).hourlyRate(BigDecimal.valueOf(500.00)).jobRole("Dev").build();
        contractor2 = Contractor.builder().id(UUID.randomUUID()).user(user2).hourlyRate(BigDecimal.valueOf(800.00)).jobRole("Architect").build();

        startDate = LocalDate.of(2026, 1, 1);
        endDate = LocalDate.of(2026, 1, 31);
    }

    @Test
    @DisplayName("Should accurately calculate timesheet billing: 160 hrs * 500 = 80,000")
    void testApprovedTimesheetBillingCalculation() {
        Timesheet t1 = Timesheet.builder()
                .contractor(contractor1)
                .project(testProject)
                .workDate(LocalDate.of(2026, 1, 10))
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(17, 0))
                .breakHours(BigDecimal.ZERO)
                .totalHours(BigDecimal.valueOf(160.00))
                .status(TimesheetStatus.APPROVED)
                .build();

        when(timesheetRepository.findByProjectIdAndStatusAndWorkDateBetween(testProject.getId(), TimesheetStatus.APPROVED, startDate, endDate))
                .thenReturn(List.of(t1));

        BigDecimal result = billingCalculationService.calculateApprovedTimesheetBilling(testProject.getId(), startDate, endDate);

        assertEquals(0, BigDecimal.valueOf(80000.00).compareTo(result));
    }

    @Test
    @DisplayName("Should accurately calculate total billing combining timesheets and approved milestones")
    void testCombinedTotalBillingCalculation() {
        // Timesheet 1: 10 hrs * 500 = 5,000
        Timesheet t1 = Timesheet.builder()
                .contractor(contractor1)
                .project(testProject)
                .totalHours(BigDecimal.valueOf(10.00))
                .status(TimesheetStatus.APPROVED)
                .build();

        // Timesheet 2: 10 hrs * 800 = 8,000
        Timesheet t2 = Timesheet.builder()
                .contractor(contractor2)
                .project(testProject)
                .totalHours(BigDecimal.valueOf(10.00))
                .status(TimesheetStatus.APPROVED)
                .build();

        when(timesheetRepository.findByProjectIdAndStatusAndWorkDateBetween(testProject.getId(), TimesheetStatus.APPROVED, startDate, endDate))
                .thenReturn(List.of(t1, t2));

        // Milestone: 50,000
        Milestone m1 = Milestone.builder()
                .project(testProject)
                .milestoneName("Phase 1 Deliverable")
                .billingAmount(BigDecimal.valueOf(50000.00))
                .completionPercentage(100)
                .status(MilestoneStatus.COMPLETED)
                .build();

        when(milestoneRepository.findApprovedMilestonesForBilling(testProject.getId(), startDate, endDate))
                .thenReturn(List.of(m1));

        BigDecimal total = billingCalculationService.calculateTotalBilling(testProject.getId(), startDate, endDate);

        // Expected: 5,000 + 8,000 + 50,000 = 63,000.00
        assertEquals(0, BigDecimal.valueOf(63000.00).compareTo(total));
    }
}
