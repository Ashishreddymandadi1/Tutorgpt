package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AiFlashcardsRequest {
    @JsonProperty("course_id") private Long courseId;
    @JsonProperty("num_cards") private int numCards;
}
