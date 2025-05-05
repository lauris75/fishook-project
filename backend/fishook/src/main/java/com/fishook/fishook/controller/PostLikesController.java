package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.entity.PostLikes;
import com.fishook.fishook.service.PostLikesService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("postLikes")
@Tag(name = "Post Likes")
public class PostLikesController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private PostLikesService postLikesService;

    @PostMapping
    public ResponseEntity createPostLike(@RequestBody PostLikes postLike) {
        Long currentUserId = securityService.getCurrentUserId();
        postLike.setUserId(currentUserId);
        return new ResponseEntity(postLikesService.createPostLike(postLike), HttpStatus.CREATED);
    }

    @GetMapping
    public List<PostLikes> getAllPostLikes() {
        return postLikesService.getAllPostLikes().stream().map(p -> new PostLikes(p.getId(), p.getUserId(), p.getPostId(), p.getDate())).collect(Collectors.toList());
    }

    @GetMapping("/{postId}")
    public List<PostLikes> getAllPostLikesPerPost(@PathVariable Long postId) {
        return postLikesService.getAllPostlikesByPostId(postId).stream().map(p -> new PostLikes(p.getId(), p.getUserId(), p.getPostId(), p.getDate())).collect(Collectors.toList());
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity deletePostLike(@PathVariable Long postId) {
        Long currentUserId = securityService.getCurrentUserId();
        return new ResponseEntity(postLikesService.deletePostLike(postId, currentUserId), HttpStatus.OK);
    }
}
