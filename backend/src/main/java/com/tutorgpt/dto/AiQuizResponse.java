package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

@Data
public class AiQuizResponse {
    private String title;
    private List<AiQuestion> questions;

    @Data
    public static class AiQuestion {
        @JsonProperty("question_text")
        private String questionText;

        @JsonProperty("option_a")
        private String optionA;

        @JsonProperty("option_b")
        private String optionB;

        @JsonProperty("option_c")
        private String optionC;

        @JsonProperty("option_d")
        private String optionD;

        @JsonProperty("correct_option")
        private String correctOption;

        private String explanation;
    }
}
