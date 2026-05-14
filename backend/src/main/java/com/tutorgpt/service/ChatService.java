package com.tutorgpt.service;

import com.tutorgpt.dto.AiQueryRequest;
import com.tutorgpt.dto.ChatRequest;
import com.tutorgpt.dto.ChatResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

@Service
@Slf4j
public class ChatService {

    private final WebClient aiServiceWebClient;
    private final CourseService courseService;

    public ChatService(WebClient aiServiceWebClient, CourseService courseService) {
        this.aiServiceWebClient = aiServiceWebClient;
        this.courseService = courseService;
    }

    public ChatResponse chat(Long courseId, ChatRequest req, UserDetails userDetails) {
        // Verify course ownership
        courseService.getCourseEntity(courseId, userDetails);

        AiQueryRequest aiRequest = AiQueryRequest.builder()
                .courseId(courseId)
                .question(req.getQuestion())
                .topK(req.getTopK() > 0 ? req.getTopK() : 5)
                .build();

        try {
            ChatResponse response = aiServiceWebClient.post()
                    .uri("/query")
                    .bodyValue(aiRequest)
                    .retrieve()
                    .bodyToMono(ChatResponse.class)
                    .timeout(Duration.ofSeconds(60))
                    .block();

            return response != null ? response : emptyResponse("No response from AI service");
        } catch (WebClientResponseException e) {
            log.error("AI query failed {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new IllegalStateException("AI service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Chat failed for course={}: {}", courseId, e.getMessage());
            throw new IllegalStateException("Chat failed: " + e.getMessage());
        }
    }

    private ChatResponse emptyResponse(String message) {
        ChatResponse r = new ChatResponse();
        r.setAnswer(message);
        r.setCitations(java.util.List.of());
        return r;
    }
}
