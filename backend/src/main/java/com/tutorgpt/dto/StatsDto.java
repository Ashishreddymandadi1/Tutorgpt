package com.tutorgpt.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatsDto {
    private long courseCount;
    private long documentCount;
    private long quizCount;
}
