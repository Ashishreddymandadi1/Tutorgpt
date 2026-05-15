package com.tutorgpt.dto;

import com.tutorgpt.model.Flashcard;
import com.tutorgpt.model.FlashcardDeck;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class FlashcardDto {
    private Long id;
    private int position;
    private String front;
    private String back;

    public static FlashcardDto from(Flashcard f) {
        return FlashcardDto.builder()
                .id(f.getId()).position(f.getPosition())
                .front(f.getFront()).back(f.getBack())
                .build();
    }

    @Data @Builder
    public static class DeckDto {
        private Long id;
        private Long courseId;
        private String title;
        private LocalDateTime createdAt;
        private List<FlashcardDto> cards;

        public static DeckDto from(FlashcardDeck d) {
            return DeckDto.builder()
                    .id(d.getId()).courseId(d.getCourse().getId())
                    .title(d.getTitle()).createdAt(d.getCreatedAt())
                    .cards(d.getCards().stream().map(FlashcardDto::from).toList())
                    .build();
        }

        public static DeckDto summary(FlashcardDeck d) {
            return DeckDto.builder()
                    .id(d.getId()).courseId(d.getCourse().getId())
                    .title(d.getTitle()).createdAt(d.getCreatedAt())
                    .cards(List.of())
                    .build();
        }
    }
}
