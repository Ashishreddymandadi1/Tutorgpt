package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class IngestResponse {
    private String status;

    @JsonProperty("page_count")
    private int pageCount;

    private String message;
}
