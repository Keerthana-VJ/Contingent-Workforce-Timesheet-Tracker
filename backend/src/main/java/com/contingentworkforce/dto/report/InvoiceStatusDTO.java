package com.contingentworkforce.dto.report;

import com.contingentworkforce.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceStatusDTO {
    private InvoiceStatus status;
    private long count;
    private BigDecimal totalAmount;
}
