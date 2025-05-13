package com.fishook.fishook.controller;

import com.fishook.fishook.config.SecurityService;
import com.fishook.fishook.dto.ChatDto;
import com.fishook.fishook.entity.Chat;
import com.fishook.fishook.service.ChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("chat")
@Tag(name = "Chat")
@CrossOrigin(origins = "http://localhost:3000", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ChatController {

    @Autowired
    private ChatService chatService;

    @Autowired
    private SecurityService securityService;

    @PostMapping
    @Operation(summary = "Create a new chat message")
    public ResponseEntity<?> createChat(@RequestBody Chat chat) {
        if (chat.getDate() == null) {
            chat.setDate(new Date());
        }

        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null || !currentUserId.equals(chat.getSenderId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only send messages as yourself");
        }

        Chat savedChat = chatService.createChat(chat);
        return new ResponseEntity<>(savedChat, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get all chat messages")
    public ResponseEntity<List<Chat>> getAllChats() {
        return ResponseEntity.ok(chatService.getAllChat());
    }

    @GetMapping("/my-chats")
    @Operation(summary = "Get all chats for the current user")
    public ResponseEntity<List<ChatDto>> getMyChats() {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ChatDto> userChats = chatService.getAllChatsByUser(currentUserId);
        return ResponseEntity.ok(userChats);
    }

    @GetMapping("/conversation/{userId}")
    @Operation(summary = "Get conversation between current user and specified user")
    public ResponseEntity<List<ChatDto>> getConversation(@PathVariable Long userId) {
        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        List<ChatDto> conversation = chatService.getConversation(currentUserId, userId);
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/{chatId}")
    @Operation(summary = "Get a chat message by ID")
    public ResponseEntity<?> getChatById(@PathVariable Long chatId) {
        Optional<Chat> chat = chatService.getChatById(chatId);
        return chat.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/between/{userId1}/{userId2}")
    @Operation(summary = "Get all chats between two users")
    public ResponseEntity<List<Chat>> getChatsBetweenUsers(
            @PathVariable Long userId1,
            @PathVariable Long userId2) {

        Long currentUserId = securityService.getCurrentUserId();
        if (currentUserId == null || (!currentUserId.equals(userId1) && !currentUserId.equals(userId2))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<Chat> chats = chatService.getTwoPersonChat(userId1, userId2);
        return ResponseEntity.ok(chats);
    }

    @DeleteMapping("/{chatId}")
    @Operation(summary = "Delete a chat message")
    public ResponseEntity<?> deleteChat(@PathVariable Long chatId) {
        String result = chatService.deleteChatById(chatId);

        if (result.startsWith("Unauthorized")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(result);
        } else if (result.equals("Chat not found")) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(result);
    }
}