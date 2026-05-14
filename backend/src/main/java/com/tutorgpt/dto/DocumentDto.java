package com.tutorgpt.dto;

import com.tutorgpt.model.Document;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    private Long id;
    private Long courseId;
    private String filename;
    private Integer pageCount;
    private String status;
    private LocalDateTime uploadedAt;
    private LocalDateTime processedAt;

    public static DocumentDto from(Document doc) {
        return DocumentDto.builder()
                .id(doc.getId())
                .courseId(doc.getCourse().getId())
                .filename(doc.getFilename())
                .pageCount(doc.getPageCount())
                .status(doc.getStatus().name())
                .uploadedAt(doc.getUploadedAt())
                .processedAt(doc.getProcessedAt())
                .build();
    }
}
