package com.fishook.fishook.service;

import com.fishook.fishook.entity.PostComment;

import java.util.List;

public interface PostCommentService {

    PostComment createPostComment(PostComment postComment);

    List<PostComment> getAllComments();

    List<PostComment> getAllPostCommentsByPostId(Long postId);

    String deletePostComment(Long postCommentId);

    List<PostComment> getCommentsByPostId(Long postId);
}
