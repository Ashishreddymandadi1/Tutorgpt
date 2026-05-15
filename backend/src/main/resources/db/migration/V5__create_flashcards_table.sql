CREATE TABLE flashcard_decks (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    course_id  BIGINT       NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title      VARCHAR(255) NOT NULL,
    created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flashcards (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    deck_id  BIGINT        NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    position INT           NOT NULL DEFAULT 0,
    front    VARCHAR(1000) NOT NULL,
    back     TEXT          NOT NULL
);
