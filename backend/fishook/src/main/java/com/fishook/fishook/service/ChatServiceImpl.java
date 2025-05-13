package com.fishook.fishook.service;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.ChatDto;
import com.fishook.fishook.dto.UserDto;
import com.fishook.fishook.entity.Chat;
import com.fishook.fishook.entity.UserEntity;
import com.fishook.fishook.repository.ChatRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ChatServiceImpl implements ChatService {

    private final ChatRepository chatRepository;
    private final UserService userService;
    private final SecurityService securityService;

    public ChatServiceImpl(
            ChatRepository chatRepository,
            UserService userService,
            SecurityService securityService) {
        this.chatRepository = chatRepository;
        this.userService = userService;
        this.securityService = securityService;
    }

    @Override
    public Chat createChat(Chat chat) {
        // Set the current date if not provided
        if (chat.getDate() == null) {
            chat.setDate(new Date());
        }

        return chatRepository.save(chat);
    }

    @Override
    public List<Chat> getAllChat() {
        return chatRepository.findAll();
    }

    @Override
    public List<ChatDto> getAllChatsByUser(Long userId) {
        // Get all chats where the user is either the sender or receiver
        List<Chat> userChats = chatRepository.findAllBySenderIdOrReceiverId(userId, userId);

        // Map Chat entities to ChatDto objects with user information
        return mapChatsToDtos(userChats);
    }

    @Override
    public List<ChatDto> getConversation(Long userId1, Long userId2) {
        // Get all chats between two users
        List<Chat> conversation = chatRepository.findAllBetweenUsers(userId1, userId2);

        // Sort by date (oldest first)
        conversation.sort(Comparator.comparing(Chat::getDate));

        // Map Chat entities to ChatDto objects with user information
        return mapChatsToDtos(conversation);
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
        // Verify the user is authorized to delete this chat
        Optional<Chat> chatOpt = chatRepository.findById(chatId);

        if (chatOpt.isPresent()) {
            Chat chat = chatOpt.get();
            Long currentUserId = securityService.getCurrentUserId();

            // Only allow deletion if current user is the sender
            if (currentUserId != null && currentUserId.equals(chat.getSenderId())) {
                chatRepository.deleteById(chatId);
                return "Deleted";
            } else {
                return "Unauthorized - Only the sender can delete a message";
            }
        }

        return "Chat not found";
    }

    /**
     * Helper method to map Chat entities to ChatDto objects with user information
     */
    private List<ChatDto> mapChatsToDtos(List<Chat> chats) {
        if (chats == null || chats.isEmpty()) {
            return new ArrayList<>();
        }

        return chats.stream().map(chat -> {
            ChatDto dto = new ChatDto();
            dto.setId(chat.getId());
            dto.setSenderId(chat.getSenderId());
            dto.setReceiverId(chat.getReceiverId());
            dto.setMessage(chat.getMessage());
            dto.setType(chat.getType());
            dto.setDate(chat.getDate());

            // Get sender information
            UserEntity sender = userService.getUserById(chat.getSenderId())
                    .orElse(null);

            if (sender != null) {
                UserDto senderDto = new UserDto(
                        sender.getId(),
                        sender.getName(),
                        sender.getLastname(),
                        sender.getEmail(),
                        sender.getProfilePicture(),
                        sender.getDateOfBirth(),
                        null
                );
                dto.setSender(senderDto);
            }

            // Get receiver information
            UserEntity receiver = userService.getUserById(chat.getReceiverId())
                    .orElse(null);

            if (receiver != null) {
                UserDto receiverDto = new UserDto(
                        receiver.getId(),
                        receiver.getName(),
                        receiver.getLastname(),
                        receiver.getEmail(),
                        receiver.getProfilePicture(),
                        receiver.getDateOfBirth(),
                        null
                );
                dto.setReceiver(receiverDto);
            }

            return dto;
        }).collect(Collectors.toList());
    }
}