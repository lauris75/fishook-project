package com.fishook.fishook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDto {
    private Long id;
    private String name;
    private String lastname;
    private String email;
    private String profilePicture;
    private Date dateOfBirth;
    private String role;
}
