package com.fishook.fishook.repository;

import com.fishook.fishook.entity.Chat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;

import java.util.List;

@RepositoryRestResource(exported = false)
public interface ChatRepository extends JpaRepository<Chat, Long> {

    List<Chat> findAllBySenderIdOrReceiverId(Long senderId, Long receiverId);
}
