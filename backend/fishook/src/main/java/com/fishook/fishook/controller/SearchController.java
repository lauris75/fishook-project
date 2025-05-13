package com.fishook.fishook.controller;

import com.fishook.fishook.dto.UserDto;
import com.fishook.fishook.service.UserSearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("search")
@Tag(name = "Search")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class SearchController {

    @Autowired
    private UserSearchService userSearchService;

    @GetMapping("/users")
    @Operation(summary = "Search for users by name or surname")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam String query,
            @RequestParam(required = false, defaultValue = "7") Integer limit) {

        if (query == null || query.trim().length() < 3) {
            return ResponseEntity.ok(List.of());
        }

        List<UserDto> results = userSearchService.searchUsers(query.trim(), limit);
        return ResponseEntity.ok(results);
    }
}