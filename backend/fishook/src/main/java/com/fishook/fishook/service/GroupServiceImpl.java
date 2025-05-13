package com.fishook.fishook.service;

import com.fishook.fishook.dto.GroupUpdateRequest;
import com.fishook.fishook.entity.Group;
import com.fishook.fishook.repository.GroupRepository;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
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
    public Group updateGroup(Long groupId, GroupUpdateRequest updateRequest) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with id: " + groupId));

        if (updateRequest.getPhotoURL() != null && !updateRequest.getPhotoURL().isEmpty()) {
            group.setPhotoURL(updateRequest.getPhotoURL());
        }

        if (updateRequest.getSummary() != null) {
            group.setSummary(updateRequest.getSummary());
        }

        return groupRepository.save(group);
    }

    @Override
    public String deleteGroupId(Long groupId) {
        groupRepository.deleteById(groupId);
        return "Deleted";
    }
}
