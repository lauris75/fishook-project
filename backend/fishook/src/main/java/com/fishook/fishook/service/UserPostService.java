package com.fishook.fishook.service;

import com.fishook.fishook.dto.PostDto;
import com.fishook.fishook.entity.UserPost;

import java.util.List;

public interface UserPostService {
    UserPost createUserPost(UserPost userPost);

    List<UserPost> getAllUserPosts();

    List<PostDto> getAllUserFullPosts(Long userId);

    List<PostDto> getAllUserPostsByUserId(Long userId, Long currentUserId);

    List<PostDto> getAllUserPostsForGroup(Long groupId, Long currentUserId);

    String deleteUserPost(Long userPostId);

    PostDto getPostDtoById(Long postId, Long currentUserId);

    List<PostDto> getPostDtosByUserId(Long userId, Long currentUserId);

    List<PostDto> getPostDtosForGroup(Long groupId, Long currentUserId);
}