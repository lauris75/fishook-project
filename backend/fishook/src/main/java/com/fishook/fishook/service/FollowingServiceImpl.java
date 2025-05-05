package com.fishook.fishook.service;

import com.fishook.fishook.entity.Following;
import com.fishook.fishook.repository.FollowingRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowingServiceImpl implements FollowingService {

    private final FollowingRepository followingRepository;

    public FollowingServiceImpl(FollowingRepository followingRepository) {
        this.followingRepository = followingRepository;
    }

    @Override
    public Following createFollowing(Following following) {
        Following existingFollow = findByFolloweeAndFollower(
                following.getFollowee(),
                following.getFollower()
        );
        if (existingFollow == null) {
            return followingRepository.save(following);
        }
        return existingFollow;
    }

    @Override
    public List<Following> getAllFollowing(Long currentUserId) {
        return followingRepository.findAllByFollower(currentUserId);
    }

    @Override
    public Following findByFolloweeAndFollower(Long followee, Long follower) {
        return followingRepository.findByFolloweeAndFollower(followee, follower);
    }

    @Override
    public String deleteFollowing(Long followeeId, Long currentUserId) {
        Following following = followingRepository.findByFolloweeAndFollower(followeeId, currentUserId);
        followingRepository.deleteById(following.getId());
        return "Deleted";
    }
}
