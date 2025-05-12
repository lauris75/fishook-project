package com.fishook.fishook.service;

import com.fishook.fishook.entity.Lake;
import com.fishook.fishook.entity.LakeFish;
import com.fishook.fishook.repository.LakeRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LakeServiceImpl implements LakeService {

    private final LakeRepository lakeRepository;
    private final LakeFishService lakeFishService;
    private final FishService fishService;

    public LakeServiceImpl(
            LakeRepository lakeRepository,
            LakeFishService lakeFishService,
            FishService fishService) {
        this.lakeRepository = lakeRepository;
        this.lakeFishService = lakeFishService;
        this.fishService = fishService;
    }

    @Override
    public Lake createLake(Lake lake) {
        return lakeRepository.save(lake);
    }

    @Override
    public List<Lake> getAllLakes() {
        return lakeRepository.findAll();
    }

    @Override
    public Optional<Lake> getLakeById(Long lakeId) {
        return lakeRepository.findById(lakeId);
    }

    @Override
    public Optional<Lake> getLakeWithFish(Long lakeId) {
        Optional<Lake> lakeOpt = lakeRepository.findById(lakeId);

        if (lakeOpt.isPresent()) {
            Lake lake = lakeOpt.get();

            List<LakeFish> lakeFishEntries = lakeFishService.getAllLakeFishByLakeId(lakeId);

            List<Long> fishIds = lakeFishEntries.stream()
                    .map(LakeFish::getFishId)
                    .collect(Collectors.toList());

            if (lake.getFishes() == null) {
                lake.setFishes(new ArrayList<>());
            }

            for (Long fishId : fishIds) {
                fishService.getFishbyId(fishId).ifPresent(fish -> {
                    lakeFishService.getLakeFishByLakeIdAndFishId(lakeId, fishId);
                    lake.getFishes().add(fish);
                });
            }
        }

        return lakeOpt;
    }

    @Override
    public void addFishToLake(Long lakeId, Long fishId) {
        if (!lakeFishService.getLakeFishByLakeIdAndFishId(lakeId, fishId).isPresent()) {
            LakeFish lakeFish = new LakeFish();
            lakeFish.setLakeId(lakeId);
            lakeFish.setFishId(fishId);
            lakeFishService.createLakeFish(lakeFish);
        }
    }

    @Override
    public void removeFishFromLake(Long lakeId, Long fishId) {
        lakeFishService.deleteLakeFishByLakeIdAndFishId(lakeId, fishId);
    }

    @Override
    public String deleteLake(Long lakeId) {
        lakeRepository.deleteById(lakeId);
        return "Deleted";
    }
}