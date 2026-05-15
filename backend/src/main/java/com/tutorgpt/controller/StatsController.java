package com.tutorgpt.controller;

import com.tutorgpt.dto.StatsDto;
import com.tutorgpt.model.User;
import com.tutorgpt.repository.CourseRepository;
import com.tutorgpt.repository.DocumentRepository;
import com.tutorgpt.repository.QuizRepository;
import com.tutorgpt.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class StatsController {

    private final CourseRepository courseRepository;
    private final DocumentRepository documentRepository;
    private final QuizRepository quizRepository;
    private final UserRepository userRepository;

    public StatsController(CourseRepository courseRepository,
                           DocumentRepository documentRepository,
                           QuizRepository quizRepository,
                           UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.documentRepository = documentRepository;
        this.quizRepository = quizRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDto> getStats(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));

        return ResponseEntity.ok(StatsDto.builder()
                .courseCount(courseRepository.countByUser(user))
                .documentCount(documentRepository.countByUser(user))
                .quizCount(quizRepository.countByUser(user))
                .build());
    }
}
