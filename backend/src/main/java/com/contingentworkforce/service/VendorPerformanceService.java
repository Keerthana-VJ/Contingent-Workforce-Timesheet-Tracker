package com.contingentworkforce.service;

import com.contingentworkforce.dto.report.VendorPerformanceDTO;

import java.util.List;
import java.util.UUID;

public interface VendorPerformanceService {
    VendorPerformanceDTO calculateVendorPerformance(UUID vendorId);
    List<VendorPerformanceDTO> getAllVendorPerformances();
}
