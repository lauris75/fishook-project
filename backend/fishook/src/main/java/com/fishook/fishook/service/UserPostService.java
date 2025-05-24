package com.fishook.fishook.service;

import com.fishook.fishook.dto.PostDto;
import com.fishook.fishook.entity.UserPost;

import java.util.List;

public interface UserPostService {
    UserPost createUserPost(UserPost userPost);

    List<PostDto> getAllUserFullPosts(Long userId);

    List<PostDto> getHomePagePosts(Long currentUserId);

    List<PostDto> getAllUserPostsByUserId(Long userId, Long currentUserId);

    List<PostDto> getAllUserPostsForGroup(Long groupId, Long currentUserId);

    String deleteUserPost(Long userPostId);

    PostDto getPostDtoById(Long postId, Long currentUserId);

    void deleteAllPostsByGroupId(Long groupId);
}