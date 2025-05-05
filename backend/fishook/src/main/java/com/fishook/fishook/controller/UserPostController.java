package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.PostDto;
import com.fishook.fishook.entity.UserPost;
import com.fishook.fishook.service.UserPostService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("userPost")
@Tag(name = "User Post")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserPostController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private UserPostService userPostService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createUserPost(@RequestBody UserPost userPost) {
        return new ResponseEntity(userPostService.createUserPost(userPost), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<PostDto> getAllUserFullPosts() {
        Long currentUserId = securityService.getCurrentUserId();

        // Use your new service method that returns PostDto objects with all the data
        return userPostService.getAllUserFullPosts(currentUserId);
    }

    @CrossOrigin
    @GetMapping("userPosts/{userId}")
    public List<UserPost> getAllUserPostsPerUserId(@PathVariable Long userId) {
        return userPostService.getAllUserPostsByUserId(userId).stream().map(p -> new UserPost(p.getId(), p.getUserId(), p.getGroupId(), p.getContent(), p.getPhotoURL(), p.getDate())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("groupPosts/{groupId}")
    public List<UserPost> getAllUserPostPerGroupId(@PathVariable Long groupId) {
        return userPostService.getAllUserPostsForGroup(groupId).stream().map(p -> new UserPost(p.getId(), p.getUserId(), p.getGroupId(), p.getContent(), p.getPhotoURL(), p.getDate())).collect(Collectors.toList());
    }

    @CrossOrigin
    @DeleteMapping("/{userPostId}")
    public ResponseEntity deleteUserPost(@PathVariable Long userPostId) {
        return new ResponseEntity(userPostService.deleteUserPost(userPostId), HttpStatus.OK);
    }
}
