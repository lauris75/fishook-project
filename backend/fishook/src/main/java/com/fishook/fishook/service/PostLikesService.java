package com.fishook.fishook.service;

import com.fishook.fishook.entity.PostLikes;

import java.util.List;

public interface PostLikesService {

    PostLikes createPostLike(PostLikes postLikes);

    List<PostLikes> getAllPostLikes();

    List<PostLikes> getAllPostlikesByPostId(Long postId);

    String deletePostLike(Long postLikeId);

    Integer getCountByPostId(Long postId);

    Boolean existsByPostIdAndUserId(Long postId, Long userId);
}
