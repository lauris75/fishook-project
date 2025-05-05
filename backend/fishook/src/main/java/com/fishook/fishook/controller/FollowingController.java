package com.fishook.fishook.controller;

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
    private FollowingService followingService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createFollowing(@RequestBody Following following) {
        return new ResponseEntity(followingService.createFollowing(following), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<Following> getAllFollowing() {
        return followingService.getAllFollowing().stream().map(p -> new Following(p.getId(), p.getFollower(), p.getFollowee())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("/{followerId}")
    public List<Following> getAllFollowingByFollower(@PathVariable Long followerId) {
        return followingService.findAllByFollowee(followerId).stream().map(p -> new Following(p.getId(), p.getFollower(), p.getFollowee())).collect(Collectors.toList());
    }

    @CrossOrigin
    @DeleteMapping("/{followingId}")
    public ResponseEntity deleteFollowing(@PathVariable Long followingId) {
        return new ResponseEntity(followingService.deleteFollowing(followingId), HttpStatus.OK);
    }
}
