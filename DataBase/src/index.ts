import express from 'express'

// importar rutas
import testRoutes from './routes/test.routes'

// crear la app
const app = express()
const PORT = 3000
app.use(express.json())

// Mensaje de activacion del servidor
app.get('/', (req, res) => {
  res.send('Servidor activo')
})

// Crear rutas para navegar entre las diferentes rutas hechas para los controladores
app.use('/api', testRoutes)

// Crear ruta del servidor para comprobar su activacion
app.listen(PORT, () => {
  console.log(` Servidor corriendo en http://localhost:${PORT}`)
})
