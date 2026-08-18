package com.contingentworkforce.dto.report;

import com.contingentworkforce.dto.invoice.InvoiceResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BillingReportResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalBilled;
    private BigDecimal totalApproved;
    private BigDecimal totalPaid;
    private BigDecimal totalDiscrepancies;
    private BigDecimal totalTimesheetHours;
    private List<InvoiceResponse> invoices;
}
