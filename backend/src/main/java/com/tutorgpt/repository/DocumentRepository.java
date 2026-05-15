package com.tutorgpt.repository;

import com.tutorgpt.model.Course;
import com.tutorgpt.model.Document;
import com.tutorgpt.model.DocumentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByCourseOrderByUploadedAtDesc(Course course);

    @Query("SELECT COUNT(d) FROM Document d WHERE d.course.user = :user")
    long countByUser(@Param("user") com.tutorgpt.model.User user);

    @Modifying
    @Transactional
    @Query("UPDATE Document d SET d.status = :status, d.processedAt = :now, d.pageCount = :pageCount WHERE d.id = :id")
    void updateStatus(@Param("id") Long id,
                      @Param("status") DocumentStatus status,
                      @Param("now") LocalDateTime now,
                      @Param("pageCount") int pageCount);
}
