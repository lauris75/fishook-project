package com.fishook.fishook.service;

import com.fishook.fishook.entity.Group;
import com.fishook.fishook.repository.GroupRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    public GroupServiceImpl(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Override
    public Group createGroup(Group group) {
        return groupRepository.save(group);
    }

    @Override
    public List<Group> getAllGroups() {
        return groupRepository.findAll();
    }

    @Override
    public List<Group> getGroupsByOwnerId(Long ownerId) {
        return groupRepository.getGroupByOwnerId(ownerId);
    }

    @Override
    public Optional<Group> getGroupById(Long groupId) {
        return groupRepository.findById(groupId);
    }

    @Override
    public String deleteGroupId(Long groupId) {
        groupRepository.deleteById(groupId);
        return "Deleted";
    }
}
