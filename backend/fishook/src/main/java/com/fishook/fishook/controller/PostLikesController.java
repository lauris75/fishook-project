package com.fishook.fishook.controller;

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
    private PostLikesService postLikesService;

    @PostMapping
    public ResponseEntity createPostLike(@RequestBody PostLikes postLike) {
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

    @DeleteMapping("/{postLikeId}")
    public ResponseEntity deletePostLike(@PathVariable Long postLikeId) {
        return new ResponseEntity(postLikesService.deletePostLike(postLikeId), HttpStatus.OK);
    }
}
