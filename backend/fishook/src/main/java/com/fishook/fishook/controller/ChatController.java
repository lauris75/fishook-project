package com.fishook.fishook.controller;

import com.fishook.fishook.entity.Chat;
import com.fishook.fishook.service.ChatService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("chat")
@Tag(name = "Chat")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @CrossOrigin
    @PostMapping
    public ResponseEntity createChat(@RequestBody Chat chat) {
        return new ResponseEntity(chatService.createChat(chat), HttpStatus.CREATED);
    }

    @CrossOrigin
    @GetMapping
    public List<Chat> fetchChat() {
        return chatService.getAllChat().stream().map(p -> new Chat(p.getId(), p.getSenderId(), p.getReceiverId(), p.getMessage(), p.getType(), p.getDate())).collect(Collectors.toList());
    }

    @CrossOrigin
    @GetMapping("/{chatId}")
    public Optional<Chat> getChatById(@PathVariable Long chatId) {
        return chatService.getChatById(chatId);
    }

    @CrossOrigin
    @DeleteMapping("/{chatId}")
    public ResponseEntity deleteChat(@PathVariable Long chatId) {
        return new ResponseEntity(chatService.deleteChatById(chatId), HttpStatus.OK);
    }

}
