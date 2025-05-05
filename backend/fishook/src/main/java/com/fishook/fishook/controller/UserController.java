package com.fishook.fishook.controller;

import com.fishook.fishook.entity.UserEntity;
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
@RequestMapping("user")
@Tag(name = "User")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity saveUser(@RequestBody UserEntity userEntity) {
        return new ResponseEntity(userService.saveUserEntity(userEntity), HttpStatus.CREATED);
    }

    @GetMapping
    public List<UserEntity> fetchUsers() {
        return userService.getAllUsers().stream().map(p -> new UserEntity(p.getId(), p.getName(), p.getLastname(), p.getEmail(), p.getPassword(), p.getDateOfBirth(), p.getGender(), p.getRegistrationDate(), p.getProfilePicture(), p.getCoverPicture(), p.getDescription(), p.getRole())).collect(Collectors.toList());
    }

    @GetMapping("/{userID}")
    public Optional<UserEntity> fetchUserByID(@PathVariable Long userID) {
        return userService.getUserById(userID);
    }

    @DeleteMapping("/{userID}")
    public ResponseEntity deleteUser(@PathVariable Long userID) {
        return new ResponseEntity(userService.deleteUser(userID), HttpStatus.OK);
    }

}
