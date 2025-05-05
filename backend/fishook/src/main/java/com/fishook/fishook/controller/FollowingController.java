package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.entity.Following;
import com.fishook.fishook.service.FollowingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("following")
@Tag(name = "Following")
public class FollowingController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private FollowingService followingService;

    @PostMapping()
    public ResponseEntity createFollowing(@RequestBody Following following) {
        return new ResponseEntity(followingService.createFollowing(following), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Following> getAllCurrentUserIsFollowing() {
        Long currentUserId = securityService.getCurrentUserId();
        return followingService.getAllFollowing(currentUserId).stream().map(p -> new Following(p.getId(), p.getFollower(), p.getFollowee())).collect(Collectors.toList());
    }

    @GetMapping("/check/{followeeId}")
    public ResponseEntity<Boolean> isFollowing(@PathVariable Long followeeId) {
        Long currentUserId = securityService.getCurrentUserId();
        Following following = followingService.findByFolloweeAndFollower(followeeId, currentUserId);
        return ResponseEntity.ok(following != null);
    }

    @DeleteMapping("/{followeeId}")
    public ResponseEntity deleteFollowing(@PathVariable Long followeeId) {
        Long currentUserId = securityService.getCurrentUserId();
        return new ResponseEntity(followingService.deleteFollowing(followeeId, currentUserId), HttpStatus.OK);
    }
}
