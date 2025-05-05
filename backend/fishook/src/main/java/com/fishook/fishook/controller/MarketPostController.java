package com.fishook.fishook.controller;

import com.fishook.fishook.entity.MarketPost;
import com.fishook.fishook.service.MarketPostService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("market")
@Tag(name = "Market Posts")
public class MarketPostController {

    @Autowired
    private MarketPostService marketPostService;

    @PostMapping
    public ResponseEntity createMarketPost(@RequestBody MarketPost marketPost) {
        return new ResponseEntity(marketPostService.createMarketPost(marketPost), HttpStatus.CREATED);
    }

    @GetMapping
    public List<MarketPost> getAllMarketPosts() {
        return marketPostService.getAllMarketPosts().stream().map(p -> new MarketPost(p.getId(), p.getUserId(), p.getPrice(), p.getDate(), p.getPhotoURL(), p.getContent(), p.getCategoryId())).collect(Collectors.toList());
    }

    @GetMapping("/{categoryId}")
    public List<MarketPost> getMarketPostsByCategory(@PathVariable Long categoryId) {
        return marketPostService.getAllMarketpostsByCategoryId(categoryId).stream().map(p -> new MarketPost(p.getId(), p.getUserId(), p.getPrice(), p.getDate(), p.getPhotoURL(), p.getContent(), p.getCategoryId())).collect(Collectors.toList());
    }

    @DeleteMapping("/{marketPostId}")
    public ResponseEntity deleteMarketPost(@PathVariable Long marketPostId) {
        return new ResponseEntity(marketPostService.deleteMarketPost(marketPostId), HttpStatus.OK);
    }
}
