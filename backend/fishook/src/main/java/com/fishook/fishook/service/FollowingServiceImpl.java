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
        return followingRepository.save(following);
    }

    @Override
    public List<Following> getAllFollowing() {
        return followingRepository.findAll();
    }

    @Override
    public Following findByFolloweeAndFollower(Long followee, Long follower) {
        return followingRepository.findByFolloweeAndFollower(followee, follower);
    }

    @Override
    public List<Following> findAllByFollowee(Long followee) {
        return followingRepository.findAllByFollowee(followee);
    }

    @Override
    public String deleteFollowing(Long followingId) {
        followingRepository.deleteById(followingId);
        return "Deleted";
    }
}
