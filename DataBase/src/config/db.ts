import { Pool } from 'pg'

// crear pool para conectar con la base de datos
export const pool = new Pool({
  user: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'GEDASC'
});

