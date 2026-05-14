package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.tutorgpt.model.QuizQuestion;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QuizQuestionDto {
    private Long id;
    private int position;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctOption;
    private String explanation;

    public static QuizQuestionDto from(QuizQuestion q) {
        return QuizQuestionDto.builder()
                .id(q.getId())
                .position(q.getPosition())
                .questionText(q.getQuestionText())
                .optionA(q.getOptionA())
                .optionB(q.getOptionB())
                .optionC(q.getOptionC())
                .optionD(q.getOptionD())
                .correctOption(q.getCorrectOption())
                .explanation(q.getExplanation())
                .build();
    }
}
