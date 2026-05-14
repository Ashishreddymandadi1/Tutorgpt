package com.tutorgpt.controller;

import com.tutorgpt.dto.DocumentDto;
import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/courses/{courseId}/documents")
    public List<DocumentDto> listDocuments(@PathVariable Long courseId,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        return documentService.listDocuments(courseId, userDetails);
    }

    @PostMapping(value = "/courses/{courseId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(@PathVariable Long courseId,
                                            @RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            DocumentDto dto = documentService.uploadDocument(courseId, file, userDetails);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ErrorResponse.of("INVALID_FILE", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ErrorResponse.of("UPLOAD_FAILED", "File upload failed"));
        }
    }

    @DeleteMapping("/documents/{docId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long docId,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        try {
            documentService.deleteDocument(docId, userDetails);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
