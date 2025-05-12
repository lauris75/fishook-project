package com.fishook.fishook.service;

import com.fishook.fishook.dto.ChatDto;
import com.fishook.fishook.entity.Chat;

import java.util.List;
import java.util.Optional;

public interface ChatService {

    Chat createChat(Chat chat);

    List<Chat> getAllChat();

    List<ChatDto> getAllChatsByUser(Long userId);

    List<ChatDto> getConversation(Long userId1, Long userId2);

    Optional<Chat> getChatById(Long chatId);

    List<Chat> getTwoPersonChat(Long senderId, Long receiverId);

    String deleteChatById(Long chatId);
}
