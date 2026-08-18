package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Milestone;
import com.contingentworkforce.enums.MilestoneStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID>, JpaSpecificationExecutor<Milestone> {
    
    List<Milestone> findByProjectId(UUID projectId);
    
    List<Milestone> findByProjectIdAndStatus(UUID projectId, MilestoneStatus status);

    @Query("SELECT m FROM Milestone m WHERE " +
           "m.project.id = :projectId AND " +
           "m.status = 'COMPLETED' AND " +
           "m.approvedBy IS NOT NULL AND " +
           "(:startDate IS NULL OR m.dueDate >= :startDate) AND " +
           "(:endDate IS NULL OR m.dueDate <= :endDate)")
    List<Milestone> findApprovedMilestonesForBilling(@Param("projectId") UUID projectId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    @Query("SELECT m FROM Milestone m WHERE " +
           "(:projectId IS NULL OR m.project.id = :projectId) AND " +
           "(:projectIds IS NULL OR m.project.id IN :projectIds) AND " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:search IS NULL OR LOWER(m.milestoneName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Milestone> findWithFiltersAndProjectIds(@Param("projectId") UUID projectId,
                                                 @Param("projectIds") List<UUID> projectIds,
                                                 @Param("status") MilestoneStatus status,
                                                 @Param("search") String search,
                                                 Pageable pageable);

    @Query("SELECT m FROM Milestone m WHERE " +
           "(:projectId IS NULL OR m.project.id = :projectId) AND " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:search IS NULL OR LOWER(m.milestoneName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Milestone> findWithFilters(@Param("projectId") UUID projectId,
                                    @Param("status") MilestoneStatus status,
                                    @Param("search") String search,
                                    Pageable pageable);
}
