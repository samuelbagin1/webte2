CREATE TABLE IF NOT EXISTS players (
    id         SERIAL PRIMARY KEY,
    nickname   VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS games (
    id          SERIAL PRIMARY KEY,
    player1_id  INTEGER REFERENCES players(id),
    player2_id  INTEGER REFERENCES players(id),
    winner_id   INTEGER REFERENCES players(id),
    status      VARCHAR(20) DEFAULT 'in_progress',
    config      JSONB NOT NULL,
    started_at  TIMESTAMP DEFAULT NOW(),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS throws (
    id          SERIAL PRIMARY KEY,
    game_id     INTEGER REFERENCES games(id) ON DELETE CASCADE,
    player_id   INTEGER REFERENCES players(id),
    throw_order INTEGER NOT NULL,
    force_x     FLOAT NOT NULL,
    force_y     FLOAT NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_status  ON games(status);
CREATE INDEX IF NOT EXISTS idx_games_players ON games(player1_id, player2_id);
CREATE INDEX IF NOT EXISTS idx_throws_game   ON throws(game_id);
