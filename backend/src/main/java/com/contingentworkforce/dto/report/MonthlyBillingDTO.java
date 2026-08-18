package com.contingentworkforce.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyBillingDTO {
    private String month; // e.g. "2026-01" or "Jan 2026"
    private BigDecimal amount;
    private BigDecimal hours;
}
