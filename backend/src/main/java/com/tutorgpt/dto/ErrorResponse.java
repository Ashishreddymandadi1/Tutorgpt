package com.tutorgpt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private ErrorDetail error;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorDetail {
        private String code;
        private String message;
    }

    public static ErrorResponse of(String code, String message) {
        return ErrorResponse.builder()
                .error(ErrorDetail.builder().code(code).message(message).build())
                .build();
    }
}
