package com.fishook.fishook.repository;

import com.fishook.fishook.entity.UserPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface UserPostRepository extends JpaRepository<UserPost, Long> {

    List<UserPost> getAllByUserIdAndGroupIdOrderByDateDesc(Long userId, Long groupId);

    List<UserPost> getAllByGroupIdOrderByDateDesc(Long groupId);
}
