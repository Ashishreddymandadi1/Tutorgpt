package com.tutorgpt.controller;

import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.dto.QuizDto;
import com.tutorgpt.service.QuizService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class QuizController {

    private final QuizService quizService;

    public QuizController(QuizService quizService) {
        this.quizService = quizService;
    }

    @PostMapping("/courses/{courseId}/quizzes/generate")
    public ResponseEntity<?> generateQuiz(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "5") int numQuestions,
            @RequestParam(defaultValue = "medium") String difficulty,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            QuizDto quiz = quizService.generateQuiz(courseId, numQuestions, difficulty, userDetails);
            return ResponseEntity.status(HttpStatus.CREATED).body(quiz);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ErrorResponse.of("AI_ERROR", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("QUIZ_FAILED", "Quiz generation failed. Please try again."));
        }
    }

    @GetMapping("/courses/{courseId}/quizzes")
    public ResponseEntity<?> listQuizzes(@PathVariable Long courseId,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<QuizDto> quizzes = quizService.listQuizzes(courseId, userDetails);
            return ResponseEntity.ok(quizzes);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        }
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<?> getQuiz(@PathVariable Long quizId,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        try {
            QuizDto quiz = quizService.getQuiz(quizId, userDetails);
            return ResponseEntity.ok(quiz);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        }
    }
}
