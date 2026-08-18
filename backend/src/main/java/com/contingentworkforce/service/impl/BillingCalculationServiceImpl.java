package com.contingentworkforce.service.impl;

import com.contingentworkforce.entity.InvoiceItem;
import com.contingentworkforce.entity.Milestone;
import com.contingentworkforce.entity.Timesheet;
import com.contingentworkforce.enums.InvoiceItemType;
import com.contingentworkforce.enums.TimesheetStatus;
import com.contingentworkforce.repository.MilestoneRepository;
import com.contingentworkforce.repository.TimesheetRepository;
import com.contingentworkforce.service.BillingCalculationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillingCalculationServiceImpl implements BillingCalculationService {

    private final TimesheetRepository timesheetRepository;
    private final MilestoneRepository milestoneRepository;

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateApprovedTimesheetBilling(UUID projectId, LocalDate startDate, LocalDate endDate) {
        List<Timesheet> timesheets = timesheetRepository.findByProjectIdAndStatusAndWorkDateBetween(
                projectId, TimesheetStatus.APPROVED, startDate, endDate
        );

        BigDecimal total = BigDecimal.ZERO;
        for (Timesheet t : timesheets) {
            BigDecimal hours = t.getTotalHours();
            BigDecimal rate = t.getContractor().getHourlyRate();
            BigDecimal timesheetCost = hours.multiply(rate);
            total = total.add(timesheetCost);
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateApprovedMilestoneBilling(UUID projectId, LocalDate startDate, LocalDate endDate) {
        List<Milestone> milestones = milestoneRepository.findApprovedMilestonesForBilling(projectId, startDate, endDate);

        BigDecimal total = BigDecimal.ZERO;
        for (Milestone m : milestones) {
            if (m.getBillingAmount() != null) {
                total = total.add(m.getBillingAmount());
            }
        }
        return total.setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public BigDecimal calculateTotalBilling(UUID projectId, LocalDate startDate, LocalDate endDate) {
        BigDecimal timesheetBilling = calculateApprovedTimesheetBilling(projectId, startDate, endDate);
        BigDecimal milestoneBilling = calculateApprovedMilestoneBilling(projectId, startDate, endDate);
        return timesheetBilling.add(milestoneBilling).setScale(2, RoundingMode.HALF_UP);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceItem> generateInvoiceItemsForPeriod(UUID projectId, LocalDate startDate, LocalDate endDate) {
        List<InvoiceItem> items = new ArrayList<>();

        // 1. Process Approved Timesheets
        List<Timesheet> timesheets = timesheetRepository.findByProjectIdAndStatusAndWorkDateBetween(
                projectId, TimesheetStatus.APPROVED, startDate, endDate
        );

        for (Timesheet t : timesheets) {
            BigDecimal hours = t.getTotalHours();
            BigDecimal rate = t.getContractor().getHourlyRate();
            BigDecimal amount = hours.multiply(rate).setScale(2, RoundingMode.HALF_UP);

            String desc = String.format("Timesheet: %s (%s) - %s (%.2f hrs @ %s/hr)",
                    t.getContractor().getUser().getName(),
                    t.getContractor().getJobRole(),
                    t.getWorkDate(),
                    hours,
                    rate);

            items.add(InvoiceItem.builder()
                    .itemType(InvoiceItemType.TIMESHEET)
                    .referenceId(t.getId())
                    .description(desc)
                    .quantity(hours)
                    .rate(rate)
                    .amount(amount)
                    .build());
        }

        // 2. Process Approved Milestones
        List<Milestone> milestones = milestoneRepository.findApprovedMilestonesForBilling(projectId, startDate, endDate);
        for (Milestone m : milestones) {
            BigDecimal amount = m.getBillingAmount() != null ? m.getBillingAmount() : BigDecimal.ZERO;
            String desc = String.format("Milestone: %s (Completed & Approved)", m.getMilestoneName());

            items.add(InvoiceItem.builder()
                    .itemType(InvoiceItemType.MILESTONE)
                    .referenceId(m.getId())
                    .description(desc)
                    .quantity(BigDecimal.ONE)
                    .rate(amount)
                    .amount(amount)
                    .build());
        }

        return items;
    }
}
