package com.tutorgpt.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flashcards")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Flashcard {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private FlashcardDeck deck;

    @Column(nullable = false)
    private int position;

    @Column(length = 1000, nullable = false)
    private String front;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String back;
}
