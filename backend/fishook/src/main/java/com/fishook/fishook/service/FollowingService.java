package com.fishook.fishook.service;

import com.fishook.fishook.entity.Following;

import java.util.List;

public interface FollowingService {

    Following createFollowing(Following following);

    List<Following> getAllFollowing();

    Following findByFolloweeAndFollower(Long followee, Long follower);

    List<Following> findAllByFollowee(Long followee);

    String deleteFollowing(Long followingId);
}
