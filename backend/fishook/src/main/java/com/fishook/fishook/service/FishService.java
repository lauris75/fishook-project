package com.fishook.fishook.service;

import com.fishook.fishook.entity.Fish;

import java.util.List;
import java.util.Optional;

public interface FishService {

    Fish createFish(Fish fish);

    List<Fish> getAllFish();

    Optional<Fish> getFishbyId(Long fishId);

    Optional<Fish> getFishWithLakes(Long fishId);

    String deleteFishById(Long fishId);
}