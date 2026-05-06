-- task4 database setup
-- Run with: mysql -u USERNAME -p app_db < task4_setup.sql
-- Uses IF NOT EXISTS everywhere so it is safe on shared databases.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------
-- Laravel framework tables (safe to skip if they exist)
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
    `id`                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`              VARCHAR(255)    NOT NULL,
    `email`             VARCHAR(255)    NOT NULL UNIQUE,
    `email_verified_at` TIMESTAMP       NULL,
    `password`          VARCHAR(255)    NOT NULL,
    `remember_token`    VARCHAR(100)    NULL,
    `created_at`        TIMESTAMP       NULL,
    `updated_at`        TIMESTAMP       NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `email`      VARCHAR(255) NOT NULL PRIMARY KEY,
    `token`      VARCHAR(255) NOT NULL,
    `created_at` TIMESTAMP    NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sessions` (
    `id`            VARCHAR(255) NOT NULL PRIMARY KEY,
    `user_id`       BIGINT UNSIGNED NULL,
    `ip_address`    VARCHAR(45)  NULL,
    `user_agent`    TEXT         NULL,
    `payload`       LONGTEXT     NOT NULL,
    `last_activity` INT          NOT NULL,
    INDEX `sessions_user_id_index` (`user_id`),
    INDEX `sessions_last_activity_index` (`last_activity`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache` (
    `key`        VARCHAR(255) NOT NULL PRIMARY KEY,
    `value`      MEDIUMTEXT   NOT NULL,
    `expiration` BIGINT       NOT NULL,
    INDEX `cache_expiration_index` (`expiration`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cache_locks` (
    `key`        VARCHAR(255) NOT NULL PRIMARY KEY,
    `owner`      VARCHAR(255) NOT NULL,
    `expiration` BIGINT       NOT NULL,
    INDEX `cache_locks_expiration_index` (`expiration`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `jobs` (
    `id`           BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `queue`        VARCHAR(255)      NOT NULL,
    `payload`      LONGTEXT          NOT NULL,
    `attempts`     SMALLINT UNSIGNED NOT NULL,
    `reserved_at`  INT UNSIGNED      NULL,
    `available_at` INT UNSIGNED      NOT NULL,
    `created_at`   INT UNSIGNED      NOT NULL,
    INDEX `jobs_queue_index` (`queue`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `job_batches` (
    `id`              VARCHAR(255) NOT NULL PRIMARY KEY,
    `name`            VARCHAR(255) NOT NULL,
    `total_jobs`      INT          NOT NULL,
    `pending_jobs`    INT          NOT NULL,
    `failed_jobs`     INT          NOT NULL,
    `failed_job_ids`  LONGTEXT     NOT NULL,
    `options`         MEDIUMTEXT   NULL,
    `cancelled_at`    INT          NULL,
    `created_at`      INT          NOT NULL,
    `finished_at`     INT          NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `failed_jobs` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `uuid`       VARCHAR(255)    NOT NULL UNIQUE,
    `connection` TEXT            NOT NULL,
    `queue`      TEXT            NOT NULL,
    `payload`    LONGTEXT        NOT NULL,
    `exception`  LONGTEXT        NOT NULL,
    `failed_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- task4 application tables
-- -------------------------------------------------------

CREATE TABLE IF NOT EXISTS `countries` (
    `id`            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `iso_code`      CHAR(2)         NOT NULL UNIQUE,
    `name_sk`       VARCHAR(255)    NOT NULL,
    `capital`       VARCHAR(255)    NOT NULL,
    `currency_code` CHAR(3)         NOT NULL,
    `created_at`    TIMESTAMP       NULL,
    `updated_at`    TIMESTAMP       NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destination_types` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `code`       VARCHAR(255)    NOT NULL UNIQUE,
    `name_sk`    VARCHAR(255)    NOT NULL,
    `created_at` TIMESTAMP       NULL,
    `updated_at` TIMESTAMP       NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destinations` (
    `id`                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `name`                      VARCHAR(255)    NOT NULL,
    `country_id`                BIGINT UNSIGNED NOT NULL,
    `latitude`                  DECIMAL(9,6)    NOT NULL,
    `longitude`                 DECIMAL(9,6)    NOT NULL,
    `flight_hours_from_vienna`  DECIMAL(4,1)    NOT NULL,
    `description_sk`            TEXT            NOT NULL,
    `image_url`                 TEXT            NULL,
    `created_at`                TIMESTAMP       NULL,
    `updated_at`                TIMESTAMP       NULL,
    CONSTRAINT `destinations_country_id_foreign` FOREIGN KEY (`country_id`) REFERENCES `countries` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `monthly_climates` (
    `id`                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `destination_id`    BIGINT UNSIGNED  NOT NULL,
    `month`             TINYINT UNSIGNED NOT NULL,
    `temp_avg`          DECIMAL(4,1)     NOT NULL,
    `temp_min`          DECIMAL(4,1)     NOT NULL,
    `temp_max`          DECIMAL(4,1)     NOT NULL,
    `precipitation_pct` DECIMAL(5,2)     NOT NULL,
    `wind_avg`          DECIMAL(5,2)     NOT NULL,
    UNIQUE KEY `monthly_climates_destination_month_unique` (`destination_id`, `month`),
    CONSTRAINT `monthly_climates_destination_id_foreign`
        FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `destination_destination_type` (
    `destination_id`      BIGINT UNSIGNED NOT NULL,
    `destination_type_id` BIGINT UNSIGNED NOT NULL,
    PRIMARY KEY (`destination_id`, `destination_type_id`),
    CONSTRAINT `ddt_destination_id_foreign`      FOREIGN KEY (`destination_id`)      REFERENCES `destinations`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `ddt_destination_type_id_foreign` FOREIGN KEY (`destination_type_id`) REFERENCES `destination_types` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `searches` (
    `id`               BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `trip_types`       JSON             NOT NULL,
    `temperature_pref` VARCHAR(255)     NOT NULL,
    `max_flight_hours` DECIMAL(4,1)     NULL,
    `start_date`       DATE             NOT NULL,
    `end_date`         DATE             NOT NULL,
    `month`            TINYINT UNSIGNED NOT NULL,
    `created_at`       TIMESTAMP        NULL,
    `updated_at`       TIMESTAMP        NULL
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `search_results` (
    `id`             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `search_id`      BIGINT UNSIGNED NOT NULL,
    `destination_id` BIGINT UNSIGNED NOT NULL,
    `match_score`    DECIMAL(5,2)    NOT NULL,
    `created_at`     TIMESTAMP       NULL,
    `updated_at`     TIMESTAMP       NULL,
    CONSTRAINT `search_results_search_id_foreign`      FOREIGN KEY (`search_id`)      REFERENCES `searches`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `search_results_destination_id_foreign` FOREIGN KEY (`destination_id`) REFERENCES `destinations` (`id`) ON DELETE CASCADE
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `visits` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ip_hash`    CHAR(64)        NOT NULL,
    `visited_at` TIMESTAMP       NOT NULL,
    INDEX `visits_visited_at_ip_hash_index` (`visited_at`, `ip_hash`)
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -------------------------------------------------------
-- Seed: destination_types
-- -------------------------------------------------------

INSERT INTO `destination_types` (`code`, `name_sk`, `created_at`, `updated_at`) VALUES
    ('sea_beach',  'More a pláž',               NOW(), NOW()),
    ('mountains',  'Hory a príroda',             NOW(), NOW()),
    ('historic',   'Historické mestá',           NOW(), NOW()),
    ('city_break', 'Mestský výlet',              NOW(), NOW()),
    ('adventure',  'Aktivity a dobrodružstvo',   NOW(), NOW())
ON DUPLICATE KEY UPDATE `name_sk` = VALUES(`name_sk`), `updated_at` = NOW();

-- -------------------------------------------------------
-- Seed: countries
-- -------------------------------------------------------

INSERT INTO `countries` (`iso_code`, `name_sk`, `capital`, `currency_code`, `created_at`, `updated_at`) VALUES
    ('AT', 'Rakúsko',            'Viedeň',    'EUR', NOW(), NOW()),
    ('CH', 'Švajčiarsko',        'Bern',      'CHF', NOW(), NOW()),
    ('CZ', 'Česko',              'Praha',     'CZK', NOW(), NOW()),
    ('DE', 'Nemecko',            'Berlín',    'EUR', NOW(), NOW()),
    ('DK', 'Dánsko',             'Kodaň',     'DKK', NOW(), NOW()),
    ('EG', 'Egypt',              'Káhira',    'EGP', NOW(), NOW()),
    ('ES', 'Španielsko',         'Madrid',    'EUR', NOW(), NOW()),
    ('FR', 'Francúzsko',         'Paríž',     'EUR', NOW(), NOW()),
    ('GB', 'Spojené kráľovstvo', 'Londýn',    'GBP', NOW(), NOW()),
    ('GR', 'Grécko',             'Atény',     'EUR', NOW(), NOW()),
    ('HR', 'Chorvátsko',         'Záhreb',    'EUR', NOW(), NOW()),
    ('HU', 'Maďarsko',           'Budapešť',  'HUF', NOW(), NOW()),
    ('IE', 'Írsko',              'Dublin',    'EUR', NOW(), NOW()),
    ('IS', 'Island',             'Reykjavík', 'ISK', NOW(), NOW()),
    ('IT', 'Taliansko',          'Rím',       'EUR', NOW(), NOW()),
    ('JO', 'Jordánsko',          'Ammán',     'JOD', NOW(), NOW()),
    ('MA', 'Maroko',             'Rabat',     'MAD', NOW(), NOW()),
    ('MT', 'Malta',              'Valletta',  'EUR', NOW(), NOW()),
    ('NL', 'Holandsko',          'Amsterdam', 'EUR', NOW(), NOW()),
    ('NO', 'Nórsko',             'Oslo',      'NOK', NOW(), NOW()),
    ('PL', 'Poľsko',             'Varšava',   'PLN', NOW(), NOW()),
    ('PT', 'Portugalsko',        'Lisabon',   'EUR', NOW(), NOW()),
    ('SE', 'Švédsko',            'Štokholm',  'SEK', NOW(), NOW()),
    ('SI', 'Slovinsko',          'Ľubľana',   'EUR', NOW(), NOW()),
    ('SK', 'Slovensko',          'Bratislava','EUR', NOW(), NOW()),
    ('TR', 'Turecko',            'Ankara',    'TRY', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name_sk` = VALUES(`name_sk`), `updated_at` = NOW();

-- -------------------------------------------------------
-- Seed: destinations
-- (country_id resolved via subquery on iso_code)
-- -------------------------------------------------------

INSERT INTO `destinations` (`name`, `country_id`, `latitude`, `longitude`, `flight_hours_from_vienna`, `description_sk`, `image_url`, `created_at`, `updated_at`) VALUES
    ('Barcelona',              (SELECT id FROM countries WHERE iso_code='ES'), 41.387400,   2.168600,  2.4, 'Katalánska metropola spája mestské pamiatky, Gaudího architektúru a pláže pri Stredozemnom mori.', 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blt98aab8678ac3bce7/663907b78447cbf1b69ca84f/logan-armstrong-hVhfqhDYciU-unsplash-edited-MOBILE-HEADER.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart', NOW(), NOW()),
    ('Palma de Mallorca',      (SELECT id FROM countries WHERE iso_code='ES'), 39.569600,   2.650200,  2.4, 'Slnečné Baleáry s plážami, prístavom a gotickou katedrálou v kompaktnom centre.', 'https://cabauhotels.com/wp-content/uploads/2025/08/cathedral-de-palma-de-mallorca.webp', NOW(), NOW()),
    ('Nice',                   (SELECT id FROM countries WHERE iso_code='FR'), 43.710200,   7.262000,  1.8, 'Azúrové pobrežie s promenádou, starým mestom a ľahkým výletom do Monaka či Cannes.', 'https://www.franceguide.info/wp-content/uploads/sites/18/nice_ss.jpg', NOW(), NOW()),
    ('Split',                  (SELECT id FROM countries WHERE iso_code='HR'), 43.508100,  16.440200,  1.3, 'Dalmátske mesto pri mori s Diokleciánovým palácom a ostrovmi na dosah trajektom.', 'https://gotripzi.com/cdn-cgi/image/onerror=redirect,width=3200,height=2400,fit=cover,format=png/_astro/split-hr-city.D_xGwkjt.webp', NOW(), NOW()),
    ('Mykonos',                (SELECT id FROM countries WHERE iso_code='GR'), 37.446700,  25.328900,  2.3, 'Kykladský ostrov s bielymi uličkami, veternými mlynmi a živými plážami.', 'https://cdn1.travala.com/wp-content/uploads/2020/03/Mykonos.jpg', NOW(), NOW()),
    ('Antalya',                (SELECT id FROM countries WHERE iso_code='TR'), 36.896900,  30.713300,  2.6, 'Turecká riviéra ponúka teplé more, all-inclusive rezorty a historické centrum Kaleici.', 'https://www.travelassistant24.com/operation/blog_images/best-of-antalya.jpg', NOW(), NOW()),
    ('Hurghada',               (SELECT id FROM countries WHERE iso_code='EG'), 27.257900,  33.811600,  3.8, 'Letovisko pri Červenom mori s celoročným teplom, koralmi a výbornými podmienkami na šnorchlovanie.', 'https://c.ccdn.sk/21476/uploads/fs_images/contentnews/106/dovolenka-hurghada_395_o.jpg', NOW(), NOW()),
    ('Dubrovník',              (SELECT id FROM countries WHERE iso_code='HR'), 42.650700,  18.094400,  1.4, 'Historické hradby nad Jadranom, kamenné uličky a výhľady z lanovky na Srď.', 'https://www.fischer.sk/getmedia/043290bc-14d8-42fc-a687-df87e10368fe/dubrovnik-0_1200x0.jpg.aspx?maxsidesize=1200&resizemode=force', NOW(), NOW()),
    ('Innsbruck',              (SELECT id FROM countries WHERE iso_code='AT'), 47.269200,  11.404100,  1.0, 'Alpské mesto s lanovkami priamo z centra, zimnými športmi a výhľadmi na Nordkette.', 'https://www.visitaustria.info/en/wp-content/uploads/sites/171/innsbruck-river-hd.jpg', NOW(), NOW()),
    ('Chamonix',               (SELECT id FROM countries WHERE iso_code='FR'), 45.923700,   6.869400,  2.0, 'Ikonické horské stredisko pod Mont Blancom pre turistiku, lyžovanie a lanovku Aiguille du Midi.', 'https://www.peakretreats.co.uk/media/oh5huxwy/chamonix-rafting.webp?width=952&height=660&v=1dbc50ab8de8fe0', NOW(), NOW()),
    ('Zermatt',                (SELECT id FROM countries WHERE iso_code='CH'), 46.020700,   7.749100,  2.2, 'Bezautové švajčiarske stredisko s výhľadom na Matterhorn a celoročnými horskými trasami.', 'https://ca-times.brightspotcdn.com/dims4/default/a1ea1c3/2147483647/strip/true/crop/1600x1068+0+0/resize/1200x801!/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F93%2F73%2Ff8cdbf69427bb67a4d444b990063%2Fswiss-zermatt-matterhorn-city-village.jpg', NOW(), NOW()),
    ('Reykjavík',              (SELECT id FROM countries WHERE iso_code='IS'), 64.146600, -21.942600,  4.3, 'Severská základňa pre gejzíry, vodopády, lávové polia a termálne kúpele.', 'https://images.contentstack.io/v3/assets/blt06f605a34f1194ff/blte67f0786c0491036/687e464355acc485bfa5421d/einar-h-reynis-Y1MQ6zlQAj8-unsplash-header_mobile.jpg?fit=crop&disable=upscale&auto=webp&quality=60&crop=smart', NOW(), NOW()),
    ('Bergen',                 (SELECT id FROM countries WHERE iso_code='NO'), 60.391300,   5.322100,  2.8, 'Nórske mesto medzi fjordmi a horami, známe dreveným nábrežím Bryggen.', 'https://cdn.sanity.io/images/jlrwvnbf/production/1bd5824db550ed25de29090b5c31c167e7e82323-4426x2951.jpg?fp-x=0.7598282873926796&fp-y=0.5299898339545916&w=2048&h=1152&q=75&fit=crop&crop=focalpoint&auto=format', NOW(), NOW()),
    ('Tatranská Lomnica',      (SELECT id FROM countries WHERE iso_code='SK'), 49.166700,  20.283300,  1.0, 'Vysokotatranská obec s prístupom na Skalnaté pleso, Lomnický štít a turistické chodníky.', 'https://hotellomnicask.b-cdn.net/wp-content/webp-express/webp-images/uploads/2022/11/pohlad-na-vysoke-tatry-01-1024x436.jpg.webp', NOW(), NOW()),
    ('Garmisch-Partenkirchen', (SELECT id FROM countries WHERE iso_code='DE'), 47.491700,  11.095500,  1.0, 'Bavorské horské mestečko pri Zugspitze s tiesňavou Partnachklamm a alpskou atmosférou.', 'https://www.wikinger-reisen.de/bilder/reiseseiten/eibsee-mit-zugspitze-d25218-t.webp', NOW(), NOW()),
    ('Rím',                    (SELECT id FROM countries WHERE iso_code='IT'), 41.902800,  12.496400,  1.6, 'Večné mesto s Koloseom, fórami, fontánami a kuchyňou, ktorá funguje celoročne.', 'https://www.bts.aero/content/destinations/12/rim-big.jpg', NOW(), NOW()),
    ('Atény',                  (SELECT id FROM countries WHERE iso_code='GR'), 37.983800,  23.727500,  2.1, 'Kolíska antiky s Akropolou, múzeami, tavernami a rýchlym prístupom k moru.', 'https://www.satur.sk/media/cache/1920x675/page/2354_6481e3d8a1d02.jpeg', NOW(), NOW()),
    ('Praha',                  (SELECT id FROM countries WHERE iso_code='CZ'), 50.075500,  14.437800,  1.0, 'Historické centrum s Pražským hradom, Karlovým mostom a živou kaviarenskou scénou.', 'https://cdn.kudyznudy.cz/files/1e/1e5055e1-be93-4470-97b9-8d16040373cd.webp?v=20221001055846', NOW(), NOW()),
    ('Krakov',                 (SELECT id FROM countries WHERE iso_code='PL'), 50.064700,  19.945000,  1.0, 'Poľské kultúrne mesto s Rynekom, Wawelom a štvrťou Kazimierz.', 'https://cdn.obletsvet.cz/images/58fd6ae5-e2a4-4b80-916b-1968d9ecde54/rynek-glowny-11--w64.jpg', NOW(), NOW()),
    ('Istanbul',               (SELECT id FROM countries WHERE iso_code='TR'), 41.008200,  28.978400,  2.3, 'Mesto medzi Európou a Áziou s mešitami, bazármi, Bosporom a bohatou gastronómiou.', 'https://www.travel.sk/images/0x1080/turecko/istanbul/istanbul-mesto-tisicich-pribehov/istanbul-mesto-tisicich-pribehov-74b511.webp', NOW(), NOW()),
    ('Budapešť',               (SELECT id FROM countries WHERE iso_code='HU'), 47.497900,  19.040200,  1.0, 'Dunajská metropola s termálnymi kúpeľmi, parlamentom a výraznou večernou atmosférou.', 'https://cdn.pelipecky.sk/wp-content/uploads/2018/04/budapest.jpg', NOW(), NOW()),
    ('Edinburgh',              (SELECT id FROM countries WHERE iso_code='GB'), 55.953300,  -3.188300,  2.7, 'Škótske hlavné mesto s hradom, stredovekými uličkami a výstupom na Arthur''s Seat.', 'https://media.cntraveller.com/photos/611be9e3d5b6f5a4a3def392/16:9/w_1280,c_limit/Mountain-view-over-city-Edinburgh-scotland-conde-nast-traveller-28jul17-iStock.jpg', NOW(), NOW()),
    ('Lisabon',                (SELECT id FROM countries WHERE iso_code='PT'), 38.722300,  -9.139300,  3.5, 'Slnečné mesto na kopcoch s električkami, vyhliadkami, fado a výletmi k Atlantiku.', 'https://loudavymkrokem.cz/wp-content/uploads/2024/12/Lisabon-1.jpg.webp', NOW(), NOW()),
    ('Paríž',                  (SELECT id FROM countries WHERE iso_code='FR'), 48.856600,   2.352200,  2.1, 'Klasický mestský výlet s múzeami, architektúrou, parkmi a večernými prechádzkami pri Seine.', 'https://data.ceskekormidlo.cz/Zajezd/14177/142480.jpeg', NOW(), NOW()),
    ('Londýn',                 (SELECT id FROM countries WHERE iso_code='GB'), 51.507200,  -0.127600,  2.5, 'Veľkomesto s múzeami, divadlami, trhmi, parkmi a ikonickými štvrťami.', 'https://www.bts.aero/content/destinations/24/londyn-big.jpg', NOW(), NOW()),
    ('Amsterdam',              (SELECT id FROM countries WHERE iso_code='NL'), 52.367600,   4.904100,  1.9, 'Kanály, bicykle, galérie a kompaktné centrum ideálne na predĺžený víkend.', 'https://top20.amsterdam/images/things-to-do-in-amsterdam.webp', NOW(), NOW()),
    ('Berlín',                 (SELECT id FROM countries WHERE iso_code='DE'), 52.520000,  13.405000,  1.4, 'Kreatívna metropola s históriou 20. storočia, múzeami, hudbou a rozmanitými štvrťami.', 'https://www.civitatis.com/f/alemania/berlin/berlin.jpg', NOW(), NOW()),
    ('Viedeň',                 (SELECT id FROM countries WHERE iso_code='AT'), 48.208200,  16.373800,  0.0, 'Elegantné mesto s palácmi, múzeami, kaviarňami a výbornou verejnou dopravou.', 'https://my-utmost.com/img/rakusko/vieden/01.jpg', NOW(), NOW()),
    ('Kodaň',                  (SELECT id FROM countries WHERE iso_code='DK'), 55.676100,  12.568300,  1.8, 'Severské hlavné mesto s prístavom, cyklistikou, dizajnom a štvrťou Nyhavn.', 'https://www.letenkyzababku.sk/wp-content/uploads/2015/05/9568217715_1017ebbc6f_o.jpg', NOW(), NOW()),
    ('Štokholm',               (SELECT id FROM countries WHERE iso_code='SE'), 59.329300,  18.068600,  2.2, 'Mesto na ostrovoch s historickým Gamla Stan, múzeami a blízkou prírodou.', 'https://storage.kadetade.com/feature_image/4d6eb123-d786-4330-8d33-0632f7748d1c/show_big_Stockholm_hd_1.jpg', NOW(), NOW()),
    ('Dublin',                 (SELECT id FROM countries WHERE iso_code='IE'), 53.349800,  -6.260300,  2.8, 'Írske hlavné mesto s literárnou históriou, pubmi, parkmi a výletmi na pobrežie.', 'https://images.trvl-media.com/place/553248621555818193/7c32903c-f4b9-4e29-9af6-9d9ee5d425b7.jpg', NOW(), NOW()),
    ('Marrákeš',               (SELECT id FROM countries WHERE iso_code='MA'), 31.629500,  -7.981100,  3.8, 'Farebné marocké mesto so súkmi, palácmi, záhradami a bránou k Atlasu.', 'https://i0.wp.com/mytravelation.com/wp-content/uploads/2024/05/Marrakesh.jpg?resize=724%2C483&ssl=1', NOW(), NOW()),
    ('Petra (Wadi Musa)',      (SELECT id FROM countries WHERE iso_code='JO'), 30.328500,  35.444400,  3.6, 'Skalné mesto v Jordánsku s dramatickými kaňonmi, chrámami a púštnou krajinou.', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0d/7a/45/44/treasury.jpg?w=600&h=-1&s=1', NOW(), NOW()),
    ('Madeira (Funchal)',      (SELECT id FROM countries WHERE iso_code='PT'), 32.666900, -16.924100,  4.4, 'Atlantický ostrov s levádami, útesmi, subtropickou zeleňou a celoročnou turistikou.', 'https://ber.berlin-airport.de/en/flying/airlines-ziele/inspiration-urlaub/dest-192-funchal/_jcr_content/root/responsivegrid/gallery_copy_2423635_1895900913/galleryimage_1707436834.coreimg.jpeg/1748584631076/2024-04-29-funchal-1.jpeg', NOW(), NOW()),
    ('Tenerife (Costa Adeje)', (SELECT id FROM countries WHERE iso_code='ES'), 28.086600, -16.735700,  4.8, 'Kanársky ostrov s plážami, sopkou Teide a stabilným počasím počas väčšiny roka.', 'https://www.cestee.sk/images/22/85/92285-2560.jpeg', NOW(), NOW()),
    ('Kapadócia (Goreme)',     (SELECT id FROM countries WHERE iso_code='TR'), 38.643100,  34.828900,  3.1, 'Rozprávková krajina tufových komínov, údolí a letov balónom nad Goreme.', 'https://media-cdn.tripadvisor.com/media/attractions-splice-spp-674x446/14/cb/07/23.jpg', NOW(), NOW()),
    ('Benátky',                (SELECT id FROM countries WHERE iso_code='IT'), 45.440800,  12.315500,  1.1, 'Lagúnové mesto s kanálmi, palácmi, ostrovmi a výraznou historickou atmosférou.', 'https://www.letenkyzababku.sk/wp-content/uploads/2020/02/shutterstock_109982438-2.jpg', NOW(), NOW()),
    ('Sevilla',                (SELECT id FROM countries WHERE iso_code='ES'), 37.389100,  -5.984500,  3.1, 'Andalúzske mesto s Alcázarom, flamencovou kultúrou a teplými večermi v starom centre.', 'https://images.winalist.com/blog/wp-content/uploads/2025/05/07154809/adobestock-167195068-1500x1039.jpeg', NOW(), NOW()),
    ('Valletta',               (SELECT id FROM countries WHERE iso_code='MT'), 35.899700,  14.514600,  2.2, 'Maltské hlavné mesto s pevnosťami, prístavmi, kamennými ulicami a blízkymi zátokami.', 'https://res.klook.com/image/upload/fl_lossy.progressive,q_60/Mobile/City/zueivkgiev9oglodjzf4.jpg', NOW(), NOW()),
    ('Ľubľana',                (SELECT id FROM countries WHERE iso_code='SI'), 46.056900,  14.505800,  1.0, 'Kompaktné slovinské mesto s hradom, riekou Ljubljanica a rýchlym prístupom k Alpám aj jazerám.', 'https://slevomat.sgcdn.cz/images/t/2000/18/22/18229354-83d076.webp', NOW(), NOW())
ON DUPLICATE KEY UPDATE `updated_at` = NOW();

-- -------------------------------------------------------
-- Seed: destination_destination_type (pivot)
-- -------------------------------------------------------

INSERT IGNORE INTO `destination_destination_type` (`destination_id`, `destination_type_id`)
SELECT d.id, dt.id FROM destinations d, destination_types dt
WHERE (d.name='Barcelona'              AND dt.code IN ('sea_beach','historic','city_break'))
   OR (d.name='Palma de Mallorca'      AND dt.code IN ('sea_beach','city_break'))
   OR (d.name='Nice'                   AND dt.code IN ('sea_beach','city_break'))
   OR (d.name='Split'                  AND dt.code IN ('sea_beach','historic'))
   OR (d.name='Mykonos'                AND dt.code IN ('sea_beach'))
   OR (d.name='Antalya'                AND dt.code IN ('sea_beach','historic'))
   OR (d.name='Hurghada'               AND dt.code IN ('sea_beach','adventure'))
   OR (d.name='Dubrovník'              AND dt.code IN ('sea_beach','historic'))
   OR (d.name='Innsbruck'              AND dt.code IN ('mountains','city_break'))
   OR (d.name='Chamonix'               AND dt.code IN ('mountains','adventure'))
   OR (d.name='Zermatt'                AND dt.code IN ('mountains','adventure'))
   OR (d.name='Reykjavík'              AND dt.code IN ('mountains','adventure','city_break'))
   OR (d.name='Bergen'                 AND dt.code IN ('mountains','historic'))
   OR (d.name='Tatranská Lomnica'      AND dt.code IN ('mountains','adventure'))
   OR (d.name='Garmisch-Partenkirchen' AND dt.code IN ('mountains','historic'))
   OR (d.name='Rím'                    AND dt.code IN ('historic','city_break'))
   OR (d.name='Atény'                  AND dt.code IN ('historic','city_break'))
   OR (d.name='Praha'                  AND dt.code IN ('historic','city_break'))
   OR (d.name='Krakov'                 AND dt.code IN ('historic','city_break'))
   OR (d.name='Istanbul'               AND dt.code IN ('historic','city_break'))
   OR (d.name='Budapešť'               AND dt.code IN ('historic','city_break'))
   OR (d.name='Edinburgh'              AND dt.code IN ('historic','city_break','mountains'))
   OR (d.name='Lisabon'                AND dt.code IN ('historic','city_break','sea_beach'))
   OR (d.name='Paríž'                  AND dt.code IN ('city_break','historic'))
   OR (d.name='Londýn'                 AND dt.code IN ('city_break','historic'))
   OR (d.name='Amsterdam'              AND dt.code IN ('city_break','historic'))
   OR (d.name='Berlín'                 AND dt.code IN ('city_break','historic'))
   OR (d.name='Viedeň'                 AND dt.code IN ('city_break','historic'))
   OR (d.name='Kodaň'                  AND dt.code IN ('city_break'))
   OR (d.name='Štokholm'               AND dt.code IN ('city_break','historic'))
   OR (d.name='Dublin'                 AND dt.code IN ('city_break','historic'))
   OR (d.name='Marrákeš'               AND dt.code IN ('adventure','historic','city_break'))
   OR (d.name='Petra (Wadi Musa)'      AND dt.code IN ('adventure','historic'))
   OR (d.name='Madeira (Funchal)'      AND dt.code IN ('adventure','mountains','sea_beach'))
   OR (d.name='Tenerife (Costa Adeje)' AND dt.code IN ('adventure','mountains','sea_beach'))
   OR (d.name='Kapadócia (Goreme)'     AND dt.code IN ('adventure','historic'))
   OR (d.name='Benátky'                AND dt.code IN ('historic','city_break','sea_beach'))
   OR (d.name='Sevilla'                AND dt.code IN ('historic','city_break'))
   OR (d.name='Valletta'               AND dt.code IN ('historic','city_break','sea_beach'))
   OR (d.name='Ľubľana'               AND dt.code IN ('city_break','historic','mountains'));

SET FOREIGN_KEY_CHECKS = 1;

-- -------------------------------------------------------
-- Done.
-- Current weather is fetched at runtime from Open-Meteo Forecast API.
-- Monthly climate averages are pre-seeded from Open-Meteo Archive API (year 2025).
-- -------------------------------------------------------
