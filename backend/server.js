import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { verifyToken, authorizeRole } from './middleware/auth.js'
import authRoutes from './routes/auth.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use('/', authRoutes)

const PORT = 5000

app.get('/admin', verifyToken, authorizeRole(['admin']), (req, res) => {
  res.json('Welcome Admin.')
})

app.listen(PORT, () => {
  console.log(`Server running at @ ${PORT}`)
})
