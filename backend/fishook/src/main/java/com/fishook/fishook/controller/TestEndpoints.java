package com.fishook.fishook.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/testAuth")
@Tag(name = "Test")
public class TestEndpoints {

    @GetMapping({"/test"})
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Test passed!");
    }

}
