package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.entity.Group;
import com.fishook.fishook.service.GroupService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("group")
@Tag(name = "Group")
public class GroupController {

    @Autowired
    private SecurityService securityService;

    @Autowired
    private GroupService groupService;

    @PostMapping
    public ResponseEntity createGroup(@RequestBody Group group) {
        return new ResponseEntity(groupService.createGroup(group), HttpStatus.CREATED);
    }

    @GetMapping
    public List<Group> getAllGroups() {
        return groupService.getAllGroups().stream().map(p -> new Group(p.getId(), p.getOwnerId(), p.getGroupName(), p.getSummary(), p.getPhotoURL())).collect(Collectors.toList());
    }

    @GetMapping("/myGroups")
    public List<Group> getAllMyGroups() {
        Long currentUserId = securityService.getCurrentUserId();
        return groupService.getGroupsByOwnerId(currentUserId);
    }

    @GetMapping("/{groupId}")
    public Optional<Group> getGroupById(@PathVariable Long groupId) {
        return groupService.getGroupById(groupId);
    }

    @DeleteMapping("/{groupId}")
    public ResponseEntity deleteGroupById(@PathVariable Long groupId) {
        return new ResponseEntity(groupService.deleteGroupId(groupId), HttpStatus.OK);
    }
}
