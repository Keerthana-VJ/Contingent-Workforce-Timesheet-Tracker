package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Invoice;
import com.contingentworkforce.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, UUID>, JpaSpecificationExecutor<Invoice> {
    
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsByInvoiceNumber(String invoiceNumber);
    
    List<Invoice> findByVendorId(UUID vendorId);
    List<Invoice> findByProjectId(UUID projectId);
    List<Invoice> findByStatus(InvoiceStatus status);
    long countByStatus(InvoiceStatus status);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:vendorId IS NULL OR i.vendor.id = :vendorId) AND " +
           "(:projectId IS NULL OR i.project.id = :projectId) AND " +
           "(:status IS NULL OR i.status = :status) AND " +
           "(:startDate IS NULL OR i.billingPeriodStart >= :startDate) AND " +
           "(:endDate IS NULL OR i.billingPeriodEnd <= :endDate)")
    Page<Invoice> findWithFilters(@Param("vendorId") UUID vendorId,
                                  @Param("projectId") UUID projectId,
                                  @Param("status") InvoiceStatus status,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate,
                                  Pageable pageable);
}
