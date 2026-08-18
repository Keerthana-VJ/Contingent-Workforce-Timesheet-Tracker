package com.contingentworkforce.dto.vendor;

import com.contingentworkforce.enums.VendorStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VendorRequest {
    @NotBlank(message = "Vendor name is required")
    private String vendorName;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String email;

    private String phone;
    private String address;
    private LocalDate contractStartDate;
    private LocalDate contractEndDate;
    private VendorStatus status;
    private UUID managerId; // Assigned Manager for this Vendor
    private String password; // Optional login password for vendor user account
}
