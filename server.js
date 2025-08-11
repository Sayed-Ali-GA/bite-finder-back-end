/* eslint-disable no-console */
const dotenv = require('dotenv')

dotenv.config()
const express = require('express')

const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const logger = require('morgan')

// Controllers
const authRouter = require('./controllers/auth')
const userRouter = require('./controllers/users')
const restaurantRouter= require("./controllers/restaurant")

// Middleware
const verifyToken = require('./middleware/verify-token')

// DB Connection
mongoose.connect(process.env.MONGODB_URI)

mongoose.connection.on('connected', () => {
	console.log(`Connected to MongoDB ${mongoose.connection.name}.`)
})

// MIDDLEWARE
app.use(cors())
app.use(express.json())
app.use(logger('dev'))
app.use("/restaurant",restaurantRouter)

// PUBLIC ROUTES
app.use('/auth', authRouter)

// PROTECTED ROUTES
app.use('/users', userRouter)

app.listen(3000, () => {
	console.log('The express app is ready!')
})
