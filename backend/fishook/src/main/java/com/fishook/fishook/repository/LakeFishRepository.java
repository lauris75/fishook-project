package com.fishook.fishook.repository;

import com.fishook.fishook.entity.LakeFish;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface LakeFishRepository extends JpaRepository<LakeFish, Long> {

    List<LakeFish> findAllByLakeId(Long lakeId);

    List<LakeFish> findAllByFishId(Long fishId);

    Optional<LakeFish> findByLakeIdAndFishId(Long lakeId, Long fishId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LakeFish lf WHERE lf.lakeId = :lakeId AND lf.fishId = :fishId")
    void deleteByLakeIdAndFishId(@Param("lakeId") Long lakeId, @Param("fishId") Long fishId);
}