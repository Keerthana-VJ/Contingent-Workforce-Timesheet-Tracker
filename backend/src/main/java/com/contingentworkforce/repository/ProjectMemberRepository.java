package com.contingentworkforce.repository;

import com.contingentworkforce.entity.ProjectMember;
import com.contingentworkforce.enums.MemberStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    List<ProjectMember> findByProjectId(UUID projectId);
    List<ProjectMember> findByContractorId(UUID contractorId);
    List<ProjectMember> findByContractorIdAndStatus(UUID contractorId, MemberStatus status);
    Optional<ProjectMember> findByProjectIdAndContractorId(UUID projectId, UUID contractorId);
    boolean existsByProjectIdAndContractorId(UUID projectId, UUID contractorId);
}
