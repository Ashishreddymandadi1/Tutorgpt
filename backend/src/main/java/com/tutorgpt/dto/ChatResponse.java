package com.tutorgpt.dto;

import lombok.Data;

import java.util.List;

@Data
public class ChatResponse {
    private String answer;
    private List<Citation> citations;
}
