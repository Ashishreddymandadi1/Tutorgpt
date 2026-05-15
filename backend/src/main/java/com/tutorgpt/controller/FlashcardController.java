package com.tutorgpt.controller;

import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.dto.FlashcardDto;
import com.tutorgpt.service.FlashcardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class FlashcardController {

    private final FlashcardService flashcardService;

    public FlashcardController(FlashcardService flashcardService) {
        this.flashcardService = flashcardService;
    }

    @PostMapping("/courses/{courseId}/decks/generate")
    public ResponseEntity<?> generateDeck(
            @PathVariable Long courseId,
            @RequestParam(defaultValue = "10") int numCards,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(flashcardService.generateDeck(courseId, numCards, userDetails));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(ErrorResponse.of("AI_ERROR", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("FAILED", "Flashcard generation failed. Please try again."));
        }
    }

    @GetMapping("/courses/{courseId}/decks")
    public ResponseEntity<?> listDecks(@PathVariable Long courseId,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        try {
            List<FlashcardDto.DeckDto> decks = flashcardService.listDecks(courseId, userDetails);
            return ResponseEntity.ok(decks);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        }
    }

    @GetMapping("/decks/{deckId}")
    public ResponseEntity<?> getDeck(@PathVariable Long deckId,
                                     @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(flashcardService.getDeck(deckId, userDetails));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        }
    }
}
