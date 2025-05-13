package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.LakeUpdateRequest;
import com.fishook.fishook.entity.Lake;
import com.fishook.fishook.entity.Role;
import com.fishook.fishook.entity.UserEntity;
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
@RequestMapping("lake")
@Tag(name = "Lake")
public class LakeController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private LakeService lakeService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createLake(@RequestBody Lake lake) {
        return new ResponseEntity<>(lakeService.createLake(lake), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Lake> getAllLakes() {
        return lakeService.getAllLakes().stream().map(p -> new Lake(p.getId(), p.getName(), p.getSummary(), p.getDescription(), p.getPhotoURL(), p.getLatitude(), p.getLongitude(), null)).collect(Collectors.toList());
    }

    @GetMapping("/{lakeId}")
    public ResponseEntity<?> getLakeById(@PathVariable Long lakeId) {
        return lakeService.getLakeById(lakeId).map(lake -> ResponseEntity.ok(lake)).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{lakeId}/withFish")
    public ResponseEntity<?> getLakeWithFish(@PathVariable Long lakeId) {
        return lakeService.getLakeWithFish(lakeId).map(lake -> ResponseEntity.ok(lake)).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{lakeId}/fish/{fishId}")
    @Operation(summary = "Add a fish to a lake - Admin only")
    public ResponseEntity<?> addFishToLake(@PathVariable Long lakeId, @PathVariable Long fishId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can manage lake-fish associations");
        }

        try {
            lakeService.addFishToLake(lakeId, fishId);
            return ResponseEntity.ok("Fish added to lake successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error adding fish to lake: " + e.getMessage());
        }
    }

    @DeleteMapping("/{lakeId}/fish/{fishId}")
    @Operation(summary = "Remove a fish from a lake - Admin only")
    public ResponseEntity<?> removeFishFromLake(@PathVariable Long lakeId, @PathVariable Long fishId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can manage lake-fish associations");
        }

        try {
            lakeService.removeFishFromLake(lakeId, fishId);
            return ResponseEntity.ok("Fish removed from lake successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error removing fish from lake: " + e.getMessage());
        }
    }

    @PutMapping("/{lakeId}")
    @Operation(summary = "Update lake details - Admin only")
    public ResponseEntity<?> updateLake(@PathVariable Long lakeId, @RequestBody LakeUpdateRequest updateRequest) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can update lake information");
        }

        try {
            Lake updatedLake = lakeService.updateLake(lakeId, updateRequest);
            return ResponseEntity.ok(updatedLake);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Lake not found with id: " + lakeId);
        }
    }

    @DeleteMapping("/{lakeId}")
    public ResponseEntity<?> deleteLake(@PathVariable Long lakeId) {
        return new ResponseEntity<>(lakeService.deleteLake(lakeId), HttpStatus.OK);
    }
}