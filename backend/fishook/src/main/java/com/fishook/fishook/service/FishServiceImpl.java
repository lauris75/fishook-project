package com.fishook.fishook.service;

import com.fishook.fishook.dto.FishUpdateRequest;
import com.fishook.fishook.entity.Fish;
import com.fishook.fishook.entity.LakeFish;
import com.fishook.fishook.repository.FishRepository;
import com.fishook.fishook.repository.LakeRepository;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FishServiceImpl implements FishService {

    private final FishRepository fishRepository;
    private final LakeFishService lakeFishService;
    private final LakeRepository lakeRepository;

    public FishServiceImpl(
            FishRepository fishRepository,
            LakeFishService lakeFishService,
            LakeRepository lakeRepository) {
        this.fishRepository = fishRepository;
        this.lakeFishService = lakeFishService;
        this.lakeRepository = lakeRepository;
    }

    @Override
    public Fish createFish(Fish fish) {
        return fishRepository.save(fish);
    }

    @Override
    public List<Fish> getAllFish() {
        return fishRepository.findAll();
    }

    @Override
    public Optional<Fish> getFishbyId(Long fishId) {
        return fishRepository.findById(fishId);
    }

    @Override
    public Optional<Fish> getFishWithLakes(Long fishId) {
        Optional<Fish> fishOpt = fishRepository.findById(fishId);

        if (fishOpt.isPresent()) {
            Fish fish = fishOpt.get();

            List<LakeFish> lakeFishEntries = lakeFishService.getAllLakeFishByFishId(fishId);

            List<Long> lakeIds = lakeFishEntries.stream()
                    .map(LakeFish::getLakeId)
                    .collect(Collectors.toList());

            if (fish.getLakes() == null) {
                fish.setLakes(new ArrayList<>());
            }

            for (Long lakeId : lakeIds) {
                lakeRepository.findById(lakeId).ifPresent(lake -> {
                    lakeFishService.getLakeFishByLakeIdAndFishId(lakeId, fishId);

                    fish.getLakes().add(lake);
                });
            }
        }

        return fishOpt;
    }

    @Override
    public Fish updateFish(Long fishId, FishUpdateRequest updateRequest) {
        Fish fish = fishRepository.findById(fishId)
                .orElseThrow(() -> new ResourceNotFoundException("Fish not found with id: " + fishId));

        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            fish.setName(updateRequest.getName());
        }

        if (updateRequest.getSummary() != null && !updateRequest.getSummary().isEmpty()) {
            fish.setSummary(updateRequest.getSummary());
        }

        if (updateRequest.getDescription() != null && !updateRequest.getDescription().isEmpty()) {
            fish.setDescription(updateRequest.getDescription());
        }

        return fishRepository.save(fish);
    }

    @Override
    public String deleteFishById(Long fishId) {
        fishRepository.deleteById(fishId);
        return "Deleted";
    }
}