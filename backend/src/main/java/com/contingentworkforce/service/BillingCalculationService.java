package com.contingentworkforce.service;

import com.contingentworkforce.entity.InvoiceItem;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface BillingCalculationService {
    BigDecimal calculateApprovedTimesheetBilling(UUID projectId, LocalDate startDate, LocalDate endDate);
    BigDecimal calculateApprovedMilestoneBilling(UUID projectId, LocalDate startDate, LocalDate endDate);
    BigDecimal calculateTotalBilling(UUID projectId, LocalDate startDate, LocalDate endDate);
    List<InvoiceItem> generateInvoiceItemsForPeriod(UUID projectId, LocalDate startDate, LocalDate endDate);
}
