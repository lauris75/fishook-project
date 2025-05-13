package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.UsefulInfoUpdateRequest;
import com.fishook.fishook.entity.Role;
import com.fishook.fishook.entity.UsefulInformation;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.service.UsefulInformationService;
import com.fishook.fishook.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
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
    private SecurityService securityService;

    @Autowired
    private UsefulInformationService usefulInformationService;

    @Autowired
    private UserService userService;

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

    @PutMapping("/{usefulInformationId}")
    @Operation(summary = "Update useful information - Admin only")
    public ResponseEntity<?> updateUsefulInformation(@PathVariable Long usefulInformationId, @RequestBody UsefulInfoUpdateRequest updateRequest) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (currentUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only administrators can update useful information");
        }

        try {
            UsefulInformation updatedInfo = usefulInformationService.updateUsefulInformation(usefulInformationId, updateRequest);
            return ResponseEntity.ok(updatedInfo);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Useful information not found with id: " + usefulInformationId);
        }
    }

    @DeleteMapping("/{usefulInformationId}")
    public ResponseEntity deleteUsefulInformation(@PathVariable Long usefulInformationId) {
        return new ResponseEntity(usefulInformationService.deleteUsefulInformation(usefulInformationId), HttpStatus.OK);
    }
}
