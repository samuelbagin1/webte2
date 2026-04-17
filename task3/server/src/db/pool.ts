import 'dotenv/config';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER     ?? 'curling_user',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME     ?? 'curling_game',
});

export default pool;
