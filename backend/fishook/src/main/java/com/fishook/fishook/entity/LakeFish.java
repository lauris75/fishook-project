package com.fishook.fishook.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "Lake_Fish")
public class LakeFish {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lakeId", nullable = false)
    private Long lakeId;

    @Column(name = "fishId", nullable = false)
    private Long fishId;
}