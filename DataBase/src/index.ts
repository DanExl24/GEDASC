import express from 'express'
import cors from 'cors'
import testRoutes from './routes/test.routes'
import QueryId from './routes/QueryId.routes'
import EntryRecord from './routes/entry.routes'

const app = express()
const PORT = 3000
app.use(express.json())
app.use(cors());

app.get('/', (req, res) => {
  res.send('Servidor activo')
})

app.use('/api', testRoutes)
app.use('/api/aprendiz',QueryId)
app.use('/api/registroIngresos',EntryRecord)

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
