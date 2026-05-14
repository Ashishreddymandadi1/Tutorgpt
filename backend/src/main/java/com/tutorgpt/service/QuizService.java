package com.tutorgpt.service;

import com.tutorgpt.dto.AiQuizResponse;
import com.tutorgpt.dto.GenerateQuizRequest;
import com.tutorgpt.dto.QuizDto;
import com.tutorgpt.model.Course;
import com.tutorgpt.model.Quiz;
import com.tutorgpt.model.QuizQuestion;
import com.tutorgpt.repository.QuizRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class QuizService {

    private final WebClient aiServiceWebClient;
    private final CourseService courseService;
    private final QuizRepository quizRepository;

    public QuizService(WebClient aiServiceWebClient,
                       CourseService courseService,
                       QuizRepository quizRepository) {
        this.aiServiceWebClient = aiServiceWebClient;
        this.courseService = courseService;
        this.quizRepository = quizRepository;
    }

    @Transactional
    public QuizDto generateQuiz(Long courseId, int numQuestions, String difficulty, UserDetails userDetails) {
        Course course = courseService.getCourseEntity(courseId, userDetails);

        GenerateQuizRequest aiReq = GenerateQuizRequest.builder()
                .courseId(courseId)
                .numQuestions(numQuestions)
                .difficulty(difficulty)
                .build();

        AiQuizResponse aiResponse;
        try {
            aiResponse = aiServiceWebClient.post()
                    .uri("/generate-quiz")
                    .bodyValue(aiReq)
                    .retrieve()
                    .bodyToMono(AiQuizResponse.class)
                    .timeout(Duration.ofSeconds(90))
                    .block();
        } catch (WebClientResponseException e) {
            log.error("AI quiz generation failed {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("AI service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Quiz generation failed for course={}: {}", courseId, e.getMessage());
            throw new IllegalStateException("Quiz generation failed: " + e.getMessage());
        }

        if (aiResponse == null || aiResponse.getQuestions() == null || aiResponse.getQuestions().isEmpty()) {
            throw new IllegalStateException("AI service returned no questions");
        }

        List<QuizQuestion> questions = new ArrayList<>();
        List<AiQuizResponse.AiQuestion> aiQs = aiResponse.getQuestions();
        for (int i = 0; i < aiQs.size(); i++) {
            AiQuizResponse.AiQuestion aq = aiQs.get(i);
            questions.add(QuizQuestion.builder()
                    .position(i)
                    .questionText(aq.getQuestionText())
                    .optionA(aq.getOptionA())
                    .optionB(aq.getOptionB())
                    .optionC(aq.getOptionC())
                    .optionD(aq.getOptionD())
                    .correctOption(aq.getCorrectOption())
                    .explanation(aq.getExplanation())
                    .build());
        }

        Quiz quiz = Quiz.builder()
                .course(course)
                .title(aiResponse.getTitle() != null ? aiResponse.getTitle() : "Course Quiz")
                .questions(questions)
                .build();

        questions.forEach(q -> q.setQuiz(quiz));
        Quiz saved = quizRepository.save(quiz);
        log.info("Generated quiz id={} with {} questions for course={}", saved.getId(), questions.size(), courseId);

        return QuizDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<QuizDto> listQuizzes(Long courseId, UserDetails userDetails) {
        Course course = courseService.getCourseEntity(courseId, userDetails);
        return quizRepository.findByCourseOrderByCreatedAtDesc(course)
                .stream()
                .map(QuizDto::summary)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizDto getQuiz(Long quizId, UserDetails userDetails) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        courseService.getCourseEntity(quiz.getCourse().getId(), userDetails);
        return QuizDto.from(quiz);
    }
}
