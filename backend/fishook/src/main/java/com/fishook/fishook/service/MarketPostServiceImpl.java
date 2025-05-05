package com.fishook.fishook.service;

import com.fishook.fishook.entity.MarketPost;
import com.fishook.fishook.repository.MarketPostRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarketPostServiceImpl implements MarketPostService {

    private final MarketPostRepository marketPostRepository;


    public MarketPostServiceImpl(MarketPostRepository marketPostRepository) {
        this.marketPostRepository = marketPostRepository;
    }

    @Override
    public MarketPost createMarketPost(MarketPost marketPost) {
        return marketPostRepository.save(marketPost);
    }

    @Override
    public List<MarketPost> getAllMarketPosts() {
        return marketPostRepository.getAllByOrderByDateDesc();
    }

    @Override
    public List<MarketPost> getAllMarketpostsByCategoryId(Long categoryId) {
        return marketPostRepository.getAllByCategoryIdOrderByDateDesc(categoryId);
    }

    @Override
    public Optional<MarketPost> getMarketPostById(Long marketPostId) {
        return marketPostRepository.findById(marketPostId);
    }

    @Override
    public String deleteMarketPost(Long marketPostId) {
        marketPostRepository.deleteById(marketPostId);
        return "Deleted";
    }
}
