package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Contractor;
import com.contingentworkforce.enums.ContractorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractorRepository extends JpaRepository<Contractor, UUID>, JpaSpecificationExecutor<Contractor> {
    Optional<Contractor> findByUserId(UUID userId);
    List<Contractor> findByVendorId(UUID vendorId);
    List<Contractor> findByVendorIdAndStatus(UUID vendorId, ContractorStatus status);
    
    @Query("SELECT c FROM Contractor c JOIN c.user u WHERE " +
           "(:vendorId IS NULL OR c.vendor.id = :vendorId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:search IS NULL OR LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.jobRole) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Contractor> findWithFilters(@Param("vendorId") UUID vendorId,
                                     @Param("status") ContractorStatus status,
                                     @Param("search") String search,
                                     Pageable pageable);
}
