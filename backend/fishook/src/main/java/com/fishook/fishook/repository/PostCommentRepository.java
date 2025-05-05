package com.fishook.fishook.repository;

import com.fishook.fishook.entity.PostComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    List<PostComment> getAllByPostIdOrderByDateDesc(Long postId);

    List<PostComment> getCommentsByPostId(Long postId);
}
