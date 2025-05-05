package com.fishook.fishook.controller;

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
    private GroupService groupService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createGroup(@RequestBody Group group) {
        return new ResponseEntity(groupService.createGroup(group), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<Group> getAllGroups() {
        return groupService.getAllGroups().stream().map(p -> new Group(p.getId(), p.getOwnerId(), p.getSummary(), p.getPhotoURL())).collect(Collectors.toList());
    }

    /*@CrossOrigin
    @GetMapping("/myGroups")
    public List<Group> getAllMyGroups() {
        return groupService.getGroupsByOwnerId(new Long(1));
    }*/

    @CrossOrigin
    @GetMapping("/{groupId}")
    public Optional<Group> getGroupById(@PathVariable Long groupId) {
        return groupService.getGroupById(groupId);
    }

    @CrossOrigin
    @DeleteMapping("/{groupId}")
    public ResponseEntity deleteGroupById(@PathVariable Long groupId) {
        return new ResponseEntity(groupService.deleteGroupId(groupId), HttpStatus.OK);
    }
}
