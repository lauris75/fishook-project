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

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("userPost")
@Tag(name = "User Post")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class UserPostController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private UserPostService userPostService;

    @PostMapping
    public ResponseEntity<?> createUserPost(@RequestBody UserPost userPost) {
        if (userPost.getDate() == null) {
            userPost.setDate(new Date());
        }

        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId != null && !currentUserId.equals(userPost.getUserId())) {
            return new ResponseEntity<>("You can only create posts as yourself", HttpStatus.FORBIDDEN);
        }

        if ((userPost.getPhotoURL() == null || userPost.getPhotoURL().isEmpty()) &&
                (userPost.getContent() == null || userPost.getContent().isEmpty())) {
            return new ResponseEntity<>("Post must have either content or an image", HttpStatus.BAD_REQUEST);
        }

        UserPost savedPost = userPostService.createUserPost(userPost);
        PostDto postDto = userPostService.getPostDtoById(savedPost.getId(), currentUserId);

        return new ResponseEntity<>(postDto, HttpStatus.CREATED);
    }

    @GetMapping
    public List<PostDto> getAllUserFullPosts() {
        Long currentUserId = securityService.getCurrentUserId();
        return userPostService.getAllUserFullPosts(currentUserId);
    }

    @GetMapping("userPosts/{userId}")
    public List<PostDto> getAllUserPostsPerUserId(@PathVariable Long userId) {
        Long currentUserId = securityService.getCurrentUserId();
        return userPostService.getAllUserPostsByUserId(userId, currentUserId);
    }

    @GetMapping("groupPosts/{groupId}")
    public List<PostDto> getAllUserPostPerGroupId(@PathVariable Long groupId) {
        Long currentUserId = securityService.getCurrentUserId();
        return userPostService.getAllUserPostsForGroup(groupId, currentUserId);
    }

    @DeleteMapping("/{userPostId}")
    public ResponseEntity<?> deleteUserPost(@PathVariable Long userPostId) {
        Long currentUserId = securityService.getCurrentUserId();
        PostDto postDto = userPostService.getPostDtoById(userPostId, currentUserId);

        if (postDto == null) {
            return new ResponseEntity<>("Post not found", HttpStatus.NOT_FOUND);
        }

        if (!currentUserId.equals(postDto.getUserId())) {
            return new ResponseEntity<>("You can only delete your own posts", HttpStatus.FORBIDDEN);
        }

        return new ResponseEntity<>(userPostService.deleteUserPost(userPostId), HttpStatus.OK);
    }
}
