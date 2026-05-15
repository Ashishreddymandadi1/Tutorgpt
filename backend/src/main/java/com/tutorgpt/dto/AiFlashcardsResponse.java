package com.tutorgpt.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiFlashcardsResponse {
    private String title;
    private List<Card> cards;

    @Data
    public static class Card {
        private String front;
        private String back;
    }
}
