package com.tutorgpt.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "quiz_questions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private int position;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "option_a", length = 1000, nullable = false)
    private String optionA;

    @Column(name = "option_b", length = 1000, nullable = false)
    private String optionB;

    @Column(name = "option_c", length = 1000, nullable = false)
    private String optionC;

    @Column(name = "option_d", length = 1000, nullable = false)
    private String optionD;

    @Column(name = "correct_option", length = 1, nullable = false)
    private String correctOption;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
