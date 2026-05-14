package com.tutorgpt.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngestRequest {
    @JsonProperty("course_id")
    private Long courseId;

    @JsonProperty("doc_id")
    private Long docId;

    @JsonProperty("file_path")
    private String filePath;
}
