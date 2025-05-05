package com.fishook.fishook.service;

import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.repository.UserRepository;
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
    public String deleteUser(Long userID) {
        userRepository.deleteById(userID);
        return "Deleted";
    }
}
