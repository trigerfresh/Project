import express from 'express'
import bcrypt from 'bcryptjs'
import sql from 'mssql'
import { generateToken } from '../utility/jwt.js'
import db from '../config/db.js'

const router = express.Router()

router.post('/signup', async (req, res) => {
  const { name, email, password, role } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const pool = await db
    await pool
      .request()
      .input('name', sql.NVarChar, name)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashedPassword)
      .input('role', sql.NVarChar, role)
      .query(`INSERT INTO Users(Name, Email, PasswordHash, Role)
        VALUES(@name, @email, @password, @role)`)

    res.json({ message: 'User created' })
  } catch (err) {
    res.status(500).json(err.message)
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  try {
    const pool = await db

    const result = await pool
      .request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE Email = @email')

    const user = result.recordset[0]
    if (!user) return res.status(404).json('User not found')

    const isMatch = await bcrypt.compare(password, user.PasswordHash)
    if (!isMatch) return res.status(400).json('Invalid credentials')
    const token = generateToken(user)
    res.json({ token, role: user.Role })
  } catch (err) {
    res.status(500).json(err.message)
  }
})

export default router
