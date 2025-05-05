package com.fishook.fishook.repository;

import com.fishook.fishook.entity.MarketPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface MarketPostRepository extends JpaRepository<MarketPost, Long> {

    List<MarketPost> getAllByCategoryIdOrderByDateDesc(Long categoryId);

    List<MarketPost> getAllByOrderByDateDesc();
}
