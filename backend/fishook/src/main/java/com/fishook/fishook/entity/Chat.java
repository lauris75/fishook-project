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
@Table(name = "Chat")
public class Chat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "senderId", nullable = false)
    private Long senderId;

    @Column(name = "receiverId", nullable = false)
    private Long receiverId;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;
    
    @Column(name = "type", length = 10, nullable = false)
    private String type;

    @Column(name = "date", nullable = false)
    private Date date;
}