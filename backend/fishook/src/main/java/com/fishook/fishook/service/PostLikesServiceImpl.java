package com.fishook.fishook.service;

import com.fishook.fishook.entity.PostLikes;
import com.fishook.fishook.repository.PostLikesRepository;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class PostLikesServiceImpl implements PostLikesService {

    private final PostLikesRepository postLikesRepository;

    public PostLikesServiceImpl(PostLikesRepository postLikesRepository) {
        this.postLikesRepository = postLikesRepository;
    }

    @Override
    public PostLikes createPostLike(PostLikes postLikes) {
        postLikes.setDate(new Date());
        return postLikesRepository.save(postLikes);
    }

    @Override
    public List<PostLikes> getAllPostLikes() {
        return postLikesRepository.findAll();
    }

    @Override
    public List<PostLikes> getAllPostlikesByPostId(Long postId) {
        return postLikesRepository.findAllByPostId(postId);
    }

    @Override
    public String deletePostLike(Long postLikeId) {
        postLikesRepository.deleteById(postLikeId);
        return "Deleted";
    }

    @Override
    public Integer getCountByPostId(Long postId) {
        return postLikesRepository.countByPostId(postId);
    }

    @Override
    public Boolean existsByPostIdAndUserId(Long postId, Long userId) {
        return postLikesRepository.existsByPostIdAndUserId(postId, userId);
    }
}
