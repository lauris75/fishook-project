package com.fishook.fishook.service;

import com.fishook.fishook.dto.GroupUpdateRequest;
import com.fishook.fishook.entity.Group;

import java.util.List;
import java.util.Optional;

public interface GroupService {

    Group createGroup(Group group);

    List<Group> getAllGroups();

    List<Group> getGroupsByOwnerId(Long ownderId);

    Optional<Group> getGroupById(Long groupId);

    Group updateGroup(Long groupId, GroupUpdateRequest updateRequest);

    String deleteGroupId(Long groupId);
}
