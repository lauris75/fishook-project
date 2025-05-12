package com.fishook.fishook.service;

import com.fishook.fishook.entity.LakeFish;
import com.fishook.fishook.repository.LakeFishRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LakeFishServiceImpl implements LakeFishService {

    private final LakeFishRepository lakeFishRepository;

    public LakeFishServiceImpl(LakeFishRepository lakeFishRepository) {
        this.lakeFishRepository = lakeFishRepository;
    }

    @Override
    public LakeFish createLakeFish(LakeFish lakeFish) {
        return lakeFishRepository.save(lakeFish);
    }

    @Override
    public List<LakeFish> getAllLakeFish() {
        return lakeFishRepository.findAll();
    }

    @Override
    public List<LakeFish> getAllLakeFishByLakeId(Long lakeId) {
        return lakeFishRepository.findAllByLakeId(lakeId);
    }

    @Override
    public List<LakeFish> getAllLakeFishByFishId(Long fishId) {
        return lakeFishRepository.findAllByFishId(fishId);
    }

    @Override
    public Optional<LakeFish> getLakeFishByLakeIdAndFishId(Long lakeId, Long fishId) {
        return lakeFishRepository.findByLakeIdAndFishId(lakeId, fishId);
    }

    @Override
    public String deleteLakeFish(Long lakeFishId) {
        lakeFishRepository.deleteById(lakeFishId);
        return "Deleted";
    }

    @Override
    public String deleteLakeFishByLakeIdAndFishId(Long lakeId, Long fishId) {
        lakeFishRepository.deleteByLakeIdAndFishId(lakeId, fishId);
        return "Deleted";
    }
}