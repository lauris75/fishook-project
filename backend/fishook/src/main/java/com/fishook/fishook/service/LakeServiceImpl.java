package com.fishook.fishook.service;

import com.fishook.fishook.dto.LakeUpdateRequest;
import com.fishook.fishook.entity.Lake;
import com.fishook.fishook.entity.LakeFish;
import com.fishook.fishook.repository.LakeRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LakeServiceImpl implements LakeService {

    private final LakeRepository lakeRepository;
    private final LakeFishService lakeFishService;
    private final FishService fishService;

    @PersistenceContext
    private EntityManager entityManager;

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
    public List<Lake> getAllLakesBatch(int offset, int limit) {
        Query query = entityManager.createQuery("SELECT l FROM Lake l ORDER BY l.name ASC");
        query.setFirstResult(offset);
        query.setMaxResults(limit);
        return query.getResultList();
    }

    @Override
    public List<Lake> searchLakesBatch(String searchQuery, int offset, int limit) {
        String searchTerm = "%" + searchQuery.toLowerCase() + "%";

        Query query = entityManager.createQuery(
                "SELECT l FROM Lake l WHERE " +
                        "LOWER(l.name) LIKE :searchTerm OR " +
                        "LOWER(l.summary) LIKE :searchTerm OR " +
                        "LOWER(l.latitude) LIKE :searchTerm OR " +
                        "LOWER(l.longitude) LIKE :searchTerm " +
                        "ORDER BY l.name ASC");

        query.setParameter("searchTerm", searchTerm);
        query.setFirstResult(offset);
        query.setMaxResults(limit);

        return query.getResultList();
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
    @Transactional
    public void addFishToLake(Long lakeId, Long fishId) {
        if (!lakeFishService.getLakeFishByLakeIdAndFishId(lakeId, fishId).isPresent()) {
            LakeFish lakeFish = new LakeFish();
            lakeFish.setLakeId(lakeId);
            lakeFish.setFishId(fishId);
            lakeFishService.createLakeFish(lakeFish);
        }
    }

    @Override
    @Transactional
    public void removeFishFromLake(Long lakeId, Long fishId) {
        lakeFishService.deleteLakeFishByLakeIdAndFishId(lakeId, fishId);
    }

    @Override
    @Transactional
    public Lake updateLake(Long lakeId, LakeUpdateRequest updateRequest) {
        Lake lake = lakeRepository.findById(lakeId)
                .orElseThrow(() -> new ResourceNotFoundException("Lake not found with id: " + lakeId));

        if (updateRequest.getName() != null && !updateRequest.getName().isEmpty()) {
            lake.setName(updateRequest.getName());
        }

        if (updateRequest.getSummary() != null && !updateRequest.getSummary().isEmpty()) {
            lake.setSummary(updateRequest.getSummary());
        }

        if (updateRequest.getDescription() != null && !updateRequest.getDescription().isEmpty()) {
            lake.setDescription(updateRequest.getDescription());
        }

        if (updateRequest.getLatitude() != null && !updateRequest.getLatitude().isEmpty()) {
            lake.setLatitude(updateRequest.getLatitude());
        }

        if (updateRequest.getLongitude() != null && !updateRequest.getLongitude().isEmpty()) {
            lake.setLongitude(updateRequest.getLongitude());
        }

        if (updateRequest.getArea() != null) {
            lake.setArea(updateRequest.getArea());
        }

        if (updateRequest.getCoastlineLength() != null) {
            lake.setCoastlineLength(updateRequest.getCoastlineLength());
        }

        return lakeRepository.save(lake);
    }

    @Override
    @Transactional
    public String deleteLake(Long lakeId) {
        lakeRepository.deleteById(lakeId);
        return "Deleted";
    }
}