-- phpMyAdmin SQL Dump
-- version 5.2.2deb1+noble1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 12, 2026 at 04:30 PM
-- Server version: 10.11.14-MariaDB-0ubuntu0.24.04.1
-- PHP Version: 8.4.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `athlete`
--

CREATE TABLE `athlete` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `surname` varchar(50) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `birth_place` varchar(80) DEFAULT NULL,
  `birth_country_id` int(11) DEFAULT NULL,
  `death_date` date DEFAULT NULL,
  `death_place` varchar(80) DEFAULT NULL,
  `death_country_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `athlete`
--

INSERT INTO `athlete` (`id`, `name`, `surname`, `birth_date`, `birth_place`, `birth_country_id`, `death_date`, `death_place`, `death_country_id`) VALUES
(1, 'Alojz', 'Szokol', '1922-03-07', 'Hronec', 1, '1932-10-27', 'Bernecebaráti', 2),
(2, 'Zoltán', 'Halmaj', '1922-03-07', 'Vysoká pri Morave', 1, '1956-05-20', 'Budapešť', 2),
(3, 'Alexander', 'Prokopp', '1922-03-07', 'Košice', 1, '1950-11-04', 'Budapešť', 2),
(4, 'Július', 'Torma', '1922-03-07', 'Budapešť', 2, '1991-10-23', 'Praha', 6),
(5, 'Ján', 'Zachara', '1928-08-27', 'Kubrá pri Trenčíne', 1, '2025-01-02', 'Nová Dubnica', 1),
(6, 'Anton', 'Švajlen', '1937-12-03', 'Solčany', 1, NULL, NULL, NULL),
(7, 'Anton', 'Urban', '1934-01-16', 'Kysucké Nové Mesto', 1, '2021-03-05', 'Bratislava', 1),
(8, 'Vladimír', 'Dzurilla', '1942-02-22', 'Bratislava', 1, '1995-07-27', 'Düsseldorf', 10),
(9, 'Jozef', 'Golonka', '1938-01-06', 'Bratislava', 1, NULL, NULL, NULL),
(10, 'Ondrej', 'Nepela', '1951-01-22', 'Bratislava', 1, '1989-02-02', 'Mannheim', 10),
(11, 'Eva', 'Šuranová', '1946-12-16', 'Ózd', 2, '2016-12-31', 'Bratislava', 1),
(12, 'Anton', 'Tkáč', '1951-03-30', 'Lozorno', 1, '2022-12-22', 'Bratislava', 1),
(13, 'František', 'Kunzo', '1954-09-17', 'Spišský Hrušov', 1, NULL, NULL, NULL),
(14, 'Stanislav', 'Seman', '1952-08-06', 'Košice', 1, NULL, NULL, NULL),
(15, 'Imrich', 'Bugár', '1955-04-14', 'Ohrady', 1, NULL, NULL, NULL),
(16, 'Igor', 'Liba', '1960-11-04', 'Prešov', 1, NULL, NULL, NULL),
(17, 'Vincent', 'Lukáč', '1954-02-14', 'Košice', 1, NULL, NULL, NULL),
(18, 'Dušan', 'Pašek', '1960-09-07', 'Bratislava', 1, '1998-03-14', 'Bratislava', 1),
(19, 'Dárius', 'Rusnák', '1959-12-02', 'Ružomberok', 1, NULL, NULL, NULL),
(20, 'Miloslav', 'Mečíř', '1964-05-19', 'Bojnice', 1, NULL, NULL, NULL),
(21, 'Jozef', 'Pribilinec', '1960-07-06', 'Kopernica', 1, NULL, NULL, NULL),
(22, 'Miloš', 'Mečíř', '1964-05-19', 'Bojnice', 1, NULL, NULL, NULL),
(23, 'Michal', 'Martikán', '1979-05-18', 'Liptovský Mikuláš', 1, NULL, NULL, NULL),
(24, 'Slavomír', 'Kňazovický', '1967-05-03', 'Piešťany', 1, NULL, NULL, NULL),
(25, 'Jozef', 'Gönci', '1974-03-18', 'Košice', 1, NULL, NULL, NULL),
(26, 'Elena', 'Kaliská', '1972-01-19', 'Zvolen', 1, NULL, NULL, NULL),
(27, 'Peter', 'Hochschorner', '1979-09-07', 'Bratislava', 1, NULL, NULL, NULL),
(28, 'Pavol', 'Hochschorner', '1979-09-07', 'Bratislava', 1, NULL, NULL, NULL),
(29, 'Martina', 'Moravcová', '1976-01-16', 'Piešťany', 1, NULL, NULL, NULL),
(30, 'Juraj', 'Minčík', '1977-03-27', 'Spišská Nová Ves', 1, NULL, NULL, NULL),
(31, 'Jozef', 'Krnáč', '1977-12-30', 'Bratislava', 1, NULL, NULL, NULL),
(32, 'Juraj', 'Bača', '1977-03-17', 'Komárno', 1, NULL, NULL, NULL),
(33, 'Michal', 'Riszdorfer', '1977-07-01', 'Bratislava', 1, NULL, NULL, NULL),
(34, 'Richard', 'Riszdorfer', '1981-03-17', 'Komárno', 1, NULL, NULL, NULL),
(35, 'Erik', 'Vlček', '1981-12-29', 'Komárno', 1, NULL, NULL, NULL),
(36, 'Radoslav', 'Židek', '1981-10-15', 'Žilina', 1, NULL, NULL, NULL),
(37, 'Zuzana', 'Štefečeková', '1984-01-15', 'Nitra', 1, NULL, NULL, NULL),
(38, 'Juraj', 'Tarr', '1979-02-18', 'Komárno', 1, NULL, NULL, NULL),
(39, 'David', 'Musuľbes', '1972-07-02', 'Vladi-kaukaz', 20, NULL, NULL, NULL),
(40, 'Anastasiya', 'Kuzmina', '1984-08-28', 'Ťumeň', 14, NULL, NULL, NULL),
(41, 'Pavol', 'Hurajt', '1978-02-04', 'Poprad', 1, NULL, NULL, NULL),
(42, 'Danka', 'Barteková', '1984-10-19', 'Trenčín', 1, NULL, NULL, NULL),
(43, 'Ladislav', 'Škantár', '1983-02-11', 'Kežmarok', 1, NULL, NULL, NULL),
(44, 'Peter', 'Škantár', '1982-07-20', 'Kežmarok', 1, NULL, NULL, NULL),
(45, 'Matej', 'Tóth', '1983-02-10', 'Nitra', 1, NULL, NULL, NULL),
(46, 'Matej', 'Beňuš', '1987-11-02', 'Bratislava', 1, NULL, NULL, NULL),
(47, 'Tibor', 'Linka', '1995-02-13', 'Šamorín', 1, NULL, NULL, NULL),
(48, 'Denis', 'Myšák', '1995-11-30', 'Bojnice', 1, NULL, NULL, NULL),
(49, 'Zuzana', 'Rehák-Štefečeková', '1984-01-15', 'Nitra', 1, NULL, NULL, NULL),
(50, 'Jakub', 'Grigar', '1997-04-27', 'Liptovský Mikuláš', 1, NULL, NULL, NULL),
(51, 'Rory', 'Sabbatini', '1976-04-02', 'Durban', 23, NULL, NULL, NULL),
(52, 'Samuel', 'Baláž', '1998-08-25', 'Bratislava', 1, NULL, NULL, NULL),
(53, 'Adam', 'Botek', '1997-03-05', 'Komárno', 1, NULL, NULL, NULL),
(54, 'Petra', 'Vlhová', '1995-06-13', 'Liptovský Mikuláš', 1, NULL, NULL, NULL),
(55, 'Peter', 'Cehlárik', '1995-08-02', 'Žilina', 1, NULL, NULL, NULL),
(56, 'Michal', 'Čajkovský', '1992-05-06', 'Bratislava', 1, NULL, NULL, NULL),
(57, 'Peter', 'Čerešňák', '1993-01-26', 'Trenčín', 1, NULL, NULL, NULL),
(58, 'Marek', 'Ďaloga', '1989-04-04', 'Zvolen', 1, NULL, NULL, NULL),
(59, 'Marko', 'Daňo', '1994-11-30', 'Eisenstadt', 11, NULL, NULL, NULL),
(60, 'Martin', 'Gernát', '1993-04-11', 'Košice', 1, NULL, NULL, NULL),
(61, 'Adrián', 'Holešinský', '1996-02-11', 'Čadca', 1, NULL, NULL, NULL),
(62, 'Marek', 'Hrivík', '1991-08-28', 'Čadca', 1, NULL, NULL, NULL),
(63, 'Libor', 'Hudáček', '1990-09-07', 'Levoča', 1, NULL, NULL, NULL),
(64, 'Tomáš', 'Jurčo', '1992-12-28', 'Košice', 1, NULL, NULL, NULL),
(65, 'Miloš', 'Kelemen', '1999-07-06', 'Lučenec', 1, NULL, NULL, NULL),
(66, 'Samuel', 'Kňažko', '2002-08-07', 'Trenčín', 1, NULL, NULL, NULL),
(67, 'Branislav', 'Konrád', '1987-10-10', 'Nitra', 1, NULL, NULL, NULL),
(68, 'Michal', 'Krištof', '1993-10-11', 'Nitra', 1, NULL, NULL, NULL),
(69, 'Martin', 'Marinčin', '1992-02-18', 'Košice', 1, NULL, NULL, NULL),
(70, 'Šimon', 'Nemec', '2004-02-15', 'Liptovský Mikuláš', 1, NULL, NULL, NULL),
(71, 'Kristián', 'Pospíšil', '1996-04-22', 'Zvolen', 1, NULL, NULL, NULL),
(72, 'Pavol', 'Regenda', '1999-12-07', 'Michalovce', 1, NULL, NULL, NULL),
(73, 'Miloš', 'Roman', '1999-10-13', 'Kysucké Nové Mesto', 1, NULL, NULL, NULL),
(74, 'Mislav', 'Rosandič', '1995-01-26', 'Záhreb', 24, NULL, NULL, NULL),
(75, 'Patrik', 'Rybár', '1993-11-09', 'Skalica', 1, NULL, NULL, NULL),
(76, 'Juraj', 'Slafkovský', '2004-03-30', 'Košice', 1, NULL, NULL, NULL),
(77, 'Samuel', 'Takáč', '1991-12-03', 'Prievidza', 1, NULL, NULL, NULL),
(78, 'Matej', 'Tomek', '1997-05-24', 'Bratislava', 1, NULL, NULL, NULL),
(79, 'Peter', 'Zuzin', '1990-09-04', 'Zvolen', 1, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `athlete_record`
--

CREATE TABLE `athlete_record` (
  `id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `olympics_id` int(11) NOT NULL,
  `discipline_id` int(11) NOT NULL,
  `placing` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `athlete_record`
