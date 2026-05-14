package com.tutorgpt.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final WebClient aiServiceWebClient;

    public HealthController(WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "ok");
        response.put("service", "backend");
        response.put("version", "0.1.0");

        // Call AI service health and include its status
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> aiHealth = aiServiceWebClient
                    .get()
                    .uri("/health")
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block(java.time.Duration.ofSeconds(5));
            response.put("ai_service", aiHealth);
        } catch (Exception e) {
            Map<String, String> aiError = new HashMap<>();
            aiError.put("status", "unreachable");
            aiError.put("error", e.getMessage());
            response.put("ai_service", aiError);
        }

        return response;
    }
}
