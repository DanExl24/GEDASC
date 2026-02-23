import { Pool } from 'pg'

const pool = new Pool({
  user: 'postgres',
  password: '',
  host: 'localhost',
  port: 5432, // default Postgres port
  database: 'GEDASC'
});


export const query = (text: string, params?: []) => {
  return pool.query(text, params)
}
