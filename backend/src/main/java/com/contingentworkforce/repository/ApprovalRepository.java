package com.contingentworkforce.repository;

import com.contingentworkforce.entity.Approval;
import com.contingentworkforce.enums.ApprovalStatus;
import com.contingentworkforce.enums.EntityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApprovalRepository extends JpaRepository<Approval, UUID>, JpaSpecificationExecutor<Approval> {
    List<Approval> findByEntityTypeAndEntityIdOrderByCreatedAtDesc(EntityType entityType, UUID entityId);
    Page<Approval> findByStatus(ApprovalStatus status, Pageable pageable);
    Page<Approval> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
