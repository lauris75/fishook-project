package com.fishook.fishook.service;

import com.fishook.fishook.dto.UserProfileUpdateRequest;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.repository.UserRepository;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserEntity saveUserEntity(UserEntity userEntity) {
        return userRepository.save(userEntity);
    }

    @Override
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public Optional<UserEntity> getUserById(Long userID) {
        return userRepository.findById(userID);
    }

    @Override
    public UserEntity updateUserProfile(Long userId, UserProfileUpdateRequest updateRequest) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (updateRequest.getProfilePicture() != null && !updateRequest.getProfilePicture().isEmpty()) {
            user.setProfilePicture(updateRequest.getProfilePicture());
        }

        if (updateRequest.getCoverPicture() != null && !updateRequest.getCoverPicture().isEmpty()) {
            user.setCoverPicture(updateRequest.getCoverPicture());
        }

        if (updateRequest.getDescription() != null) {
            user.setDescription(updateRequest.getDescription());
        }

        return userRepository.save(user);
    }

    @Override
    public String deleteUser(Long userID) {
        userRepository.deleteById(userID);
        return "Deleted";
    }
}
