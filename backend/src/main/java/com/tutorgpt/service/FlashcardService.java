package com.tutorgpt.service;

import com.tutorgpt.dto.AiFlashcardsRequest;
import com.tutorgpt.dto.AiFlashcardsResponse;
import com.tutorgpt.dto.FlashcardDto;
import com.tutorgpt.model.Course;
import com.tutorgpt.model.Flashcard;
import com.tutorgpt.model.FlashcardDeck;
import com.tutorgpt.repository.FlashcardDeckRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Service @Slf4j
public class FlashcardService {

    private final WebClient aiServiceWebClient;
    private final CourseService courseService;
    private final FlashcardDeckRepository deckRepository;

    public FlashcardService(WebClient aiServiceWebClient,
                            CourseService courseService,
                            FlashcardDeckRepository deckRepository) {
        this.aiServiceWebClient = aiServiceWebClient;
        this.courseService = courseService;
        this.deckRepository = deckRepository;
    }

    @Transactional
    public FlashcardDto.DeckDto generateDeck(Long courseId, int numCards, UserDetails userDetails) {
        Course course = courseService.getCourseEntity(courseId, userDetails);

        AiFlashcardsResponse aiResponse;
        try {
            aiResponse = aiServiceWebClient.post()
                    .uri("/generate-flashcards")
                    .bodyValue(AiFlashcardsRequest.builder().courseId(courseId).numCards(numCards).build())
                    .retrieve()
                    .bodyToMono(AiFlashcardsResponse.class)
                    .timeout(Duration.ofSeconds(90))
                    .block();
        } catch (WebClientResponseException e) {
            throw new IllegalStateException("AI service error: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            throw new IllegalStateException("Flashcard generation failed: " + e.getMessage());
        }

        if (aiResponse == null || aiResponse.getCards() == null || aiResponse.getCards().isEmpty()) {
            throw new IllegalStateException("AI returned no flashcards");
        }

        List<Flashcard> cards = new ArrayList<>();
        List<AiFlashcardsResponse.Card> aiCards = aiResponse.getCards();
        for (int i = 0; i < aiCards.size(); i++) {
            cards.add(Flashcard.builder()
                    .position(i)
                    .front(aiCards.get(i).getFront())
                    .back(aiCards.get(i).getBack())
                    .build());
        }

        FlashcardDeck deck = FlashcardDeck.builder()
                .course(course)
                .title(aiResponse.getTitle() != null ? aiResponse.getTitle() : "Flashcard Deck")
                .cards(cards)
                .build();
        cards.forEach(c -> c.setDeck(deck));
        FlashcardDeck saved = deckRepository.save(deck);
        log.info("Generated flashcard deck id={} with {} cards for course={}", saved.getId(), cards.size(), courseId);
        return FlashcardDto.DeckDto.from(saved);
    }

    @Transactional(readOnly = true)
    public List<FlashcardDto.DeckDto> listDecks(Long courseId, UserDetails userDetails) {
        Course course = courseService.getCourseEntity(courseId, userDetails);
        return deckRepository.findByCourseOrderByCreatedAtDesc(course)
                .stream().map(FlashcardDto.DeckDto::summary).toList();
    }

    @Transactional(readOnly = true)
    public FlashcardDto.DeckDto getDeck(Long deckId, UserDetails userDetails) {
        FlashcardDeck deck = deckRepository.findById(deckId)
                .orElseThrow(() -> new IllegalArgumentException("Deck not found"));
        courseService.getCourseEntity(deck.getCourse().getId(), userDetails);
        return FlashcardDto.DeckDto.from(deck);
    }
}
