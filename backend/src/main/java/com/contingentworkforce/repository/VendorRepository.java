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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, UUID>, JpaSpecificationExecutor<Vendor> {
    Optional<Vendor> findByEmail(String email);
    Optional<Vendor> findByVendorNameIgnoreCase(String vendorName);
    List<Vendor> findByManagerId(UUID managerId);
    
    @Query("SELECT v FROM Vendor v WHERE " +
           "(:search IS NULL OR LOWER(v.vendorName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(v.email) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR v.status = :status) AND " +
           "(:managerId IS NULL OR v.manager.id = :managerId)")
    Page<Vendor> findWithFilters(@Param("search") String search, 
                                 @Param("status") VendorStatus status, 
                                 @Param("managerId") UUID managerId,
                                 Pageable pageable);
}
