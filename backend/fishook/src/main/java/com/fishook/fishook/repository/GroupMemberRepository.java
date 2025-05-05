package com.fishook.fishook.repository;

import com.fishook.fishook.entity.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {

    List<GroupMember> getAllByGroupId(Long groupId);

    Optional<GroupMember> findByGroupIdAndUserId(Long groupId, Long userId);
}
