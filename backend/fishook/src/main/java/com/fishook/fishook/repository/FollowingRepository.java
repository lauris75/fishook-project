package com.fishook.fishook.repository;

import com.fishook.fishook.entity.Following;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface FollowingRepository extends JpaRepository<Following, Long> {

    Following findByFolloweeAndFollower(Long followee, Long follower);

    List<Following> findAllByFollowee(Long followee);
}
