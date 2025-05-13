package com.fishook.fishook.service;

import com.fishook.fishook.dto.UserProfileUpdateRequest;
import com.fishook.fishook.entity.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserEntity saveUserEntity(UserEntity userEntity);

    List<UserEntity> getAllUsers();

    Optional<UserEntity> getUserById(Long userID);

    UserEntity updateUserProfile(Long userId, UserProfileUpdateRequest updateRequest);

    String deleteUser(Long userID);
}