import express from 'express'
import testRoutes from './routes/test.routes'

const app = express()
const PORT = 3000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Servidor activo 🚀')
})

app.use('/api', testRoutes)

app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`)
})
