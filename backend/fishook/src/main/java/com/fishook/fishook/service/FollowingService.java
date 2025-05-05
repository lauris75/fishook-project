package com.fishook.fishook.service;

import com.fishook.fishook.entity.Following;

import java.util.List;

public interface FollowingService {

    Following createFollowing(Following following);

    List<Following> getAllFollowing(Long currentUserId);

    Following findByFolloweeAndFollower(Long followee, Long follower);

    String deleteFollowing(Long followeeId, Long currentUserId);
}
