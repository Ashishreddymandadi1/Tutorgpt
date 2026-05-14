package com.tutorgpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank
    @Size(max = 2000)
    private String question;

    private int topK = 5;
}
