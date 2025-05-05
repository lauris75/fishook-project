package com.fishook.fishook.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // Only include non-null fields in JSON
public class PostDto {
    private Long id;
    private Long userId;
    private Long groupId;
    private String content;
    private String photoURL;
    private Date date;
    private UserDto user;

    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLikedByCurrentUser;
    private List<CommentDto> comments;
}
