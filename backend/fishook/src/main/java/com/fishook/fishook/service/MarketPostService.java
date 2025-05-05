package com.fishook.fishook.service;

import com.fishook.fishook.entity.MarketPost;

import java.util.List;
import java.util.Optional;

public interface MarketPostService {

    MarketPost createMarketPost(MarketPost marketPost);

    List<MarketPost> getAllMarketPosts();

    List<MarketPost> getAllMarketpostsByCategoryId(Long categoryId);

    Optional<MarketPost> getMarketPostById(Long marketPostId);

    String deleteMarketPost(Long marketPostId);
}
