package com.fishook.fishook.controller;

import com.fishook.fishook.entity.PostComment;
import com.fishook.fishook.service.PostCommentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("postComment")
@Tag(name = "Post Comment")
public class PostCommentController {

    @Autowired
    private PostCommentService postCommentService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createPostComment(@RequestBody PostComment postComment) {
        return new ResponseEntity(postCommentService.createPostComment(postComment), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<PostComment> getAllComments() {
        return postCommentService.getAllComments().stream().map(p -> new PostComment(p.getId(), p.getUserId(), p.getPostId(), p.getContent(), p.getDate())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("/{postId}")
    public List<PostComment> getAllPostCommentsByPostId(@PathVariable Long postId) {
        return postCommentService.getAllPostCommentsByPostId(postId).stream().map(p -> new PostComment(p.getId(), p.getUserId(), p.getPostId(), p.getContent(), p.getDate())).collect(Collectors.toList());
    }

    @CrossOrigin
    @DeleteMapping("/{postCommentId}")
    public ResponseEntity deletePostComment(@PathVariable Long postCommentId) {
        return new ResponseEntity(postCommentService.deletePostComment(postCommentId), HttpStatus.OK);
    }
}
