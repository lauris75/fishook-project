package com.fishook.fishook.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LakeUpdateRequest {
    private String name;
    private String summary;
    private String description;
    private String latitude;
    private String longitude;
    private Double area;
    private Double coastlineLength;
}