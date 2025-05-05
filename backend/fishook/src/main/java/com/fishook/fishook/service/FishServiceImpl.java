package com.fishook.fishook.service;

import com.fishook.fishook.entity.Fish;
import com.fishook.fishook.repository.FishRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FishServiceImpl implements FishService {

    private final FishRepository fishRepository;


    public FishServiceImpl(FishRepository fishRepository) {
        this.fishRepository = fishRepository;
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
    public String deleteFishById(Long fishId) {
        fishRepository.deleteById(fishId);
        return "Deleted";
    }
}
