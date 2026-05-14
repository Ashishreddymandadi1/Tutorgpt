package com.tutorgpt.service;

import com.tutorgpt.dto.DocumentDto;
import com.tutorgpt.model.Course;
import com.tutorgpt.model.Document;
import com.tutorgpt.model.DocumentStatus;
import com.tutorgpt.repository.DocumentRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;

@Service
@Slf4j
public class DocumentService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "pptx", "docx");

    private final DocumentRepository documentRepository;
    private final CourseService courseService;
    private final IngestService ingestService;

    @Value("${upload.dir:./uploads}")
    private String uploadDir;

    public DocumentService(DocumentRepository documentRepository,
                           CourseService courseService,
                           IngestService ingestService) {
        this.documentRepository = documentRepository;
        this.courseService = courseService;
        this.ingestService = ingestService;
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> listDocuments(Long courseId, UserDetails userDetails) {
        Course course = courseService.getCourseEntity(courseId, userDetails);
        return documentRepository.findByCourseOrderByUploadedAtDesc(course)
                .stream()
                .map(DocumentDto::from)
                .toList();
    }

    @Transactional
    public DocumentDto uploadDocument(Long courseId, MultipartFile file, UserDetails userDetails)
            throws IOException {

        validateFile(file);
        Course course = courseService.getCourseEntity(courseId, userDetails);

        // Save file to disk (Files.copy works reliably across Windows drives)
        Path courseDir = Paths.get(uploadDir, String.valueOf(courseId)).toAbsolutePath();
        Files.createDirectories(courseDir);
        String filename = sanitizeFilename(file.getOriginalFilename());
        Path filePath = courseDir.resolve(filename);
        try (var inputStream = file.getInputStream()) {
            Files.copy(inputStream, filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
        }
        log.info("Saved file to {}", filePath);

        // Create DB record
        Document document = Document.builder()
                .course(course)
                .filename(filename)
                .filePath(filePath.toAbsolutePath().toString())
                .status(DocumentStatus.PROCESSING)
                .pageCount(0)
                .build();
        Document saved = documentRepository.save(document);

        // Fire async ingest (returns immediately)
        ingestService.ingestAsync(saved.getId(), courseId, filePath.toAbsolutePath().toString());

        return DocumentDto.from(saved);
    }

    @Transactional
    public void deleteDocument(Long docId, UserDetails userDetails) {
        Document doc = documentRepository.findById(docId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        // Verify ownership via course
        courseService.getCourseEntity(doc.getCourse().getId(), userDetails);

        // Delete file from disk
        try {
            Files.deleteIfExists(Paths.get(doc.getFilePath()));
        } catch (IOException e) {
            log.warn("Could not delete file {}: {}", doc.getFilePath(), e.getMessage());
        }

        documentRepository.delete(doc);
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        String name = file.getOriginalFilename();
        if (name == null) throw new IllegalArgumentException("Invalid filename");
        String ext = name.substring(name.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("Only PDF, PPTX, and DOCX files are supported");
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "file";
        return filename.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
