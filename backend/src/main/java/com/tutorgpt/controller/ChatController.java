package com.tutorgpt.controller;

import com.tutorgpt.dto.ChatRequest;
import com.tutorgpt.dto.ChatResponse;
import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ChatController {

    private final ChatService chatService;

    public ChatController(ChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/courses/{courseId}/chat")
    public ResponseEntity<?> chat(@PathVariable Long courseId,
                                  @Valid @RequestBody ChatRequest req,
                                  @AuthenticationPrincipal UserDetails userDetails) {
        try {
            ChatResponse response = chatService.chat(courseId, req, userDetails);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ErrorResponse.of("AI_ERROR", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("CHAT_FAILED", "Chat request failed. Please try again."));
        }
    }
}
