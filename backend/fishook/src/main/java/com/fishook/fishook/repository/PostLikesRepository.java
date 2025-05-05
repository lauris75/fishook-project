package com.fishook.fishook.repository;

import com.fishook.fishook.entity.PostLikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface PostLikesRepository extends JpaRepository<PostLikes, Long> {

    List<PostLikes> findAllByPostId(Long postId);

    Integer countByPostId(Long postId);

    Boolean existsByPostIdAndUserId(Long postId, Long userId);
}
