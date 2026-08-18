package com.contingentworkforce.dto.invoice;

import com.contingentworkforce.enums.InvoiceItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceItemResponse {
    private UUID id;
    private UUID invoiceId;
    private InvoiceItemType itemType;
    private UUID referenceId;
    private String description;
    private BigDecimal quantity;
    private BigDecimal rate;
    private BigDecimal amount;
}
