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
public class GenerateQuizRequest {
    @JsonProperty("course_id")
    private Long courseId;

    @JsonProperty("num_questions")
    private int numQuestions;

    private String difficulty;
}
