package com.fishook.fishook.service;

import com.fishook.fishook.dto.UserDto;

import java.util.List;

public interface UserSearchService {

    List<UserDto> searchUsers(String query, Integer limit);
}