package com.contingentworkforce.dto.contractor;

import com.contingentworkforce.enums.ContractorStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
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
public class ContractorRequest {
    private UUID userId;

    private String name;
    private String email;
    private String phone;

    private UUID vendorId; // Optional if submitted by VENDOR role (auto-resolved from token)

    @NotBlank(message = "Job role is required")
    private String jobRole;

    @NotNull(message = "Hourly rate is required")
    @Positive(message = "Hourly rate must be positive")
    private BigDecimal hourlyRate;

    private LocalDate startDate;
    private LocalDate endDate;
    private ContractorStatus status;
}
