package com.fishook.fishook.service;

import com.fishook.fishook.entity.PostComment;
import com.fishook.fishook.repository.PostCommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostCommentServiceImpl implements PostCommentService {

    private final PostCommentRepository postCommentRepository;


    public PostCommentServiceImpl(PostCommentRepository postCommentRepository) {
        this.postCommentRepository = postCommentRepository;
    }

    @Override
    public PostComment createPostComment(PostComment postComment) {
        return postCommentRepository.save(postComment);
    }

    @Override
    public List<PostComment> getAllComments() {
        return postCommentRepository.findAll();
    }

    @Override
    public List<PostComment> getAllPostCommentsByPostId(Long postId) {
        return postCommentRepository.getAllByPostIdOrderByDateDesc(postId);
    }

    @Override
    public String deletePostComment(Long postCommentId) {
        postCommentRepository.deleteById(postCommentId);
        return "Deleted";
    }

    @Override
    public List<PostComment> getCommentsByPostId(Long postId) {
        return postCommentRepository.getCommentsByPostId(postId);
    }
}
