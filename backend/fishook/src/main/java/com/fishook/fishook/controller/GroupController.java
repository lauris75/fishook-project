package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.entity.Group;
import com.fishook.fishook.entity.Role;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.service.GroupService;
import com.fishook.fishook.service.UserPostService;
import com.fishook.fishook.service.UserService;
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

    @Autowired
    private UserService userService;

    @Autowired
    private UserPostService userPostService;

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
    public ResponseEntity<?> deleteGroupById(@PathVariable Long groupId) {
        Long currentUserId = securityService.getCurrentUserId();
        UserEntity currentUser = userService.getUserById(currentUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Group> groupOpt = groupService.getGroupById(groupId);
        if (!groupOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Group group = groupOpt.get();

        if (currentUserId.equals(group.getOwnerId()) ||
                currentUser.getRole() == Role.ADMIN) {

            userPostService.deleteAllPostsByGroupId(groupId);

            return new ResponseEntity<>(groupService.deleteGroupId(groupId), HttpStatus.OK);
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Only the group owner or an admin can delete this group");
        }
    }
}
