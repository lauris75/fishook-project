package com.fishook.fishook.controller;

import com.fishook.fishook.entity.GroupMember;
import com.fishook.fishook.service.GroupMemberService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("groupMember")
@Tag(name = "Group Member")
public class GroupMemberController {

    @Autowired
    private GroupMemberService groupMemberService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createGroupMember(@RequestBody GroupMember groupMember) {
        return new ResponseEntity(groupMemberService.createGroupMember(groupMember), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<GroupMember> getAllGroupMembers() {
        return groupMemberService.getAllGroupsMembers().stream().map(p -> new GroupMember(p.getId(), p.getGroupId(), p.getUserId())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("/{groupId}")
    public List<GroupMember> getAllGroupMembersByGroupId(@PathVariable Long groupId) {
        return groupMemberService.getAllGroupMembersByGroupId(groupId).stream().map(p -> new GroupMember(p.getId(), p.getGroupId(), p.getUserId())).collect(Collectors.toList());
    }

    @CrossOrigin
    @DeleteMapping("/{groupMemberId}")
    public ResponseEntity deleteGroupMember(@PathVariable Long groupMemberId) {
        return new ResponseEntity(groupMemberService.deleteGroupMember(groupMemberId), HttpStatus.OK);
    }
}
