package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Project;
import com.contingentworkforce.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
    List<Project> findByManagerId(UUID managerId);
    List<Project> findByVendorId(UUID vendorId);
    long countByStatus(ProjectStatus status);

    @Query("SELECT p FROM Project p WHERE " +
           "(:vendorId IS NULL OR p.vendor.id = :vendorId) AND " +
           "(:managerId IS NULL OR p.manager.id = :managerId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:search IS NULL OR LOWER(p.projectName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.clientName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Project> findWithFilters(@Param("vendorId") UUID vendorId,
                                  @Param("managerId") UUID managerId,
                                  @Param("status") ProjectStatus status,
                                  @Param("search") String search,
                                  Pageable pageable);
}
