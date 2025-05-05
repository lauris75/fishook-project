package com.fishook.fishook.service;

import com.fishook.fishook.entity.Lake;
import com.fishook.fishook.repository.LakeRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LakeServiceImpl implements LakeService {

    private final LakeRepository lakeRepository;

    public LakeServiceImpl(LakeRepository lakeRepository) {
        this.lakeRepository = lakeRepository;
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
    public String deleteLake(Long lakeId) {
        lakeRepository.deleteById(lakeId);
        return "Deleted";
    }
}
