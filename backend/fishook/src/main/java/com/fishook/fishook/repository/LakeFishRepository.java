package com.fishook.fishook.repository;

import com.fishook.fishook.entity.LakeFish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface LakeFishRepository extends JpaRepository<LakeFish, Long> {

    List<LakeFish> findAllByLakeId(Long lakeId);

    List<LakeFish> findAllByFishId(Long fishId);

    Optional<LakeFish> findByLakeIdAndFishId(Long lakeId, Long fishId);

    void deleteByLakeIdAndFishId(Long lakeId, Long fishId);
}