package com.fishook.fishook.service;

import com.fishook.fishook.entity.Category;

import java.util.List;
import java.util.Optional;

public interface CategoryService {

    Category createCategory(Category category);

    List<Category> getAllCategories();

    Optional<Category> getCategoryById(Long categoryId);

    String deleteCategory(Long categoryId);
}
