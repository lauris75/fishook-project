package com.fishook.fishook.repository;

import com.fishook.fishook.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findAllBySenderIdOrReceiverId(Long senderId, Long receiverId);
    
    @Query("SELECT c FROM Chat c WHERE (c.senderId = :userId1 AND c.receiverId = :userId2) OR (c.senderId = :userId2 AND c.receiverId = :userId1) ORDER BY c.date ASC")
    List<Chat> findAllBetweenUsers(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT DISTINCT c.receiverId FROM Chat c WHERE c.senderId = :userId " +
            "UNION " +
            "SELECT DISTINCT c.senderId FROM Chat c WHERE c.receiverId = :userId")
    List<Long> findDistinctChatPartners(@Param("userId") Long userId);
}