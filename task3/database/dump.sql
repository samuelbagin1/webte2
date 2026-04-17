-- MySQL schema dump for curling game
-- Import: mysql -u curling_user -p curling_game < database/dump.sql

CREATE TABLE IF NOT EXISTS players (
    id         INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    nickname   VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS games (
    id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    player1_id  INT,
    player2_id  INT,
    winner_id   INT,
    status      VARCHAR(20) DEFAULT 'in_progress',
    config      JSON NOT NULL,
    started_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id),
    FOREIGN KEY (winner_id)  REFERENCES players(id)
);

CREATE TABLE IF NOT EXISTS throws (
    id          INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    game_id     INT,
    player_id   INT,
    throw_order INT NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id)   REFERENCES games(id)   ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id)
);

CREATE INDEX idx_games_status  ON games(status);
CREATE INDEX idx_games_players ON games(player1_id, player2_id);
CREATE INDEX idx_throws_game   ON throws(game_id);
