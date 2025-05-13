package com.fishook.fishook.service;

import com.fishook.fishook.dto.UsefulInfoUpdateRequest;
import com.fishook.fishook.entity.UsefulInformation;

import java.util.List;
import java.util.Optional;

public interface UsefulInformationService {

    UsefulInformation createUsefulInformation(UsefulInformation usefulInformation);

    List<UsefulInformation> getAllUsefulInformation();

    Optional<UsefulInformation> getUsefulInformationById(Long usefulInformationId);

    UsefulInformation updateUsefulInformation(Long usefulInformationId, UsefulInfoUpdateRequest updateRequest);

    String deleteUsefulInformation(Long usefulInformationId);
}
