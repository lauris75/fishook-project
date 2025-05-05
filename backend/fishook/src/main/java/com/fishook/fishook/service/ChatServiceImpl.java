package com.fishook.fishook.service;

import com.fishook.fishook.entity.Chat;
import com.fishook.fishook.repository.ChatRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;

    public ChatServiceImpl(ChatRepository chatRepository) {
        this.chatRepository = chatRepository;
    }
    
    @Override
    public Chat createChat(Chat chat) {
        return chatRepository.save(chat);
    }

    @Override
    public List<Chat> getAllChat() {
        return chatRepository.findAll();
    }

    @Override
    public Optional<Chat> getChatById(Long chatId) {
        return chatRepository.findById(chatId);
    }

    @Override
    public List<Chat> getTwoPersonChat(Long senderId, Long receiverId) {
        return chatRepository.findAllBySenderIdOrReceiverId(senderId, receiverId);
    }

    @Override
    public String deleteChatById(Long chatId) {
        chatRepository.deleteById(chatId);
        return "Deleted";
    }
}
