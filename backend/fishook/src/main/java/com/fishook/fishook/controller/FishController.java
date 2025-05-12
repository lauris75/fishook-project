package com.fishook.fishook.controller;

import com.fishook.fishook.entity.Fish;
import com.fishook.fishook.service.FishService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("fish")
@Tag(name = "Fish")
public class FishController {

    @Autowired
    private FishService fishService;

    @PostMapping
    public ResponseEntity<?> createFish(@RequestBody Fish fish) {
        return new ResponseEntity<>(fishService.createFish(fish), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Fish> getAllFish() {
        return fishService.getAllFish().stream().map(p -> new Fish(p.getId(), p.getName(), p.getSummary(), p.getDescription(), p.getPhotoURL(), null)).collect(Collectors.toList());
    }

    @GetMapping("/{fishId}")
    public ResponseEntity<?> getFishById(@PathVariable Long fishId) {
        return fishService.getFishbyId(fishId).map(fish -> ResponseEntity.ok(fish)).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{fishId}/withLakes")
    public ResponseEntity<?> getFishWithLakes(@PathVariable Long fishId) {
        return fishService.getFishWithLakes(fishId).map(fish -> ResponseEntity.ok(fish)).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{fishId}")
    public ResponseEntity<?> deleteFishById(@PathVariable Long fishId) {
        return new ResponseEntity<>(fishService.deleteFishById(fishId), HttpStatus.OK);
    }
}