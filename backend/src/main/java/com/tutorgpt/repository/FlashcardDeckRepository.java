package com.tutorgpt.repository;

import com.tutorgpt.model.Course;
import com.tutorgpt.model.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, Long> {
    List<FlashcardDeck> findByCourseOrderByCreatedAtDesc(Course course);
}
