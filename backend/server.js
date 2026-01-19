import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// sample API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from backend!' })
})

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`)
})
