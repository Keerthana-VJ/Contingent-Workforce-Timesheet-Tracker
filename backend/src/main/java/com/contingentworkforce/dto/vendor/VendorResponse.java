package com.contingentworkforce.dto.vendor;

import com.contingentworkforce.enums.VendorStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorResponse {
    private UUID id;
    private String vendorName;
    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private VendorStatus status;
    private int contractorCount;
    private UUID managerId;
    private String managerName;
    private String managerEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
