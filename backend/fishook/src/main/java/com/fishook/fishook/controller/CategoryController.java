package com.fishook.fishook.controller;

import com.fishook.fishook.entity.Category;
import com.fishook.fishook.service.CategoryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("category")
@Tag(name = "Category")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createCategory(@RequestBody Category category) {
        return new ResponseEntity<>(categoryService.createCategory(category), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<Category> fetchCategories() {
        return categoryService.getAllCategories().stream().map(p -> new Category(p.getId(), p.getName())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("/{categoryId}")
    public Optional<Category> fetchCategoryById(@PathVariable Long categoryId) {
        return categoryService.getCategoryById(categoryId);
    }

    @CrossOrigin
    @DeleteMapping("/{categoryId}")
    public ResponseEntity deleteUser(@PathVariable Long categoryId) {
        return new ResponseEntity(categoryService.deleteCategory(categoryId), HttpStatus.OK);
    }
}
