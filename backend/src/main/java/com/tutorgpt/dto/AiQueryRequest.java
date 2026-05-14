package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiQueryRequest {
    @JsonProperty("course_id")
    private Long courseId;

    private String question;

    @JsonProperty("top_k")
    private int topK;
}
