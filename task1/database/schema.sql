CREATE DATABASE IF NOT EXISTS app_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_general_ci;

USE app_db;

-- 1. country
CREATE TABLE country (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 2. athlete
CREATE TABLE athlete (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
    birth_date DATE DEFAULT NULL,
    birth_place VARCHAR(80) DEFAULT NULL,
    birth_country_id INT(11) DEFAULT NULL,
    death_date DATE DEFAULT NULL,
    death_place VARCHAR(80) DEFAULT NULL,
    death_country_id INT(11) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (birth_country_id) REFERENCES country(id) ON DELETE SET NULL,
    FOREIGN KEY (death_country_id) REFERENCES country(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 3. olympics
CREATE TABLE olympics (
    id INT(11) NOT NULL AUTO_INCREMENT,
    type ENUM('LOH', 'ZOH') NOT NULL,
    year INT(11) NOT NULL,
    city VARCHAR(80) NOT NULL,
    country_id INT(11) NOT NULL,
    code VARCHAR(10) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (country_id) REFERENCES country(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 4. discipline
CREATE TABLE discipline (
    id INT(11) NOT NULL AUTO_INCREMENT,
    name VARCHAR(80) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 5. athlete_record
CREATE TABLE athlete_record (
    id INT(11) NOT NULL AUTO_INCREMENT,
    athlete_id INT(11) NOT NULL,
    olympics_id INT(11) NOT NULL,
    discipline_id INT(11) NOT NULL,
    placing INT(11) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (athlete_id) REFERENCES athlete(id) ON DELETE CASCADE,
    FOREIGN KEY (olympics_id) REFERENCES olympics(id),
    FOREIGN KEY (discipline_id) REFERENCES discipline(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 6. users
CREATE TABLE users (
    id INT(11) NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    google_id VARCHAR(255) DEFAULT NULL,
    totp_secret VARCHAR(255) DEFAULT NULL,
    totp_enabled TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_email (email),
    UNIQUE KEY uq_google_id (google_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- 7. login_history
CREATE TABLE login_history (
    id INT(11) NOT NULL AUTO_INCREMENT,
    user_id INT(11) NOT NULL,
    login_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
