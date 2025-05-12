package com.fishook.fishook.controller;

import com.fishook.fishook.entity.LakeFish;
import com.fishook.fishook.service.FishService;
import com.fishook.fishook.service.LakeFishService;
import com.fishook.fishook.service.LakeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("lakeFish")
@Tag(name = "Lake Fish Associations")
public class LakeFishController {

    @Autowired
    private LakeFishService lakeFishService;

    @Autowired
    private LakeService lakeService;

    @Autowired
    private FishService fishService;

    @PostMapping
    public ResponseEntity<?> createLakeFish(@RequestBody LakeFish lakeFish) {
        if (!lakeService.getLakeById(lakeFish.getLakeId()).isPresent()) {
            return ResponseEntity.badRequest().body("Lake with ID " + lakeFish.getLakeId() + " not found");
        }

        if (!fishService.getFishbyId(lakeFish.getFishId()).isPresent()) {
            return ResponseEntity.badRequest().body("Fish with ID " + lakeFish.getFishId() + " not found");
        }

        return new ResponseEntity<>(lakeFishService.createLakeFish(lakeFish), HttpStatus.CREATED);
    }

    @GetMapping
    public List<LakeFish> getAllLakeFish() {
        return lakeFishService.getAllLakeFish().stream().map(lf -> new LakeFish(lf.getId(), lf.getLakeId(), lf.getFishId())).collect(Collectors.toList());
    }

    @GetMapping("/lake/{lakeId}")
    public List<LakeFish> getLakeFishByLakeId(@PathVariable Long lakeId) {
        return lakeFishService.getAllLakeFishByLakeId(lakeId).stream().map(lf -> new LakeFish(lf.getId(), lf.getLakeId(), lf.getFishId())).collect(Collectors.toList());
    }

    @GetMapping("/fish/{fishId}")
    public List<LakeFish> getLakeFishByFishId(@PathVariable Long fishId) {
        return lakeFishService.getAllLakeFishByFishId(fishId).stream().map(lf -> new LakeFish(lf.getId(), lf.getLakeId(), lf.getFishId())).collect(Collectors.toList());
    }

    @GetMapping("/lake/{lakeId}/fish/{fishId}")
    public ResponseEntity<?> getLakeFishByIds(@PathVariable Long lakeId, @PathVariable Long fishId) {
        return lakeFishService.getLakeFishByLakeIdAndFishId(lakeId, fishId).map(lakeFish -> ResponseEntity.ok(lakeFish)).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{lakeFishId}")
    public ResponseEntity<?> deleteLakeFish(@PathVariable Long lakeFishId) {
        return new ResponseEntity<>(lakeFishService.deleteLakeFish(lakeFishId), HttpStatus.OK);
    }

    @DeleteMapping("/lake/{lakeId}/fish/{fishId}")
    public ResponseEntity<?> deleteLakeFishByIds(@PathVariable Long lakeId, @PathVariable Long fishId) {
        return new ResponseEntity<>(lakeFishService.deleteLakeFishByLakeIdAndFishId(lakeId, fishId), HttpStatus.OK);
    }
}