package com.tutorgpt.dto;

import com.tutorgpt.model.Course;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseDto {
    private Long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
    private int documentCount;

    public static CourseDto from(Course course) {
        return CourseDto.builder()
                .id(course.getId())
                .name(course.getName())
                .description(course.getDescription())
                .createdAt(course.getCreatedAt())
                .documentCount(course.getDocuments().size())
                .build();
    }
}
