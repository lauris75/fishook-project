package com.fishook.fishook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "User_Post")
public class UserPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "userId", nullable = false)
    private Long userId;

    @Column(name = "groupId")
    private Long groupId;

    @Column(name = "message", columnDefinition = "TEXT")
    private String content;

    @Column(name = "photoURL", columnDefinition = "TEXT")
    private String photoURL;

    @Column(name = "date", nullable = false)
    private Date date;
}