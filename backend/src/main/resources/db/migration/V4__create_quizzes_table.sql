CREATE TABLE quizzes (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id  BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE quiz_questions (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    quiz_id       BIGINT        NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    position      INT           NOT NULL DEFAULT 0,
    question_text TEXT          NOT NULL,
    option_a      VARCHAR(1000) NOT NULL,
    option_b      VARCHAR(1000) NOT NULL,
    option_c      VARCHAR(1000) NOT NULL,
    option_d      VARCHAR(1000) NOT NULL,
    correct_option CHAR(1)      NOT NULL,
    explanation   TEXT
);
