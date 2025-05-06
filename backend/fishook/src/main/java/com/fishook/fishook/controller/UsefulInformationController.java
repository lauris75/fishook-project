package com.fishook.fishook.controller;

import com.fishook.fishook.entity.UsefulInformation;
import com.fishook.fishook.service.UsefulInformationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("UsefulInformation")
@Tag(name = "Usefull Info")
public class UsefulInformationController {

    @Autowired
    private UsefulInformationService usefulInformationService;

    @PostMapping
    public ResponseEntity createUsefulInformation(@RequestBody UsefulInformation usefulInformation) {
        return new ResponseEntity(usefulInformationService.createUsefulInformation(usefulInformation), HttpStatus.CREATED);
    }

    @GetMapping
    public List<UsefulInformation> getAllUsefulInformation() {
        return usefulInformationService.getAllUsefulInformation().stream().map(p -> new UsefulInformation(p.getId(), p.getName(), p.getSummary(), p.getDescription(), p.getPhotoURL())).collect(Collectors.toList());
    }

    @GetMapping("/{usefulInformationId}")
    public Optional<UsefulInformation> getUsefulInformationById(@PathVariable Long usefulInformationId) {
        return usefulInformationService.getUsefulInformationById(usefulInformationId);
    }

    @DeleteMapping("/{usefulInformationId}")
    public ResponseEntity deleteUsefulInformation(@PathVariable Long usefulInformationId) {
        return new ResponseEntity(usefulInformationService.deleteUsefulInformation(usefulInformationId), HttpStatus.OK);
    }
}
