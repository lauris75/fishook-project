package com.fishook.fishook.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Only include non-null fields in JSON
public class ChatDto {
    private Long id;
    private Long senderId;
    private Long receiverId;
    private String message;
    private String type;
    private Date date;

    private UserDto sender;
    private UserDto receiver;
}