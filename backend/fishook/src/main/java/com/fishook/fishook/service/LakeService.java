package com.fishook.fishook.service;

import com.fishook.fishook.dto.LakeUpdateRequest;
import com.fishook.fishook.entity.Lake;

import java.util.List;
import java.util.Optional;

public interface LakeService {

    Lake createLake(Lake lake);

    List<Lake> getAllLakes();

    Optional<Lake> getLakeById(Long lakeId);

    Optional<Lake> getLakeWithFish(Long lakeId);

    void addFishToLake(Long lakeId, Long fishId);

    void removeFishFromLake(Long lakeId, Long fishId);

    Lake updateLake(Long lakeId, LakeUpdateRequest updateRequest);

    String deleteLake(Long lakeId);

    List<Lake> getAllLakesBatch(int offset, int limit);

    List<Lake> searchLakesBatch(String query, int offset, int limit);
}