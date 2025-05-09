package com.fishook.fishook.service;

import com.fishook.fishook.entity.Lake;

import java.util.List;
import java.util.Optional;

public interface LakeService {

    Lake createLake(Lake lake);

    List<Lake> getAllLakes();

    Optional<Lake> getLakeById(Long lakeId);

    String deleteLake(Long lakeId);
}
