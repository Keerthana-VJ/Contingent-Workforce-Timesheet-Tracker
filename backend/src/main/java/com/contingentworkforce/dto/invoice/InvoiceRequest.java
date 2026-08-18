package com.contingentworkforce.dto.invoice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {
    @NotBlank(message = "Invoice number is required")
    private String invoiceNumber;

    private UUID vendorId; // Optional if submitted by VENDOR role (inferred from token)

    @NotNull(message = "Project ID is required")
    private UUID projectId;

    @NotNull(message = "Billing period start date is required")
    private LocalDate billingPeriodStart;

    @NotNull(message = "Billing period end date is required")
    private LocalDate billingPeriodEnd;

    @NotNull(message = "Subtotal is required")
    @PositiveOrZero(message = "Subtotal cannot be negative")
    private BigDecimal subtotal;

    @NotNull(message = "Tax amount is required")
    @PositiveOrZero(message = "Tax amount cannot be negative")
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;

    @NotNull(message = "Total amount is required")
    @PositiveOrZero(message = "Total amount cannot be negative")
    private BigDecimal totalAmount;
}
