package com.fishook.fishook.service;

import com.fishook.fishook.dto.CommentDto;
import com.fishook.fishook.dto.PostDto;
import com.fishook.fishook.dto.UserDto;
import com.fishook.fishook.entity.PostComment;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.entity.UserPost;
import com.fishook.fishook.repository.UserPostRepository;
import org.springframework.data.domain.Sort;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserPostServiceImpl implements UserPostService {

    private final UserPostRepository userPostRepository;
    private final PostLikesService postLikesService;
    private final UserService userService;
    private final PostCommentService postCommentService;
    private final FollowingService followingService;
    private final GroupMemberService groupMemberService;

    public UserPostServiceImpl(
            UserPostRepository userPostRepository,
            PostLikesService postLikesService,
            UserService userService,
            PostCommentService postCommentService,
            FollowingService followingService,
            GroupMemberService groupMemberService) {
        this.userPostRepository = userPostRepository;
        this.postLikesService = postLikesService;
        this.userService = userService;
        this.postCommentService = postCommentService;
        this.followingService = followingService;
        this.groupMemberService = groupMemberService;
    }

    @Override
    public UserPost createUserPost(UserPost userPost) {
        return userPostRepository.save(userPost);
    }

    @Override
    public List<PostDto> getAllUserFullPosts(Long userId) {
        List<UserPost> allPosts = userPostRepository.findAll(Sort.by(Sort.Direction.DESC, "date"));
        return enrichPostsWithAssociatedData(allPosts, userId);
    }

    @Override
    public List<PostDto> getHomePagePosts(Long currentUserId) {
        List<UserPost> allPosts = userPostRepository.findAll(Sort.by(Sort.Direction.DESC, "date"));

        Set<Long> followedUserIds = followingService.getAllFollowing(currentUserId)
                .stream()
                .map(following -> following.getFollowee())
                .collect(Collectors.toSet());

        Set<Long> userGroupIds = groupMemberService.getAllGroupsMembers()
                .stream()
                .filter(member -> member.getUserId().equals(currentUserId))
                .map(member -> member.getGroupId())
                .collect(Collectors.toSet());

        List<UserPost> filteredPosts = allPosts.stream()
                .filter(post ->
                        post.getUserId().equals(currentUserId) ||
                                followedUserIds.contains(post.getUserId()) ||
                                (post.getGroupId() != null && userGroupIds.contains(post.getGroupId()))
                )
                .collect(Collectors.toList());

        if (filteredPosts.size() < 10) {
            return enrichPostsWithAssociatedData(allPosts, currentUserId);
        }

        return enrichPostsWithAssociatedData(filteredPosts, currentUserId);
    }

    @Override
    public List<PostDto> getAllUserPostsByUserId(Long userId, Long currentUserId) {
        List<UserPost> userPosts = userPostRepository.getAllByUserIdAndGroupIdOrderByDateDesc(userId, null);
        return enrichPostsWithAssociatedData(userPosts, currentUserId);
    }

    @Override
    public List<PostDto> getAllUserPostsForGroup(Long groupId, Long currentUserId) {
        List<UserPost> userPosts = userPostRepository.getAllByGroupIdOrderByDateDesc(groupId);
        return enrichPostsWithAssociatedData(userPosts, currentUserId);
    }

    @Override
    public String deleteUserPost(Long userPostId) {
        userPostRepository.deleteById(userPostId);
        return "Deleted";
    }

    @Override
    public PostDto getPostDtoById(Long postId, Long currentUserId) {
        UserPost post = userPostRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found with id: " + postId));

        return enrichPostWithAssociatedData(post, currentUserId);
    }

    private List<PostDto> enrichPostsWithAssociatedData(List<UserPost> posts, Long currentUserId) {
        return posts.stream()
                .map(post -> enrichPostWithAssociatedData(post, currentUserId))
                .collect(Collectors.toList());
    }

    private PostDto enrichPostWithAssociatedData(UserPost post, Long currentUserId) {
        PostDto postDto = convertToDto(post);

        UserEntity userEntity = userService.getUserById(post.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + post.getUserId()));

        UserDto userDto = new UserDto(
                userEntity.getId(),
                userEntity.getName(),
                userEntity.getLastname(),
                userEntity.getEmail(),
                userEntity.getProfilePicture(),
                userEntity.getDateOfBirth(),
                null
        );
        postDto.setUser(userDto);

        enrichWithLikeData(postDto, currentUserId);

        enrichWithCommentData(postDto, currentUserId);

        return postDto;
    }

    private PostDto convertToDto(UserPost post) {
        PostDto postDto = new PostDto();
        postDto.setId(post.getId());
        postDto.setUserId(post.getUserId());
        postDto.setGroupId(post.getGroupId());
        postDto.setContent(post.getContent());
        postDto.setPhotoURL(post.getPhotoURL());
        postDto.setDate(post.getDate());
        return postDto;
    }

    private void enrichWithLikeData(PostDto postDto, Long currentUserId) {
        Integer likeCount = postLikesService.getCountByPostId(postDto.getId());
        postDto.setLikeCount(likeCount);

        if (currentUserId != null) {
            Boolean isLiked = postLikesService.existsByPostIdAndUserId(postDto.getId(), currentUserId);
            postDto.setIsLikedByCurrentUser(isLiked);
        } else {
            postDto.setIsLikedByCurrentUser(false);
        }
    }

    private void enrichWithCommentData(PostDto postDto, Long currentUserId) {
        List<PostComment> postComments = postCommentService.getCommentsByPostId(postDto.getId());

        List<CommentDto> comments = postComments.stream().map(comment -> {
            CommentDto commentDto = new CommentDto();
            commentDto.setId(comment.getId());
            commentDto.setUserId(comment.getUserId());
            commentDto.setContent(comment.getContent());
            commentDto.setDate(comment.getDate());

            try {
                UserEntity userEntity = userService.getUserById(comment.getUserId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + comment.getUserId()));

                UserDto userDto = new UserDto(
                        userEntity.getId(),
                        userEntity.getName(),
                        userEntity.getLastname(),
                        userEntity.getEmail(),
                        userEntity.getProfilePicture(),
                        userEntity.getDateOfBirth(),
                        null
                );

                commentDto.setUser(userDto);
            } catch (Exception e) {
            }

            return commentDto;

        }).collect(Collectors.toList());

        postDto.setComments(comments);

        postDto.setCommentCount(comments.size());
    }

    @Override
    public void deleteAllPostsByGroupId(Long groupId) {
        List<UserPost> groupPosts = userPostRepository.getAllByGroupIdOrderByDateDesc(groupId);
        for (UserPost post : groupPosts) {
            userPostRepository.deleteById(post.getId());
        }
    }
}