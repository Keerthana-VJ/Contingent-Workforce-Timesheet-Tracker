package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Vendor;
import com.contingentworkforce.enums.VendorStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID>, JpaSpecificationExecutor<Vendor> {
    Optional<Vendor> findByEmail(String email);
    Optional<Vendor> findByVendorNameIgnoreCase(String vendorName);
    
    @Query("SELECT v FROM Vendor v WHERE " +
           "(:search IS NULL OR LOWER(v.vendorName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR v.status = :status)")
    Page<Vendor> findWithFilters(@Param("search") String search, 
                                 @Param("status") VendorStatus status, 
                                 Pageable pageable);
}
