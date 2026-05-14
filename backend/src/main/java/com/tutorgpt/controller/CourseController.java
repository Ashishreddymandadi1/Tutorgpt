package com.tutorgpt.controller;

import com.tutorgpt.dto.CourseDto;
import com.tutorgpt.dto.CreateCourseRequest;
import com.tutorgpt.dto.ErrorResponse;
import com.tutorgpt.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseDto> listCourses(@AuthenticationPrincipal UserDetails userDetails) {
        return courseService.listCourses(userDetails);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCourse(@PathVariable Long id,
                                       @AuthenticationPrincipal UserDetails userDetails) {
        try {
            return ResponseEntity.ok(courseService.getCourse(id, userDetails));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ErrorResponse.of("NOT_FOUND", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CreateCourseRequest request,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(courseService.createCourse(request, userDetails));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id,
                                             @AuthenticationPrincipal UserDetails userDetails) {
        try {
            courseService.deleteCourse(id, userDetails);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
