package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Timesheet;
import com.contingentworkforce.enums.TimesheetStatus;
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
public interface TimesheetRepository extends JpaRepository<Timesheet, UUID>, JpaSpecificationExecutor<Timesheet> {

       Optional<Timesheet> findByContractorIdAndProjectIdAndWorkDate(UUID contractorId, UUID projectId,
                     LocalDate workDate);

       List<Timesheet> findByProjectIdAndStatusAndWorkDateBetween(UUID projectId, TimesheetStatus status,
                     LocalDate start, LocalDate end);

       List<Timesheet> findByContractorIdAndWorkDateBetween(UUID contractorId, LocalDate start, LocalDate end);

       List<Timesheet> findByMilestoneId(UUID milestoneId);

       @Query("SELECT COUNT(DISTINCT t.workDate) FROM Timesheet t WHERE t.milestone.id = :milestoneId AND t.status != 'REJECTED'")
       Long countDistinctWorkDaysByMilestoneId(@Param("milestoneId") UUID milestoneId);

       @Query("SELECT COALESCE(SUM(t.totalHours), 0) FROM Timesheet t WHERE t.milestone.id = :milestoneId AND t.status != 'REJECTED'")
       Double sumTotalHoursByMilestoneId(@Param("milestoneId") UUID milestoneId);

       long countByStatus(TimesheetStatus status);

       @Query("SELECT SUM(t.totalHours) FROM Timesheet t WHERE t.contractor.id = :contractorId AND t.workDate = :workDate AND t.status != 'REJECTED'")
       Double sumTotalHoursByContractorIdAndWorkDate(@Param("contractorId") UUID contractorId,
                     @Param("workDate") LocalDate workDate);

       @Query("SELECT SUM(t.totalHours) FROM Timesheet t WHERE t.contractor.id = :contractorId AND t.workDate BETWEEN :start AND :end AND t.status != 'REJECTED'")
       Double sumTotalHoursByContractorIdAndWorkDateBetween(@Param("contractorId") UUID contractorId,
                     @Param("start") LocalDate start, @Param("end") LocalDate end);

       @Query("SELECT t FROM Timesheet t WHERE " +
                     "(:contractorId IS NULL OR t.contractor.id = :contractorId) AND " +
                     "(:vendorId IS NULL OR t.contractor.vendor.id = :vendorId) AND " +
                     "(:projectId IS NULL OR t.project.id = :projectId) AND " +
                     "(:status IS NULL OR t.status = :status) AND " +
                     "(:startDate IS NULL OR t.workDate >= :startDate) AND " +
                     "(:endDate IS NULL OR t.workDate <= :endDate)")
       Page<Timesheet> findWithFilters(@Param("contractorId") UUID contractorId,
                     @Param("vendorId") UUID vendorId,
                     @Param("projectId") UUID projectId,
                     @Param("status") TimesheetStatus status,
                     @Param("startDate") LocalDate startDate,
                     @Param("endDate") LocalDate endDate,
                     Pageable pageable);
}