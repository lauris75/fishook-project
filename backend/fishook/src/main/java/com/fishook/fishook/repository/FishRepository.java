package com.fishook.fishook.repository;

import com.fishook.fishook.entity.Fish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

@RepositoryRestResource(exported = false)
public interface FishRepository extends JpaRepository<Fish, Long> {
}
