package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.vendor.VendorRequest;
import com.contingentworkforce.dto.vendor.VendorResponse;
import com.contingentworkforce.enums.VendorStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VendorService {
    VendorResponse createVendor(VendorRequest request);
    VendorResponse updateVendor(UUID id, VendorRequest request);
    VendorResponse getVendorById(UUID id);
    PageResponse<VendorResponse> getVendors(UUID managerId, String search, VendorStatus status, Pageable pageable);
    List<VendorResponse> getAllVendorsList();
    void deleteVendor(UUID id);
}
