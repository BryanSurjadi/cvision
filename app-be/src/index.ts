import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import submissionRoutes from './routes/submission.routes'
import candidateRoutes from './routes/candidate.routes'
import bookmarkRoutes from './routes/bookmark.routes'
import notificationRoutes from './routes/notification.routes'
import userRoutes from './routes/user.routes'
import statsRoutes from './routes/stats.routes'
import { errorHandler } from './middlewares/error.middleware'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use('/api/auth', authRoutes)
app.use('/api/submission', submissionRoutes)
app.use('/api/candidates', candidateRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/users', userRoutes)
app.use('/api/stats', statsRoutes)
// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CVision API is running' })
})

app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app