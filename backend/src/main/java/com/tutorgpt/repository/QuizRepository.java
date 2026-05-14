package com.tutorgpt.repository;

import com.tutorgpt.model.Course;
import com.tutorgpt.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCourseOrderByCreatedAtDesc(Course course);
}
