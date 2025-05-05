package com.fishook.fishook.service;

import com.fishook.fishook.entity.UsefulInformation;
import com.fishook.fishook.repository.UsefulInformationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UsefulInformationServiceImpl implements UsefulInformationService {

    private final UsefulInformationRepository usefulInformationRepository;


    public UsefulInformationServiceImpl(UsefulInformationRepository usefulInformationRepository) {
        this.usefulInformationRepository = usefulInformationRepository;
    }

    @Override
    public UsefulInformation createUsefulInformation(UsefulInformation usefulInformation) {
        return usefulInformationRepository.save(usefulInformation);
    }

    @Override
    public List<UsefulInformation> getAllUsefulInformation() {
        return usefulInformationRepository.findAll();
    }

    @Override
    public Optional<UsefulInformation> getUsefulInformationById(Long usefulInformationId) {
        return usefulInformationRepository.findById(usefulInformationId);
    }

    @Override
    public String deleteUsefulInformation(Long usefulInformationId) {
        usefulInformationRepository.deleteById(usefulInformationId);
        return "Deleted";
    }
}
