package com.fishook.fishook.repository;

import com.fishook.fishook.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;
import java.util.Optional;

@RepositoryRestResource(exported = false)
public interface UserRepository extends JpaRepository<UserEntity, Long> {

    Optional<UserEntity> findByEmail(String email);

    UserEntity getUserEntityById(Long id);
    
    @Query("SELECT u FROM UserEntity u WHERE " +
            "LOWER(u.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastname) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "ORDER BY u.name ASC, u.lastname ASC " +
            "LIMIT :limit")
    List<UserEntity> findByNameOrSurnameContainingIgnoreCase(
            @Param("query") String query,
            @Param("limit") Integer limit);
}