package com.contingentworkforce.service;

import com.contingentworkforce.dto.common.PageResponse;
import com.contingentworkforce.dto.contractor.ContractorRequest;
import com.contingentworkforce.dto.contractor.ContractorResponse;
import com.contingentworkforce.enums.ContractorStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ContractorService {
    ContractorResponse createContractor(ContractorRequest request);
    ContractorResponse updateContractor(UUID id, ContractorRequest request);
    ContractorResponse getContractorById(UUID id);
    ContractorResponse getContractorByUserId(UUID userId);
    PageResponse<ContractorResponse> getContractors(UUID vendorId, ContractorStatus status, String search, Pageable pageable);
    List<ContractorResponse> getContractorsByVendor(UUID vendorId);
    void deleteContractor(UUID id);
}
