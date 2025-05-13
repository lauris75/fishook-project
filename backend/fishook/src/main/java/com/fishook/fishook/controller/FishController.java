package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.FishUpdateRequest;
import com.fishook.fishook.entity.Fish;
import com.fishook.fishook.entity.Role;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.service.FishService;
import com.fishook.fishook.service.LakeService;
import com.fishook.fishook.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
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
    private SecurityService securityService;

    @Autowired
    private FishService fishService;

    @Autowired
    private LakeService lakeService;

    @Autowired
    private UserService userService;

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

    @PostMapping("/{fishId}/lake/{lakeId}")
    @Operation(summary = "Add a lake to a fish - Admin only")
    public ResponseEntity<?> addLakeToFish(@PathVariable Long fishId, @PathVariable Long lakeId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can manage fish-lake associations");
        }

        try {
            lakeService.addFishToLake(lakeId, fishId);
            return ResponseEntity.ok("Lake added to fish successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding lake to fish: " + e.getMessage());
        }
    }

    @DeleteMapping("/{fishId}/lake/{lakeId}")
    @Operation(summary = "Remove a lake from a fish - Admin only")
    public ResponseEntity<?> removeLakeFromFish(@PathVariable Long fishId, @PathVariable Long lakeId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can manage fish-lake associations");
        }

        try {
            lakeService.removeFishFromLake(lakeId, fishId);
            return ResponseEntity.ok("Lake removed from fish successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error removing lake from fish: " + e.getMessage());
        }
    }

    @PutMapping("/{fishId}")
    @Operation(summary = "Update fish details - Admin only")
    public ResponseEntity<?> updateFish(@PathVariable Long fishId, @RequestBody FishUpdateRequest updateRequest) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can update fish information");
        }

        try {
            Fish updatedFish = fishService.updateFish(fishId, updateRequest);
            return ResponseEntity.ok(updatedFish);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Fish not found with id: " + fishId);
        }
    }

    @DeleteMapping("/{fishId}")
    public ResponseEntity<?> deleteFishById(@PathVariable Long fishId) {
        return new ResponseEntity<>(fishService.deleteFishById(fishId), HttpStatus.OK);
    }
}