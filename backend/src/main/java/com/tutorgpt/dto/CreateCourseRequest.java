package com.tutorgpt.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateCourseRequest {

    @NotBlank
    @Size(min = 1, max = 255)
    private String name;

    @Size(max = 1000)
    private String description;
}