--

INSERT INTO `athlete_record` (`id`, `athlete_id`, `olympics_id`, `discipline_id`, `placing`) VALUES
(1, 1, 1, 1, 3),
(2, 2, 2, 2, 1),
(3, 3, 3, 3, 1),
(4, 4, 4, 4, 1),
(5, 5, 5, 5, 1),
(6, 6, 6, 6, 2),
(7, 7, 6, 6, 2),
(8, 8, 7, 7, 3),
(9, 9, 7, 7, 3),
(10, 10, 7, 8, 22),
(11, 10, 8, 8, 8),
(12, 10, 9, 8, 1),
(13, 11, 10, 9, 3),
(14, 12, 11, 10, 1),
(15, 13, 12, 6, 1),
(16, 14, 12, 6, 1),
(17, 15, 12, 11, 2),
(18, 16, 13, 7, 2),
(19, 17, 13, 7, 2),
(20, 18, 13, 7, 2),
(21, 19, 13, 7, 2),
(22, 20, 14, 12, 1),
(23, 21, 14, 13, 1),
(24, 22, 14, 14, 3),
(25, 23, 15, 15, 1),
(26, 24, 15, 16, 2),
(27, 25, 15, 17, 3),
(28, 26, 15, 18, 19),
(29, 27, 16, 19, 1),
(30, 28, 16, 19, 1),
(31, 23, 16, 15, 2),
(32, 29, 16, 20, 2),
(33, 29, 16, 21, 2),
(34, 30, 16, 15, 3),
(35, 26, 16, 18, 4),
(36, 27, 17, 19, 1),
(37, 28, 17, 19, 1),
(38, 26, 17, 18, 1),
(39, 31, 17, 22, 2),
(40, 23, 17, 15, 2),
(41, 32, 17, 23, 3),
(42, 25, 17, 24, 3),
(43, 33, 17, 23, 3),
(44, 34, 17, 23, 3),
(45, 35, 17, 23, 3),
(46, 36, 18, 25, 2),
(47, 27, 19, 19, 1),
(48, 28, 19, 19, 1),
(49, 26, 19, 18, 1),
(50, 23, 19, 15, 1),
(51, 34, 19, 23, 2),
(52, 33, 19, 23, 2),
(53, 37, 19, 26, 2),
(54, 38, 19, 23, 2),
(55, 35, 19, 23, 2),
(56, 39, 19, 27, 3),
(57, 40, 20, 28, 1),
(58, 41, 20, 29, 2),
(59, 40, 20, 30, 2),
(60, 41, 20, 31, 3),
(61, 37, 21, 26, 2),
(62, 42, 21, 32, 3),
(63, 27, 21, 19, 3),
(64, 28, 21, 19, 3),
(65, 23, 21, 15, 3),
(66, 40, 22, 28, 1),
(67, 43, 23, 19, 1),
(68, 44, 23, 19, 1),
(69, 45, 23, 33, 1),
(70, 46, 23, 15, 2),
(71, 47, 23, 34, 2),
(72, 48, 23, 34, 2),
(73, 38, 23, 34, 2),
(74, 35, 23, 34, 2),
(75, 40, 24, 31, 1),
(76, 40, 24, 30, 2),
(77, 40, 24, 35, 2),
(78, 49, 25, 26, 1),
(79, 50, 25, 18, 2),
(80, 51, 25, 36, 2),
(81, 52, 25, 23, 3),
(82, 53, 25, 23, 3),
(83, 48, 25, 23, 3),
(84, 35, 25, 23, 3),
(85, 54, 26, 37, 1),
(86, 55, 26, 7, 3),
(87, 56, 26, 7, 3),
(88, 57, 26, 7, 3),
(89, 58, 26, 7, 3),
(90, 59, 26, 7, 3),
(91, 60, 26, 7, 3),
(92, 61, 26, 7, 3),
(93, 62, 26, 7, 3),
(94, 63, 26, 7, 3),
(95, 64, 26, 7, 3),
(96, 65, 26, 7, 3),
(97, 66, 26, 7, 3),
(98, 67, 26, 7, 3),
(99, 68, 26, 7, 3),
(100, 69, 26, 7, 3),
(101, 70, 26, 7, 3),
(102, 71, 26, 7, 3),
(103, 72, 26, 7, 3),
(104, 73, 26, 7, 3),
(105, 74, 26, 7, 3),
(106, 75, 26, 7, 3),
(107, 76, 26, 7, 3),
(108, 77, 26, 7, 3),
(109, 78, 26, 7, 3),
(110, 79, 26, 7, 3),
(111, 46, 27, 15, 3);

