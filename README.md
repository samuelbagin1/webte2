# WEBTE2 Coursework Projects

This repository contains projects, exercises, and reference materials created for the **Web Technologies 2 (WEBTE2)** course. The main assignments demonstrate full-stack web development using PHP, Laravel, Node.js, React, TypeScript, relational databases, REST APIs, WebSockets, authentication, external APIs, and deployment with Nginx.

## Repository Structure

| Directory | Description |
|---|---|
| [`task1and2`](task1and2/) | Full-stack system for managing Slovak Olympic athletes, their results, and user accounts. |
| [`task3`](task3/) | Real-time online curling game for two players. |
| [`task4`](task4/) | Vacation destination recommendation and comparison application. |
| [`zapocet`](zapocet/) | Small PHP REST API exercise for managing caves and mushrooms. |
| [`lib`](lib/) | Early PHP REST API examples, database schema, and Nginx configuration samples. |
| [`prednasky`](prednasky/) | Course lecture materials in PDF format. |

## Projects

### Task 1 and 2: Slovak Olympic Athletes

[`task1and2`](task1and2/) is a full-stack information system for browsing and managing Slovak Olympic athletes and their results. It combines the first two course assignments into one application.

Public users can browse athlete records, open athlete details, filter results by year, discipline, Olympic type, and placing, and sort or paginate the results. Authenticated users can manage athletes, Olympic events, disciplines, and result records, as well as import data from CSV or XLSX files.

The project also includes user registration and login, Google OAuth, JWT-based authorization, optional TOTP two-factor authentication, profile management, password changes, and login history.

**Main technologies**

- React, TypeScript, Vite, Tailwind CSS, and shadcn/ui frontend
- Custom PHP REST API organized into routers, controllers, models, middleware, and services
- MariaDB/MySQL database
- Composer packages for Google OAuth, TOTP authentication, QR codes, and spreadsheet imports
- Docker Compose with Nginx, PHP-FPM, MariaDB, and phpMyAdmin

**Important directories and files**

- [`task1and2/frontend`](task1and2/frontend/) - React single-page application
- [`task1and2/backend`](task1and2/backend/) - PHP REST API
- [`task1and2/database`](task1and2/database/) - database schema
- [`task1and2/docker-compose.yml`](task1and2/docker-compose.yml) - local development stack
- [`task1and2/README.txt`](task1and2/README.txt) - detailed dependencies and deployment notes

### Task 3: Online Curling Game

[`task3`](task3/) is a real-time online curling game for two players. Players join through separate browser sessions, are paired by the server, and take turns launching stones toward a target.

The playing field is rendered with the Canvas API, while Matter.js handles collisions, friction, wall rebounds, and stone movement. The Node.js server manages matchmaking, validates turns, forwards game events over WebSockets, handles pauses and restarts, detects disconnects, and stores completed games and throws in MySQL.

The application also provides rules, a lobby, a game interface, game-over results, and a statistics page. A shared JSON configuration controls the field, stones, target, shots, and physics behavior.

**Main technologies**

- React, TypeScript, Vite, Tailwind CSS, Canvas API, and Matter.js frontend
- Node.js, TypeScript, Express, and raw WebSockets using `ws`
- MySQL database for players, games, throws, and statistics
- Docker Compose for the client, server, and database
- Nginx and optional PM2 configuration for deployment

**Important directories and files**

- [`task3/client`](task3/client/) - game interface, rendering, input, and client-side physics
- [`task3/server`](task3/server/) - WebSocket game server, matchmaking, game rooms, and database access
- [`task3/database/dump.sql`](task3/database/dump.sql) - database schema
- [`task3/docker-compose.yml`](task3/docker-compose.yml) - local development stack
- [`task3/README.md`](task3/README.md) - detailed architecture, protocol, and deployment documentation

### Task 4: Vacation Destination Recommender

[`task4`](task4/) is a vacation recommendation application that helps users choose destinations based on trip type, travel dates, preferred temperature, and maximum flight duration from Vienna.

The backend scores matching destinations and stores searches and their results. Users can inspect destination details, compare selected destinations, and view information such as monthly climate, current weather, currency exchange rates, country details, and an optional AI-generated "Why now" explanation.

The application also tracks anonymized visits and provides statistics about visits, popular search preferences, and search activity.

**Main technologies**

- React, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, TanStack Table, and Recharts frontend
- PHP and Laravel REST API with Eloquent ORM, validation, caching, and PHPUnit tests
- MySQL database with seeded destination and climate data
- Open-Meteo, Frankfurter, REST Countries, and optional OpenAI API integrations
- Nginx and PHP-FPM deployment configuration

**Important directories and files**

- [`task4/frontend`](task4/frontend/) - destination search, results, details, comparison, and statistics UI
- [`task4/backend`](task4/backend/) - Laravel API, models, services, and tests
- [`task4/task4_setup.sql`](task4/task4_setup.sql) - database schema and seed data
- [`task4/README.txt`](task4/README.txt) - detailed deployment notes and API endpoint list

### Zápočet Exercise: Caves and Mushrooms API

[`zapocet`](zapocet/) is a small PHP REST API exercise built around caves and mushrooms. It demonstrates a lightweight router, controllers, models, JSON responses, CORS handling, input validation, and PDO database access.

The API can list caves with their mushrooms, create caves, list distinct mushroom types, add mushrooms to caves, and delete mushrooms.

**Available endpoints**

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/caves` | List caves and their associated mushrooms. |
| `POST` | `/api/caves` | Create or retrieve a cave using its name and discovery date. |
| `GET` | `/api/mushrooms/types` | List distinct mushroom types. |
| `POST` | `/api/mushrooms` | Add a mushroom to a cave. |
| `DELETE` | `/api/mushrooms/{id}` | Delete a mushroom. |

### Supporting Materials

#### `lib`

[`lib`](lib/) contains introductory course examples and reusable reference files:

- a basic procedural PHP REST API for athlete CRUD operations
- a simple HTML and JavaScript client for testing that API
- an SQL schema for the Olympic athlete application
- sample local and documentation Nginx configurations

#### `prednasky`

[`prednasky`](prednasky/) contains WEBTE2 lecture slides and other course materials in PDF format.

## Detailed Documentation

Each major assignment includes its original specification PDF and additional project-specific documentation:

- Task 1 and 2: [`task1and2/README.txt`](task1and2/README.txt)
- Task 3: [`task3/README.md`](task3/README.md) and [`task3/README.txt`](task3/README.txt)
- Task 4: [`task4/README.txt`](task4/README.txt)

Setup and deployment requirements differ between projects. Refer to the documentation inside the relevant project directory before running or deploying it.
