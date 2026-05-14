package com.tutorgpt.service;

import com.tutorgpt.dto.CourseDto;
import com.tutorgpt.dto.CreateCourseRequest;
import com.tutorgpt.model.Course;
import com.tutorgpt.model.User;
import com.tutorgpt.repository.CourseRepository;
import com.tutorgpt.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public CourseService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseDto> listCourses(UserDetails userDetails) {
        User user = getUser(userDetails);
        return courseRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(CourseDto::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDto getCourse(Long id, UserDetails userDetails) {
        User user = getUser(userDetails);
        Course course = courseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        return CourseDto.from(course);
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request, UserDetails userDetails) {
        User user = getUser(userDetails);
        Course course = Course.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return CourseDto.from(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id, UserDetails userDetails) {
        User user = getUser(userDetails);
        Course course = courseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
        courseRepository.delete(course);
    }

    public Course getCourseEntity(Long id, UserDetails userDetails) {
        User user = getUser(userDetails);
        return courseRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));
    }

    private User getUser(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("User not found"));
    }
}