-- --------------------------------------------------------

--
-- Table structure for table `country`
--

CREATE TABLE `country` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `country`
--

INSERT INTO `country` (`id`, `name`) VALUES
(1, 'Slovensko'),
(2, 'Maďarsko'),
(3, 'Grécko'),
(4, 'Spojené Štáty Americké'),
(5, 'Švédsko'),
(6, 'Česko'),
(7, 'Spojené Kráľovstvo'),
(8, 'Fínsko'),
(9, 'Japonsko'),
(10, 'Nemecko'),
(11, 'Rakúsko'),
(12, 'Francúzsko'),
(13, 'Kanada'),
(14, 'Sovietsky zväz'),
(15, 'Juhoslávia'),
(16, 'Južná Kórea'),
(17, 'Austrália'),
(18, 'Taliansko'),
(19, 'Čína'),
(20, 'Rusko'),
(21, 'Brazília'),
(22, 'Kórea'),
(23, 'Južná Afrika'),
(24, 'Chorvátsko'),
(25, 'Mexiko'),
(26, 'Španielsko'),
(27, 'Nórsko');

-- --------------------------------------------------------

--
-- Table structure for table `discipline`
--

CREATE TABLE `discipline` (
  `id` int(11) NOT NULL,
  `name` varchar(80) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `discipline`
--

INSERT INTO `discipline` (`id`, `name`) VALUES
(1, 'atletika - beh na 100 m'),
(2, 'plávanie - 50 yd v.sp.'),
(3, 'športová streľba - vojenská puška'),
(4, 'box do 67 kg'),
(5, 'box do 57 kg'),
(6, 'futbal'),
(7, 'ľadový hokej'),
(8, 'krasokorčuľovanie'),
(9, 'atletika - skok do diaľky'),
(10, 'dráhová cyklistika - šprint'),
(11, 'atletika - hod diskom'),
(12, 'tenis - dvojhra'),
(13, 'atletika - chôdza na 20 km'),
(14, 'tenis - štvorhra'),
(15, 'vodný slalom - C1'),
(16, 'rýchlostná kanoistika - C1 500m'),
(17, 'športová streľba - ľubovoľná malokalibrovka 60'),
(18, 'vodný slalom - K1'),
(19, 'vodný slalom - C2'),
(20, 'plávanie - 100 m motýlik'),
(21, 'plávanie - 200 m v.sp.'),
(22, 'judo - do 66 kg'),
(23, 'rýchlostná kanoistika - K4'),
(24, 'športová streľba - vzduchová puška 10'),
(25, 'snowboarding - snowboardcross'),
(26, 'športová streľba - trap'),
(27, 'zápasenie - voľný štýl do 120 kg'),
(28, 'biatlon - šprint na 7.5 km'),
(29, 'biatlon - šprint'),
(30, 'biatlon - stíhacie preteky na 10 km'),
(31, 'biatlon - hromadný štart'),
(32, 'športová streľba - skeet'),
(33, 'atletika - chôdza na 50 km'),
(34, 'kanoistika - K4 na 1000m'),
(35, 'biatlon - vytrvalostné preteky na 15 km'),
(36, 'golf'),
(37, 'zjazdové lyžovanie - slalom');

-- --------------------------------------------------------

--
-- Table structure for table `login_history`
--

CREATE TABLE `login_history` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `login_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `method` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `login_history`
--

INSERT INTO `login_history` (`id`, `user_id`, `login_at`, `method`) VALUES
(1, 1, '2026-03-11 19:21:08', 'LOCAL'),
(2, 2, '2026-03-11 19:27:11', 'OAUTH'),
(3, 2, '2026-03-11 19:27:35', 'OAUTH'),
(4, 1, '2026-03-11 19:36:53', 'LOCAL'),
(5, 2, '2026-03-11 19:48:54', 'OAUTH'),
(6, 2, '2026-03-11 20:11:32', 'OAUTH');

-- --------------------------------------------------------

--
-- Table structure for table `olympics`
--

CREATE TABLE `olympics` (
  `id` int(11) NOT NULL,
  `type` enum('LOH','ZOH') NOT NULL,
  `year` int(11) NOT NULL,
  `city` varchar(80) NOT NULL,
  `country_id` int(11) NOT NULL,
  `code` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `olympics`
--

INSERT INTO `olympics` (`id`, `type`, `year`, `city`, `country_id`, `code`) VALUES
(1, 'LOH', 1896, 'Atény', 3, 'GRC'),
(2, 'LOH', 1904, 'St. Louis', 4, 'USA'),
(3, 'LOH', 1912, 'Štokholm', 5, 'SWE'),
(4, 'LOH', 1948, 'Londýn', 7, 'GBR'),
(5, 'LOH', 1952, 'Helsinki', 8, 'FIN'),
(6, 'LOH', 1964, 'Tokio', 9, 'JPN'),
(7, 'ZOH', 1964, 'Innsbruck', 11, 'AUT'),
(8, 'ZOH', 1968, 'Grenoble', 12, 'FRA'),
(9, 'ZOH', 1972, 'Sapporo', 9, 'JPN'),
(10, 'LOH', 1972, 'Mníchov', 10, 'DEU'),
(11, 'LOH', 1976, 'Montreal', 13, 'CAN'),
(12, 'LOH', 1980, 'Moskva', 14, 'SUN'),
(13, 'ZOH', 1984, 'Sarajevo', 15, 'YUG'),
(14, 'LOH', 1988, 'Soul', 16, 'KOR'),
(15, 'LOH', 1996, 'Atlanta', 4, 'USA'),
(16, 'LOH', 2000, 'Sydney', 17, 'AUS'),
(17, 'LOH', 2004, 'Atény', 3, 'GRC'),
(18, 'ZOH', 2006, 'Turín', 18, 'ITA'),
(19, 'LOH', 2008, 'Peking/Hongkong', 19, 'CHN'),
(20, 'ZOH', 2010, 'Vancouver', 13, 'CAN'),
(21, 'LOH', 2012, 'Londýn', 7, 'GBR'),
(22, 'ZOH', 2014, 'Soči', 20, 'RUS'),
(23, 'LOH', 2016, 'Rio de Janeiro', 21, 'BRA'),
(24, 'ZOH', 2018, 'Pjongčang', 22, 'PRK'),
(25, 'LOH', 2020, 'Tokio', 9, 'JPN'),
(26, 'ZOH', 2022, 'Peking', 19, 'CHN'),
(27, 'LOH', 2024, 'Paríž', 12, 'FRA'),
(28, 'LOH', 1956, 'Melbourne', 17, 'AUS'),
(29, 'LOH', 1960, 'Rím', 18, 'ITA'),
(30, 'LOH', 1968, 'Mexiko', 25, 'MEX'),
(31, 'LOH', 1984, 'Los Angeles', 4, 'USA'),
(32, 'LOH', 1992, 'Barcelona', 26, 'ESP'),
(33, 'ZOH', 1976, 'Innsbruck', 11, 'AUT'),
(34, 'ZOH', 1980, 'Lake Placid', 4, 'USA'),
(35, 'ZOH', 1988, 'Calgary', 13, 'CAN'),
(36, 'ZOH', 1992, 'Albertville', 12, 'FRA'),
(37, 'ZOH', 1994, 'Lillehammer', 27, 'NOR'),
(38, 'ZOH', 1998, 'Nagano', 9, 'JPN'),
(39, 'ZOH', 2002, 'Salt Lake City', 4, 'USA'),
(40, 'ZOH', 2026, 'Milano/Cortina', 18, 'ITA');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `totp_secret` varchar(255) DEFAULT NULL,
  `totp_enabled` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `google_id`, `totp_secret`, `totp_enabled`, `created_at`) VALUES
(1, 'sam', 'bag', 'a@samuelbagin.xyz', '$argon2id$v=19$m=65536,t=4,p=1$cUlTTmlmZ0xROEhyem9oVA$pHQLjHRqocFGFIJmfB3N5DEs1bV02jOUTb1DHXoCc/E', NULL, 'TQAWRWDNAVOY75BETAKHXNIENBHLIT3L', 0, '2026-03-11 19:20:33'),
(2, 'Samuell', 'Bagín', 'samuel.bagin1@gmail.com', NULL, NULL, NULL, 0, '2026-03-11 19:27:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `athlete`
--
ALTER TABLE `athlete`
  ADD PRIMARY KEY (`id`),
  ADD KEY `birth_country_id` (`birth_country_id`),
  ADD KEY `death_country_id` (`death_country_id`);

--
-- Indexes for table `athlete_record`
--
ALTER TABLE `athlete_record`
  ADD PRIMARY KEY (`id`),
  ADD KEY `athlete_id` (`athlete_id`),
  ADD KEY `olympics_id` (`olympics_id`),
  ADD KEY `discipline_id` (`discipline_id`);

--
-- Indexes for table `country`
--
ALTER TABLE `country`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `discipline`
--
ALTER TABLE `discipline`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `login_history`
--
ALTER TABLE `login_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `olympics`
--
ALTER TABLE `olympics`
  ADD PRIMARY KEY (`id`),
  ADD KEY `country_id` (`country_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_email` (`email`),
  ADD UNIQUE KEY `uq_google_id` (`google_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `athlete`
--
ALTER TABLE `athlete`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `athlete_record`
--
ALTER TABLE `athlete_record`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `country`
--
ALTER TABLE `country`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `discipline`
--
ALTER TABLE `discipline`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `login_history`
--
ALTER TABLE `login_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `olympics`
--
ALTER TABLE `olympics`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `athlete`
--
ALTER TABLE `athlete`
  ADD CONSTRAINT `athlete_ibfk_1` FOREIGN KEY (`birth_country_id`) REFERENCES `country` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `athlete_ibfk_2` FOREIGN KEY (`death_country_id`) REFERENCES `country` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `athlete_record`
--
ALTER TABLE `athlete_record`
  ADD CONSTRAINT `athlete_record_ibfk_1` FOREIGN KEY (`athlete_id`) REFERENCES `athlete` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `athlete_record_ibfk_2` FOREIGN KEY (`olympics_id`) REFERENCES `olympics` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `athlete_record_ibfk_3` FOREIGN KEY (`discipline_id`) REFERENCES `discipline` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `login_history`
--
ALTER TABLE `login_history`
  ADD CONSTRAINT `login_history_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `olympics`
--
ALTER TABLE `olympics`
  ADD CONSTRAINT `olympics_ibfk_1` FOREIGN KEY (`country_id`) REFERENCES `country` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
