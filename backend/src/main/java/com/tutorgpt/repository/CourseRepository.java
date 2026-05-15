package com.tutorgpt.repository;

import com.tutorgpt.model.Course;
import com.tutorgpt.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByUserOrderByCreatedAtDesc(User user);
    Optional<Course> findByIdAndUser(Long id, User user);
    long countByUser(User user);
}
