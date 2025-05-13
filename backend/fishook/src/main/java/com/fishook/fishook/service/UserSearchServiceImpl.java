package com.fishook.fishook.service;

import com.fishook.fishook.dto.UserDto;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserSearchServiceImpl implements UserSearchService {

    private final UserRepository userRepository;

    public UserSearchServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public List<UserDto> searchUsers(String query, Integer limit) {
        if (query == null || query.length() < 3 || limit == null || limit < 1) {
            return List.of();
        }

        List<UserEntity> users = userRepository.findByNameOrSurnameContainingIgnoreCase(query, limit);

        return users.stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getName(),
                        user.getLastname(),
                        null,
                        user.getProfilePicture(),
                        null,
                        null
                ))
                .collect(Collectors.toList());
    }
}