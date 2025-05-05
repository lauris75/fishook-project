package com.fishook.fishook.service;

import com.fishook.fishook.entity.UserEntity;

import java.util.List;
import java.util.Optional;

public interface UserService {
    UserEntity saveUserEntity(UserEntity userEntity);

    List<UserEntity> getAllUsers();

    Optional<UserEntity> getUserById(Long userID);

    String deleteUser(Long userID);
}