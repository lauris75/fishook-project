package com.fishook.fishook.service;

import com.fishook.fishook.entity.GroupMember;

import java.util.List;
import java.util.Optional;

public interface GroupMemberService {

    GroupMember createGroupMember(GroupMember groupMember);

    List<GroupMember> getAllGroupsMembers();

    Optional<GroupMember> getGroupMemberByGroupIdAndUserId(Long groupId, Long userId);

    List<GroupMember> getAllGroupMembersByGroupId(Long groupId);

    String deleteGroupMember(Long groupMemberId);
}
