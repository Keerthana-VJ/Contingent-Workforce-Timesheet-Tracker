package com.contingentworkforce.dto.invoice;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.dto.vendor.VendorResponse;
import com.contingentworkforce.enums.InvoiceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private VendorResponse vendor;
    private UUID projectId;
    private String projectName;
    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal totalAmount;
    private BigDecimal calculatedAmount;
    private BigDecimal differenceAmount;
    private InvoiceStatus status;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private UserResponse approvedBy;
    private LocalDateTime paidAt;
    private List<InvoiceItemResponse> items;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
