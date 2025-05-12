package com.fishook.fishook.service;

import com.fishook.fishook.entity.LakeFish;

import java.util.List;
import java.util.Optional;

public interface LakeFishService {

    LakeFish createLakeFish(LakeFish lakeFish);

    List<LakeFish> getAllLakeFish();

    List<LakeFish> getAllLakeFishByLakeId(Long lakeId);

    List<LakeFish> getAllLakeFishByFishId(Long fishId);

    Optional<LakeFish> getLakeFishByLakeIdAndFishId(Long lakeId, Long fishId);

    String deleteLakeFish(Long lakeFishId);

    String deleteLakeFishByLakeIdAndFishId(Long lakeId, Long fishId);
}