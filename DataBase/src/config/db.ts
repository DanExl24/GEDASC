import { Pool } from 'pg'

// crear pool para conectar con la base de datos
const pool = new Pool({
  user: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'GEDASC'
});

// exportar pool
export const query = (text: string, params?: []) => {
  return pool.query(text, params)
}
