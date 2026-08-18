package com.contingentworkforce.dto.contractor;

import com.contingentworkforce.dto.auth.UserResponse;
import com.contingentworkforce.dto.vendor.VendorResponse;
import com.contingentworkforce.enums.ContractorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractorResponse {
    private UUID id;
    private UserResponse user;
    private VendorResponse vendor;
    private String jobRole;
    private BigDecimal hourlyRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private ContractorStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
