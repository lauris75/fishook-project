package com.fishook.fishook.controller;

import com.fishook.fishook.entity.Lake;
import com.fishook.fishook.service.LakeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("lake")
@Tag(name = "Lake")
public class LakeController {

    @Autowired
    private LakeService lakeService;

    @PostMapping
    public ResponseEntity createLake(@RequestBody Lake lake) {
        return new ResponseEntity(lakeService.createLake(lake), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Lake> getAllLakes() {
        return lakeService.getAllLakes().stream().map(p -> new Lake(p.getId(), p.getSummary(), p.getDescription(), p.getPhotoURL(), p.getLatitude(), p.getLongitude())).collect(Collectors.toList());
    }

    @GetMapping("/{lakeId}")
    public Optional<Lake> getLakeById(@PathVariable Long lakeId) {
        return lakeService.getLakeById(lakeId);
    }

    @DeleteMapping("/{lakeId}")
    public ResponseEntity deleteLake(@PathVariable Long lakeId) {
        return new ResponseEntity(lakeService.deleteLake(lakeId), HttpStatus.OK);
    }
}
