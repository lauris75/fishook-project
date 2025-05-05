package com.fishook.fishook.service;

import com.fishook.fishook.entity.GroupMember;
import com.fishook.fishook.repository.GroupMemberRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GroupMemberServiceImpl implements GroupMemberService {

    private final GroupMemberRepository groupMemberRepository;


    public GroupMemberServiceImpl(GroupMemberRepository groupMemberRepository) {
        this.groupMemberRepository = groupMemberRepository;
    }

    @Override
    public GroupMember createGroupMember(GroupMember groupMember) {
        return groupMemberRepository.save(groupMember);
    }

    @Override
    public List<GroupMember> getAllGroupsMembers() {
        return groupMemberRepository.findAll();
    }

    @Override
    public Optional<GroupMember> getGroupMemberByGroupIdAndUserId(Long groupId, Long userId) {
        return groupMemberRepository.findByGroupIdAndUserId(groupId, userId);
    }

    @Override
    public List<GroupMember> getAllGroupMembersByGroupId(Long groupId) {
        return groupMemberRepository.getAllByGroupId(groupId);
    }

    @Override
    public String deleteGroupMember(Long groupMemberId) {
        groupMemberRepository.deleteById(groupMemberId);
        return "Deleted";
    }
}
