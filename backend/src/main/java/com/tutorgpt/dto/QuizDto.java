package com.tutorgpt.dto;

import com.tutorgpt.model.Quiz;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class QuizDto {
    private Long id;
    private Long courseId;
    private String title;
    private LocalDateTime createdAt;
    private List<QuizQuestionDto> questions;

    public static QuizDto from(Quiz quiz) {
        return QuizDto.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourse().getId())
                .title(quiz.getTitle())
                .createdAt(quiz.getCreatedAt())
                .questions(quiz.getQuestions().stream().map(QuizQuestionDto::from).toList())
                .build();
    }

    public static QuizDto summary(Quiz quiz) {
        return QuizDto.builder()
                .id(quiz.getId())
                .courseId(quiz.getCourse().getId())
                .title(quiz.getTitle())
                .createdAt(quiz.getCreatedAt())
                .questions(List.of())
                .build();
    }
}
