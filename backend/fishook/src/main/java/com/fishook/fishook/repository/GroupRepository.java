package com.fishook.fishook.repository;

import com.fishook.fishook.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface GroupRepository extends JpaRepository<Group, Long> {
    List<Group> getGroupByOwnerId(Long ownerId);
}
