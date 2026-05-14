package com.tutorgpt.service;

import com.tutorgpt.dto.IngestRequest;
import com.tutorgpt.dto.IngestResponse;
import com.tutorgpt.model.DocumentStatus;
import com.tutorgpt.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Slf4j
public class IngestService {

    private final WebClient aiServiceWebClient;
    private final DocumentRepository documentRepository;

    public IngestService(WebClient aiServiceWebClient, DocumentRepository documentRepository) {
        this.aiServiceWebClient = aiServiceWebClient;
        this.documentRepository = documentRepository;
    }

    @Async("ingestExecutor")
    public void ingestAsync(Long docId, Long courseId, String filePath) {
        log.info("Starting ingest for doc={} course={}", docId, courseId);
        try {
            IngestRequest request = IngestRequest.builder()
                    .docId(docId)
                    .courseId(courseId)
                    .filePath(filePath)
                    .build();

            IngestResponse response = aiServiceWebClient.post()
                    .uri("/ingest")
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(IngestResponse.class)
                    .timeout(Duration.ofMinutes(10))
                    .block();

            int pageCount = (response != null) ? response.getPageCount() : 0;
            documentRepository.updateStatus(docId, DocumentStatus.READY, LocalDateTime.now(), pageCount);
            log.info("Ingest complete for doc={} pages={}", docId, pageCount);

        } catch (Exception e) {
            log.error("Ingest failed for doc={}: {}", docId, e.getMessage());
            documentRepository.updateStatus(docId, DocumentStatus.FAILED, LocalDateTime.now(), 0);
        }
    }
}
